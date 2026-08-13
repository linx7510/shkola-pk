import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/payment'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'

/**
 * GET /api/payment/verify
 *
 * Надёжное обновление статуса оплаты БЕЗ webhook'а YooKassa
 * (владелец не настроил webhook вручную, а через API это нельзя).
 *
 * Вызывается с /payment/success после возврата пользователя из YooKassa.
 *
 * Параметры (один из):
 *   - ?paymentId=XXX        — YooKassa payment id напрямую
 *   - ?orderId=proj_<N>     — consultation-проект (по client_projects.id)
 *   - ?orderId=<N>          — numeric orders.id (курс)
 *
 * Поток:
 *   1. Резолвит payment_id (по project / order / напрямую).
 *   2. checkPaymentStatus(paymentId) → реальный статус YooKassa API.
 *   3. Если succeeded && paid:
 *        - обновляет client_projects (если найден по payment_id) + email;
 *        - обновляет orders (если найден по payment_id) + enrollment email.
 *   4. Идемпотентно: повторные вызовы для уже оплаченных записей
 *      не дублируют email и апдейты — просто возвращают статус.
 *
 * Без авторизации: сам paymentId — это непредсказуемый токен YooKassa
 * (угадать невозможно), а orderId=proj_N резолвится только в payment_id,
 * без раскрытия чувствительных данных в ответе.
 */
