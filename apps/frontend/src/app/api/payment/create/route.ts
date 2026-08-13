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

// Серверный прайс-лист — ЕДИНСТВЕННЫЙ источник истины для суммы платных услуг.
// Клиентское поле amount НЕ используется (кроме пожертвований — см. ветку donation).
const CONSULTATION_PAID_PRICE = 6000

// user_id для анонимных пожертвований. orders.user_id NOT NULL, а донат открыт
// без авторизации — поэтому все анонимные пожертвования пишутся на этого аккаунт.
// Создан вручную: users.id=46, email=donate-anonymous@shkola-pk.local.
const ANONYMOUS_DONOR_USER_ID = Number(process.env.ANONYMOUS_DONOR_USER_ID) || 46

/**
 * POST /api/payment/create
 *
 * Безопасное создание платежа. Ветви:
 *   - type === 'donation'  → публичное пожертвование (БЕЗ авторизации; сумма из клиента с валидацией).
 *   - projectId            → оплата существующего проекта (нужен JWT, сумма из БД).
 *   - isConsultation       → консультация (нужен JWT, фикс. цена).
 *   - courseId             → оплата курса (нужен JWT, цена из courses.price).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ============================================================
    // === DONATION — публичное пожертвование (без авторизации) ===
    // ============================================================
    // Сумму передаёт клиент (пользователь сам выбирает, сколько пожертвовать) —
    // это легитимно для доната. Сервер строго валидирует диапазон.
    if (body.type === 'donation') {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount < 100 || amount > 1_000_000) {
        return NextResponse.json(
          { error: 'Некорректная сумма пожертвования (допустимо 100–1 000 000 ₽)' },
          { status: 400 }
        )
      }

      const customerEmail = typeof body.email === 'string' ? body.email.trim() : ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return NextResponse.json(
          { error: 'Укажите корректный email — он нужен для отправки чека (54-ФЗ)' },
          { status: 400 }
        )
      }

      // Если есть валидный JWT — привязываем пожертвование к аккаунту, иначе — анонимный донатор.
      const authUser = getUserFromRequest(request)
      const donorUserId = authUser && Number.isFinite(Number(authUser.userId))
        ? Number(authUser.userId)
        : ANONYMOUS_DONOR_USER_ID

      const description =
        typeof body.description === 'string' && body.description.trim()
          ? body.description.trim()
          : `Пожертвование — ${amount} ₽`

      const db = getPool()

      // Order (status=pending) — прямой SQL (Payload API требует admin/manager).
      const orderRes = await db.query(
        `INSERT INTO orders (user_id, course_id, amount, description, status, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, 'pending', NOW(), NOW()) RETURNING id`,
        [donorUserId, amount, description]
      )
      const orderId = orderRes.rows[0].id

      try {
        const payment = await createPayment({
          amount,
          description,
          orderId: String(orderId),
          metadata: {
            type: 'donation',
            orderId: String(orderId),
            ...(authUser ? { userId: String(donorUserId) } : { userId: 'anonymous' }),
          },
          customerEmail,
          paymentSubject: 'another', // добровольное пожертвование физлица — признак «иное» (54-ФЗ)
        })

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
        console.error('Donation payment creation error:', paymentError)
        await db.query(
          "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
          [orderId]
        )
        return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
      }
    }

    // ============================================================
    // === Все остальные платежи — требуется авторизация (JWT) ===
    // ============================================================
    const user = getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = Number(user.userId)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Некорректный пользователь' }, { status: 400 })
    }

    const { courseId, description, serviceSlug } = body

    const isConsultation = Boolean(serviceSlug) || courseId === 0
    const db = getPool()

    // === СЕРВЕРНАЯ ВАЛИДАЦИЯ СУММЫ ===
    let amount: number
    let orderDescription: string
    const metadata: Record<string, string> = { userId: String(userId) }

    // Если есть projectId — оплата существующего project (например consultation из ЛК)
    if (body.projectId) {
      const projectId = Number(body.projectId)
      const projRes = await db.query(
        'SELECT id, client_id, contract_amount FROM client_projects WHERE id = $1',
        [projectId]
      )
      const proj = projRes.rows[0]
      if (!proj) return NextResponse.json({ error: 'Проект не найден' }, { status: 404 })
      if (Number(proj.client_id) !== userId) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
      }
      amount = Number(proj.contract_amount)
      if (amount <= 0) {
        return NextResponse.json({ error: 'Проект уже оплачен или бесплатный' }, { status: 400 })
      }
      // Создать платёж, привязать к project
      const payment = await createPayment({
        amount,
        description: `Оплата проекта #${projectId}`,
        orderId: `proj_${projectId}`,
        metadata: { projectId: String(projectId), userId: String(userId), type: 'project' },
        customerEmail: user.email,
      })

      await db.query('UPDATE client_projects SET payment_id = $1 WHERE id = $2', [payment.id, projectId])
      return NextResponse.json({ projectId, paymentId: payment.id, confirmationUrl: payment.confirmationUrl, amount })
    }

    if (isConsultation) {
      amount = serviceSlug === 'consultation-free' ? 0 : CONSULTATION_PAID_PRICE
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
