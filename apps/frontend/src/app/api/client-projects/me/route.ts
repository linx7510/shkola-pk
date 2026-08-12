import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

/**
 * GET /api/client-projects/me
 * Возвращает все проекты текущего клиента (по JWT токену из Authorization header).
 *
 * Используется в Личном кабинете /dashboard → таб «Мои проекты».
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { docs: [], error: 'Не авторизован' },
        { status: 200 }
      )
    }

    // Сначала получаем пользователя по токену
    const meRes = await fetch(`${PAYLOAD_API}/api/users/me`, {
      headers: { Authorization: authHeader },
    })

    if (!meRes.ok) {
      return NextResponse.json(
        { docs: [], error: 'Токен недействителен' },
        { status: 200 }
      )
    }

    const meData = await meRes.json()
    const userId = meData.user?.id

    if (!userId) {
      return NextResponse.json(
        { docs: [], error: 'Пользователь не найден' },
        { status: 200 }
      )
    }

    // Получаем проекты клиента (Payload access control отфильтрует по client_id)
    const projectsRes = await fetch(
      `${PAYLOAD_API}/api/client-projects?where[client][equals]=${userId}&depth=2&limit=100&sort=-createdAt`,
      { headers: { Authorization: authHeader } }
    )

    if (!projectsRes.ok) {
      return NextResponse.json(
        { docs: [], error: 'Не удалось загрузить проекты' },
        { status: 200 }
      )
    }

    const projectsData = await projectsRes.json()

    // Для консультационных проектов — подтянуть date/time из consultation_bookings
    try {
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      const bookingsRes = await pool.query(
        `SELECT service_type, date, time, status FROM consultation_bookings 
         WHERE user_id = $1 AND status NOT IN ('cancelled') 
         ORDER BY date DESC`,
        [userId]
      )
      
      if (bookingsRes.rows.length > 0 && projectsData.docs) {
        projectsData.docs = projectsData.docs.map((doc: any) => {
          const slug = doc.templateSnapshot?.slug || (typeof doc.template === 'object' ? doc.template?.slug : '') || ''
          if (slug.startsWith('consultation-')) {
            const booking = bookingsRes.rows.find((b: any) => b.service_type === slug)
            if (booking) {
              doc.consultationDate = booking.date
              doc.consultationTime = booking.time
            }
          }
          return doc
        })
      }
      await pool.end()
    } catch (e) {
      console.warn('[me] Failed to sync consultation bookings:', e)
    }

    return NextResponse.json(projectsData)
  } catch (error) {
    console.error('[/api/client-projects/me] Error:', error)
    return NextResponse.json(
      { docs: [], error: 'Внутренняя ошибка сервера' },
      { status: 200 }
    )
  }
}