let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  }
  return pool
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIdParam = searchParams.get('paymentId')
    const orderIdParam = searchParams.get('orderId')

    if (!paymentIdParam && !orderIdParam) {
      return NextResponse.json({ error: 'Требуется paymentId или orderId' }, { status: 400 })
    }

    const db = getPool()

    // === Авторизация (защита от IDOR) ===
    // Залогиненный пользователь: проверяем владение проектом/заказом (403 если чужое),
    // ответ полный. Аноним без JWT: только {status, paid} без paymentId/id (не раскрываем
    // PII), но side-effects (пометка оплачено, письма) выполняются — success-page работает.
    const user = await getVerifiedUser(request)

    // === ШАГ 1: Резолвим YooKassa payment_id ===
    let paymentId: string | null = paymentIdParam
    let ownerId: number | null = null // client_id (proj) или user_id (order)

    if (!paymentId && orderIdParam) {
      if (orderIdParam.startsWith('proj_')) {
        // consultation-проект
        const projectId = Number(orderIdParam.slice(5))
        if (!Number.isFinite(projectId) || projectId <= 0) {
          return NextResponse.json({ error: 'Некорректный orderId проекта' }, { status: 400 })
        }
        const res = await db.query(
          'SELECT payment_id, client_id FROM client_projects WHERE id = $1 LIMIT 1',
          [projectId]
        )
        paymentId = res.rows[0]?.payment_id || null
        ownerId = res.rows[0]?.client_id != null ? Number(res.rows[0].client_id) : null
      } else {
        // numeric orders.id
        const orderId = Number(orderIdParam)
        if (!Number.isFinite(orderId) || orderId <= 0) {
          return NextResponse.json({ error: 'Некорректный orderId' }, { status: 400 })
        }
        const res = await db.query(
          'SELECT payment_id, user_id FROM orders WHERE id = $1 LIMIT 1',
          [orderId]
        )
        paymentId = res.rows[0]?.payment_id || null
        ownerId = res.rows[0]?.user_id != null ? Number(res.rows[0].user_id) : null
      }

      // IDOR guard: залогиненный пользователь не может запрашивать чужие проекты/заказы.
      if (user && ownerId !== null && ownerId !== user.id) {
        return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
      }
    }

    if (!paymentId) {
      return NextResponse.json(
        { status: 'unknown', paid: false, error: 'Платёж не найден' },
        { status: 404 }
      )
    }

    // === ШАГ 2: Проверяем реальный статус через YooKassa API ===
    let checkStatus: { status: string; paid: boolean }
    try {
      checkStatus = await checkPaymentStatus(paymentId)
    } catch (e) {
      console.error('[verify] checkPaymentStatus error:', e)
      return NextResponse.json(
        user ? { status: 'error', paid: false, paymentId } : { status: 'error', paid: false },
        { status: 502 }
      )
    }

    // Не succeeded — просто возвращаем статус, ничего не обновляем.
    // Анонимам не отдаём paymentId (PII/токен).
    if (!checkStatus.paid || checkStatus.status !== 'succeeded') {
      return NextResponse.json(
        user
          ? { status: checkStatus.status, paid: checkStatus.paid, paymentId }
          : { status: checkStatus.status, paid: checkStatus.paid }
      )
    }

    // === ШАГ 3: succeeded → обновляем project и/или order (идемпотентно) ===
    // 3a. client_projects (consultation из ЛК)
    const projRes = await db.query(
      'SELECT id, client_id, contract_payment_status FROM client_projects WHERE payment_id = $1 LIMIT 1',
      [paymentId]
    )
    const proj = projRes.rows[0]

    let projectUpdated = false
    if (proj && proj.contract_payment_status !== 'paid') {
      await db.query(
        `UPDATE client_projects
           SET contract_payment_status = 'paid',
               contract_paid_at = NOW(),
               stage = CASE WHEN stage = 0 THEN 1 ELSE stage END,
               updated_at = NOW()
         WHERE id = $1`,
        [proj.id]
      )
      projectUpdated = true
      console.log(`[verify] Project ${proj.id} marked paid`)

      // Email-уведомления (admin + клиент) — только при реальной смене статуса
      void (async () => {
        try {
          const { sendEmail } = await import('@/lib/email')
          const infoRes = await db.query(
            'SELECT cp.coop_name, cp.contract_amount, cp.contract_number, u.email, u.name FROM client_projects cp JOIN users u ON cp.client_id = u.id WHERE cp.id = $1',
            [proj.id]
          )
          const info = infoRes.rows[0]
          if (!info) return

          const amount = Number(info.contract_amount) || 0
          const amountStr = new Intl.NumberFormat('ru-RU').format(amount)
          const coopName = info.coop_name || 'Консультация'

          const adminEmail = process.env.NOTIFY_EMAIL || 'boss@2980738.ru'
          await sendEmail({
            to: adminEmail,
            subject: `💰 Оплачена услуга: ${coopName}`,
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                  <h1 style="color: #E7DCCF; font-size: 1.5rem;">Школа ПК</h1>
                  <p style="color: #A29587;">Уведомление об оплате консультации</p>
                </div>
                <h2 style="color: #6DB89A;">💰 Поступила оплата за услугу</h2>
                <table style="width: 100%; color: #BCA891; line-height: 2;">
                  <tr><td style="color: #8A7F74; width: 160px;">Услуга:</td><td style="color: #F5F0E8; font-weight: 600;">${coopName}</td></tr>
                  <tr><td style="color: #8A7F74;">Клиент:</td><td style="color: #F5F0E8;">${info.name || '—'}</td></tr>
                  <tr><td style="color: #8A7F74;">Email клиента:</td><td style="color: #F5F0E8;">${info.email || '—'}</td></tr>
                  <tr><td style="color: #8A7F74;">Сумма:</td><td style="color: #6DB89A; font-weight: 700;">${amountStr} ₽</td></tr>
                  <tr><td style="color: #8A7F74;">Договор №:</td><td style="color: #F5F0E8;">${info.contract_number || '—'}</td></tr>
                  <tr><td style="color: #8A7F74;">ID проекта:</td><td style="color: #F5F0E8;">${proj.id}</td></tr>
                </table>
                <p style="margin-top: 2rem; font-size: 0.85rem; color: #8A7F74;">Школа ПК — boss@2980738.ru · @Veles_ST</p>
              </div>
            `,
          })

          if (info.email) {
            await sendEmail({
              to: info.email,
              subject: `✅ Оплата получена — ${coopName}`,
              html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
                  <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: #E7DCCF; font-size: 1.5rem;">Школа ПК</h1>
                  </div>
                  <h2 style="color: #6DB89A;">✅ Оплата получена</h2>
                  <p>${info.name || 'Здравствуйте'}!</p>
                  <p>Мы получили оплату за услугу <strong style="color: #E68863;">${coopName}</strong>.</p>
                  <p style="font-size: 1.2rem; color: #E7DCCF;">Сумма: ${amountStr} ₽</p>
                  <p>Консультация запланирована. Исполнитель свяжется с вами в ближайшее время для уточнения деталей и времени проведения.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 0.75rem 2rem; background: #4C9A7A; color: #F5F0E8; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0;">Перейти в личный кабинет</a>
                  <p style="color: #8A7F74; font-size: 0.85rem; margin-top: 2rem;">Школа ПК — boss@2980738.ru · @Veles_ST</p>
                </div>
              `,
            })
          }
          console.log(`[verify] Consultation payment emails sent for project ${proj.id}`)
        } catch (emailErr) {
          console.error('[verify] Consultation payment email error:', emailErr)
        }
      })()
    }

    // 3b. orders (курсы)
    const orderRes = await db.query(
      'SELECT id, user_id, course_id, amount, status FROM orders WHERE payment_id = $1 LIMIT 1',
      [paymentId]
    )
    const order = orderRes.rows[0]

    let orderUpdated = false
    if (order && order.status !== 'paid') {
      await db.query(
        `UPDATE orders
            SET status = 'paid',
                yookassa_status = $1,
                updated_at = NOW()
          WHERE id = $2`,
        [checkStatus.status, order.id]
      )
      orderUpdated = true
      console.log(`[verify] Order ${order.id} marked paid`)

      // Enrollment + email — только при реальной смене статуса
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
            console.error('[verify] Course email error:', emailErr)
          }
        }
      }
    }

    // === ШАГ 4: Формируем ответ ===
    // Анонимам (без JWT) не раскрываем paymentId/id/type — только status/paid.
    const type = proj ? 'project' : order ? 'order' : 'unknown'
    const id = proj ? proj.id : order ? order.id : null

    if (!user) {
      return NextResponse.json({ status: 'paid', paid: true })
    }

    return NextResponse.json({
      status: 'paid',
      paid: true,
      type,
      id,
      paymentId,
      updated: projectUpdated || orderUpdated,
    })
  } catch (error) {
    console.error('[verify] error:', error)
    return NextResponse.json({ error: 'Verify error' }, { status: 500 })
  }
}
