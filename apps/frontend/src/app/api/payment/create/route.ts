import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api-middleware'
import { createPayment } from '@/lib/payment'
import { Pool } from 'pg'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  }
  return pool
}

// Серверный прайс-лист — ЕДИНСТВЕННЫЙ источник истины для суммы.
// Клиентское поле amount в теле запроса НЕ используется (починка уязвимости
// "купить за 1 ₽").
const CONSULTATION_PAID_PRICE = 6000

/**
 * POST /api/payment/create
 *
 * Безопасное создание платежа:
 *   1. Авторизация (JWT) — обязательно.
 *   2. Сумма определяется ТОЛЬКО сервером (фикс. цена консультации или courses.price).
 *   3. Order создаётся прямым SQL (Payload API требует admin/manager — см. Orders.access).
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = Number(user.userId)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Некорректный пользователь' }, { status: 400 })
    }

    const body = await request.json()
    const { courseId, description, serviceSlug } = body

    const isConsultation = Boolean(serviceSlug) || courseId === 0
    const db = getPool()

    // === СЕРВЕРНАЯ ВАЛИДАЦИЯ СУММЫ ===
    let amount: number
    let orderDescription: string
    const metadata: Record<string, string> = { userId: String(userId) }

    if (isConsultation) {
      amount = CONSULTATION_PAID_PRICE
      orderDescription = description || `Консультация: ${serviceSlug || 'услуга'}`
      metadata.serviceSlug = serviceSlug || 'consultation'
      metadata.type = 'consultation'
    } else {
      if (!courseId) {
        return NextResponse.json({ error: 'Укажите courseId' }, { status: 400 })
      }
      const courseRes = await db.query(
        'SELECT id, title, price FROM courses WHERE id = $1',
        [courseId]
      )
      if (courseRes.rows.length === 0) {
        return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
      }
      const course = courseRes.rows[0]
      amount = Number(course.price)
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'У курса не задана цена' }, { status: 400 })
      }
      orderDescription = description || `Оплата курса: ${course.title}`
      metadata.courseId = String(courseId)

      // Проверка: не записан ли уже на курс
      const enrollRes = await db.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1',
        [userId, courseId]
      )
      if (enrollRes.rows.length > 0) {
        return NextResponse.json({ error: 'Вы уже записаны на этот курс' }, { status: 400 })
      }
    }

    // === СОЗДАНИЕ ORDER (прямой SQL — Payload API отдаёт 403 для не-admin) ===
    const orderRes = await db.query(
      `INSERT INTO orders (user_id, course_id, amount, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW()) RETURNING id`,
      [userId, isConsultation ? null : courseId, amount, orderDescription]
    )
    const orderId = orderRes.rows[0].id

    // === СОЗДАНИЕ ПЛАТЕЖА YooKassa ===
    try {
      const payment = await createPayment({
        amount,
        description: orderDescription,
        orderId: String(orderId),
        metadata,
        customerEmail: user.email, // требуется для чека 54-ФЗ (фискализация)
      })

      // Сохранить payment_id (Idempotence-Key = orderId — детерминированный)
      await db.query(
        'UPDATE orders SET payment_id = $1, updated_at = NOW() WHERE id = $2',
        [payment.id, orderId]
      )

      return NextResponse.json({
        orderId,
        paymentId: payment.id,
        confirmationUrl: payment.confirmationUrl,
        amount,
      })
    } catch (paymentError: any) {
      console.error('Payment creation error:', paymentError)
      // Платёж не создался — отменяем order, чтобы не висел pending
      await db.query(
        "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
        [orderId]
      )
      return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
    }
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
