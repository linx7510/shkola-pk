import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('JWT ', '').replace('Bearer ', '') || ''
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверить токен через Payload
    const meRes = await fetch(`${process.env.PAYLOAD_API_URL || 'http://localhost:3001'}/api/users/me`, {
      headers: { Authorization: `JWT ${token}` },
    })
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Токен недействителен' }, { status: 401 })
    }
    const meData = await meRes.json()
    const userId = meData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, date, time } = body

    if (!projectId || !date || !time) {
      return NextResponse.json({ error: 'Укажите projectId, date и time' }, { status: 400 })
    }

    // Проверить, что проект принадлежит этому пользователю
    const pg = pool
    const checkRes = await pg.query(
      'SELECT id, template_slug FROM client_projects WHERE id = $1 AND client_id = $2',
      [projectId, userId]
    )
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Проект не найден' }, { status: 404 })
    }

    // Проверить, что слот свободен (нет другой консультации на это время)
    const slotRes = await pg.query(
      `SELECT id FROM consultation_bookings WHERE date = $1 AND time = $2 AND status NOT IN ('cancelled') LIMIT 1`,
      [date, time]
    )
    if (slotRes.rows.length > 0) {
      return NextResponse.json({ error: 'Это время уже занято. Выберите другое.' }, { status: 409 })
    }

    // Обновить проект — установить дату консультации
    await pg.query(
      'UPDATE client_projects SET consultation_date = $1, consultation_time = $2, updated_at = NOW() WHERE id = $3',
      [date, time, projectId]
    )

    // Создать запись в consultation_bookings
    const serviceType = checkRes.rows[0].template_slug || 'consultation-free'
    await pg.query(
      `INSERT INTO consultation_bookings (client_name, client_email, service_type, date, time, status, user_id, created_at, updated_at)
       SELECT cp.coop_name, u.email, $3, $1, $2, 'scheduled', u.id, NOW(), NOW()
       FROM client_projects cp
       JOIN users u ON u.id = cp.client_id
       WHERE cp.id = $4`,
      [date, time, serviceType, projectId]
    )

    return NextResponse.json({
      ok: true,
      date,
      time,
      message: 'Консультация запланирована',
    })
  } catch (error: any) {
    console.error('set-consultation error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
