import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/payment'
import { sendEmail, enrollmentEmail, paymentSuccessEmail } from '@/lib/email'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

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

// Test mode bypass — when YooKassa not configured, allow localhost
const isTestMode = !process.env.YOOKASSA_SHOP_ID || process.env.YOOKASSA_SHOP_ID === 'test_shop_id'

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
  // Strip IPv6 prefix if present (nginx usually forwards ::ffff:IPv4)
  const cleanIp = ip.replace(/^::ffff:/, '')
  return YOOKASSA_IP_RANGES.some(range => isIpInCidr(cleanIp, range))
}

async function payloadApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) throw new Error(`Payload API error: ${res.status}`)
  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    // === SECURITY CHECK 1: Source IP verification ===
    // In test mode allow any IP (for local dev/testing)
    if (!isTestMode) {
      const clientIp =
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ''
      if (!clientIp || !isYooKassaIp(clientIp)) {
        console.warn(`[webhook] Rejected: IP ${clientIp} not in YooKassa ranges`)
        // Return 200 to avoid YooKassa retries, but don't process
        return NextResponse.json({ received: true, ignored: true })
      }
    }

    const body = await request.json()
    const { event, object } = body

    // === SECURITY CHECK 2: Validate event & paymentId format ===
    if (!event || !['payment.succeeded', 'payment.waiting_for_capture', 'payment.canceled'].includes(event)) {
      console.warn(`[webhook] Unknown event: ${event}`)
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
    }

    const paymentId = object?.id
    if (!paymentId || typeof paymentId !== 'string' || paymentId.length < 5) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 })
    }

    console.log(`Webhook: ${event}, payment: ${paymentId}`)

    if (event === 'payment.canceled') {
      const ordersData = await payloadApi(`/orders?where[paymentId][equals]=${paymentId}&limit=10`)
      for (const order of ordersData.docs || []) {
        await payloadApi(`/orders/${order.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled', yookassaStatus: 'canceled' }),
        })
      }
      return NextResponse.json({ received: true })
    }

    // === SECURITY CHECK 3: Re-verify payment status via YooKassa API ===
    // NEVER trust webhook payload alone — always fetch authoritative status from YooKassa
    const status = await checkPaymentStatus(paymentId)
    if (!status.paid || status.status !== 'succeeded') {
      console.warn(`[webhook] Payment ${paymentId} not actually paid (status=${status.status}, paid=${status.paid})`)
      return NextResponse.json({ received: true, ignored: true })
    }

    // Find order by paymentId
    const ordersData = await payloadApi(`/orders?where[paymentId][equals]=${paymentId}&limit=1&depth=1`)
    const order = ordersData.docs?.[0]

    if (!order) {
      console.error(`[webhook] Order not found for payment: ${paymentId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // === SECURITY CHECK 4: Idempotency — don't re-process already paid orders ===
    if (order.status === 'paid') {
      console.log(`[webhook] Order ${order.id} already paid, skipping (idempotent)`)
      return NextResponse.json({ received: true, alreadyProcessed: true })
    }

    // Update order status
    await payloadApi(`/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'paid',
        yookassaStatus: status.status,
        paymentMethod: object?.payment_method?.type || 'unknown',
      }),
    })

    // Create enrollment if not exists (only for course orders)
    if (order.course) {
      const courseId = typeof order.course === 'object' ? order.course.id : order.course
      const userId = typeof order.user === 'object' ? order.user.id : order.user

      const existing = await payloadApi(`/enrollments?where[user][equals]=${userId}&where[course][equals]=${courseId}&limit=1`)
      if (existing.docs?.length === 0) {
        await payloadApi('/enrollments', {
          method: 'POST',
          body: JSON.stringify({ user: userId, course: courseId, progress: 0 }),
        })

        const courseData = await payloadApi(`/courses/${courseId}`)
        const userData = await payloadApi(`/users/${userId}`)
        if (userData?.email && courseData?.title) {
          sendEmail({ to: userData.email, ...enrollmentEmail(userData.name, courseData.title) }).catch(console.error)
        }
      }

      // Send payment success email
      const userData = await payloadApi(`/users/${typeof order.user === 'object' ? order.user.id : order.user}`)
      const courseData = await payloadApi(`/courses/${courseId}`)
      if (userData?.email && courseData?.title) {
        const paymentEmail = paymentSuccessEmail(userData.name, courseData.title, order.amount)
        sendEmail({ to: userData.email, ...paymentEmail }).catch(console.error)
      }
    }

    console.log(`[webhook] Payment completed: order ${order.id}, payment ${paymentId}`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhook] error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
