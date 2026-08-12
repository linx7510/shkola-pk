import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { sendTelegramMessage } from '@/lib/telegram-notify'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  }
  return pool
}

/**
 * POST /api/consultations/book
 *
 * Создаёт бронирование консультации.
 *
 * Тело:
 *   - serviceSlug: 'consultation-free' | 'consultation-paid'
 *   - clientName: string
 *   - clientEmail: string
 *   - clientPhone?: string
 *   - date: string (ISO date)
 *   - time: string ('10:00', '11:00', etc.)
 *   - userId?: number (из JWT если авторизован)
 *
 * Возвращает:
 *   - { ok: true, bookingId, amount }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceSlug, clientName, clientEmail, clientPhone, date, time, userId } = body

    // Валидация
    if (!serviceSlug || !clientName || !clientEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    const validSlugs = ['consultation-free', 'consultation-paid']
    if (!validSlugs.includes(serviceSlug)) {
      return NextResponse.json(
        { error: 'Неизвестная услуга' },
        { status: 400 }
      )
    }

    // Проверка: нет ли уже бронирования на это время
    const db = getPool()
    const existing = await db.query(
      `SELECT id FROM consultation_bookings WHERE date = $1 AND time = $2 AND status NOT IN ('cancelled') LIMIT 1`,
      [date, time]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Это время уже занято. Выберите другое.' },
        { status: 409 }
      )
    }

    // Определяем сумму
    const amount = serviceSlug === 'consultation-paid' ? 6000 : 0
    const serviceLabel = serviceSlug === 'consultation-paid'
      ? 'Индивидуальная консультация (1 час)'
      : 'Бесплатная консультация (30 мин)'

    // Создаём запись через Payload API
    const res = await fetch(`${PAYLOAD_API}/api/consultation-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        userId: userId || null,
        serviceType: serviceSlug,
        date,
        time,
        amount,
        status: amount > 0 ? 'pending' : 'scheduled',
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('[consultations/book] Payload error:', errData)
      return NextResponse.json(
        { error: 'Не удалось создать бронирование' },
        { status: 500 }
      )
    }

    const data = await res.json()
    const booking = data.doc || data
    const bookingId = booking.id

    // Telegram-уведомление
    const formatDate = (iso: string) => {
      try {
        const d = new Date(iso)
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
      } catch {
        return iso
      }
    }

    const emoji = amount > 0 ? '💰' : '🆓'
    const tgMsg = [
      `${emoji} Новая заявка на консультацию!`,
      ``,
      `👤 ${clientName}`,
      `📧 ${clientEmail}`,
      clientPhone ? `📞 ${clientPhone}` : '',
      ``,
      `📝 ${serviceLabel}`,
      amount > 0 ? `💳 ${amount} ₽ (ожидает оплаты)` : `✅ Бесплатная`,
      ``,
      `📅 ${formatDate(date)}`,
      `🕐 ${time}`,
      ``,
      `ID заявки: ${bookingId}`,
      userId ? `Пользователь ЛК: ${userId}` : '',
    ].filter(Boolean).join('\n')

    try {
      await sendTelegramMessage(tgMsg)
    } catch (tgErr) {
      console.error('[consultations/book] Telegram error:', tgErr)
    }

    // Дублирование на email (надёжный канал, не зависит от блокировок Telegram)
    try {
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({
        to: process.env.NOTIFY_EMAIL || 'boss@2980738.ru',
        subject: '📅 Новая запись на консультацию',
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #9C27B0;">
            <h2 style="margin: 0 0 16px; color: #333;">📅 Новая запись на консультацию</h2>
            <pre style="white-space: pre-wrap; font-family: sans-serif; color: #333; line-height: 1.6;">${tgMsg.replace(/</g, '&lt;')}</pre>
          </div>
        </div>`,
      })
      console.log('[consultations/book] Email уведомление отправлено')
    } catch (emailErr) {
      console.error('[consultations/book] Email error:', emailErr)
    }

    return NextResponse.json({
      ok: true,
      bookingId,
      amount,
      serviceType: serviceSlug,
      needsPayment: amount > 0,
    })
  } catch (error: any) {
    console.error('[consultations/book] error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/consultations/book?month=YYYY-MM
 *
 * Возвращает занятые слоты для выбора даты.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM

    const db = getPool()
    let query = `SELECT date, time, status FROM consultation_bookings WHERE status NOT IN ('cancelled')`
    const params: string[] = []

    if (month) {
      query += ` AND date >= $1 AND date < ($1::date + interval '1 month')`
      params.push(`${month}-01`)
    }

    query += ` ORDER BY date, time`
    const result = await db.query(query, params)

    return NextResponse.json({
      booked: result.rows.map((r) => ({
        date: r.date,
        time: r.time,
        status: r.status,
      })),
    })
  } catch (error: any) {
    console.error('[consultations/book] GET error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
