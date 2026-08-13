import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/payment'
import { Pool } from 'pg'

// YooKassa webhook source IP ranges (official)
// https://yookassa.ru/developers/using-api/webhooks
const YOOKASSA_IP_RANGES = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
]

// Боевой режим определяется явно: YooKassa настроен и это НЕ test_shop_id.
const isTestMode = !process.env.YOOKASSA_SHOP_ID || process.env.YOOKASSA_SHOP_ID === 'test_shop_id'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  }
  return pool
}

function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/')
  const bits = parseInt(bitsStr, 10)
  const ipParts = ip.split('.').map(Number)
  const rangeParts = range.split('.').map(Number)
  if (ipParts.length !== 4 || rangeParts.length !== 4) return false

  const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]
  const rangeNum = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3]
  const mask = bits === 32 ? 0xFFFFFFFF : ~((1 << (32 - bits)) - 1) >>> 0
  return (ipNum & mask) === (rangeNum & mask)
}

function isYooKassaIp(ip: string): boolean {
  const cleanIp = ip.replace(/^::ffff:/, '')
  return YOOKASSA_IP_RANGES.some(range => isIpInCidr(cleanIp, range))
}

/**
 * POST /api/payment/webhook
 *
 * Обработка уведомлений YooKassa. Безопасность:
 *   1. Проверка source IP по официальным CIDR YooKassa.
 *   2. Whitelist событий.
 *   3. RE-VERIFY статуса через YooKassa API (не доверяем payload).
 *   4. Идемпотентность (не обрабатываем уже оплаченные order'ы).
 *
 * Все операции с БД — прямым SQL (Payload API требует admin/manager).
 */
export async function POST(request: NextRequest) {
  try {
    // === SECURITY CHECK 1: Source IP verification ===
    if (!isTestMode) {
      const clientIp =
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ''
      if (!clientIp || !isYooKassaIp(clientIp)) {
        console.warn(`[webhook] Rejected: IP ${clientIp} not in YooKassa ranges`)
        return NextResponse.json({ received: true, ignored: true })
      }
    }

    const body = await request.json()
    const { event, object } = body

    // === SECURITY CHECK 2: Validate event ===
    if (!event || !['payment.succeeded', 'payment.waiting_for_capture', 'payment.canceled'].includes(event)) {
      console.warn(`[webhook] Unknown event: ${event}`)
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
    }

    const paymentId = object?.id
    if (!paymentId || typeof paymentId !== 'string' || paymentId.length < 5) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 })
    }

    console.log(`[webhook] ${event}, payment: ${paymentId}`)

    const db = getPool()

    if (event === 'payment.canceled') {
      await db.query(
        "UPDATE orders SET status = 'cancelled', yookassa_status = 'canceled', updated_at = NOW() WHERE payment_id = $1",
        [paymentId]
      )
      return NextResponse.json({ received: true })
    }

    // === SECURITY CHECK 3: Re-verify payment via YooKassa API ===
    const status = await checkPaymentStatus(paymentId)
    if (!status.paid || status.status !== 'succeeded') {
      console.warn(`[webhook] Payment ${paymentId} not actually paid (status=${status.status})`)
      return NextResponse.json({ received: true, ignored: true })
    }

    // Найти order по payment_id
    const orderRes = await db.query(
      'SELECT id, user_id, course_id, amount, status FROM orders WHERE payment_id = $1 LIMIT 1',
      [paymentId]
    )
    const order = orderRes.rows[0]

    if (!order) {
      console.error(`[webhook] Order not found for payment: ${paymentId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // === SECURITY CHECK 4: Idempotency ===
    if (order.status === 'paid') {
      console.log(`[webhook] Order ${order.id} already paid, skipping`)
      return NextResponse.json({ received: true, alreadyProcessed: true })
    }

    // Обновить статус order
    const paymentMethod = object?.payment_method?.type || 'unknown'
    await db.query(
      `UPDATE orders SET status = 'paid', yookassa_status = $1, payment_method = $2, updated_at = NOW() WHERE id = $3`,
      [status.status, paymentMethod, order.id]
    )

    // Создать enrollment для курса (если ещё нет)
    if (order.course_id) {
      const existingEnroll = await db.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1',
        [order.user_id, order.course_id]
      )
      if (existingEnroll.rows.length === 0) {
        await db.query(
          'INSERT INTO enrollments (user_id, course_id, progress, created_at, updated_at) VALUES ($1, $2, 0, NOW(), NOW())',
          [order.user_id, order.course_id]
        )

        // Email-уведомление о зачислении (fire-and-forget)
        try {
          const { sendEmail, enrollmentEmail, paymentSuccessEmail } = await import('@/lib/email')
          const userRes = await db.query('SELECT email, name FROM users WHERE id = $1', [order.user_id])
          const courseRes = await db.query('SELECT title FROM courses WHERE id = $1', [order.course_id])
          const u = userRes.rows[0]
          const c = courseRes.rows[0]
          if (u?.email && c?.title) {
            await sendEmail({ to: u.email, ...enrollmentEmail(u.name, c.title) })
            await sendEmail({ to: u.email, ...paymentSuccessEmail(u.name, c.title, order.amount) })
          }
        } catch (emailErr) {
          console.error('[webhook] Email error:', emailErr)
        }
      }
    }

    console.log(`[webhook] Payment completed: order ${order.id}, payment ${paymentId}`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhook] error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
