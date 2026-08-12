import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ docs: [], error: 'Не авторизован' }, { status: 200 })
    }

    const meRes = await fetch(`${PAYLOAD_API}/api/users/me`, { headers: { Authorization: authHeader } })
    if (!meRes.ok) {
      return NextResponse.json({ docs: [], error: 'Токен недействителен' }, { status: 200 })
    }

    const meData = await meRes.json()
    const userId = meData.user?.id
    if (!userId) {
      return NextResponse.json({ docs: [], error: 'Пользователь не найден' }, { status: 200 })
    }

    // Получаем проекты клиента
    const projectsRes = await fetch(
      `${PAYLOAD_API}/api/client-projects?where[client][equals]=${userId}&depth=2&limit=100&sort=-createdAt`,
      { headers: { Authorization: authHeader } }
    )
    if (!projectsRes.ok) {
      return NextResponse.json({ docs: [], error: 'Не удалось загрузить проекты' }, { status: 200 })
    }

    const projectsData = await projectsRes.json()

    // Подгрузить консультации и создать для них проекты
    try {
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })

      // Получить email пользователя
      const userRes = await fetch(`${PAYLOAD_API}/api/users/${userId}?depth=0`, { headers: { Authorization: authHeader } })
      const userData = await userRes.json()
      const userEmail = userData.email || ''

      // Найти все бронирования по user_id или email
      const bookingsRes = await pool.query(
        `SELECT id, client_name, service_type, date, time, status, amount FROM consultation_bookings
         WHERE (user_id = $1 OR client_email = $2) AND status NOT IN ('cancelled')
         ORDER BY date DESC`,
        [userId, userEmail]
      )

      if (bookingsRes.rows.length > 0) {
        // Синхронизировать дату/время для существующих консультационных проектов
        if (projectsData.docs) {
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

        // Создать проекты для консультаций без ClientProject
        const existingSlugs = new Set(
          (projectsData.docs || [])
            .map((d: any) => d.templateSnapshot?.slug || (typeof d.template === 'object' ? d.template?.slug : ''))
            .filter((s: string) => s.startsWith('consultation-'))
        )

        for (const booking of bookingsRes.rows) {
          if (!existingSlugs.has(booking.service_type)) {
            const isPaid = booking.service_type === 'consultation-paid'
            const serviceName = isPaid ? 'Индивидуальная консультация (1 час)' : 'Бесплатная консультация (30 мин)'

            try {
              const createRes = await fetch(`${PAYLOAD_API}/api/client-projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: authHeader },
                body: JSON.stringify({
                  coopName: serviceName,
                  client: userId,
                  contract: {
                    number: 'КП-CONS-' + booking.id,
                    signedAt: new Date().toISOString(),
                    tariff: isPaid ? 'Индивидуальная' : 'Бесплатная',
                    amount: booking.amount || 0,
                    paymentStatus: (booking.amount || 0) > 0 ? 'pending' : 'paid',
                    paymentSchedule: '100_prepaid',
                  },
                  stage: booking.status === 'completed' ? 'completed' : 'in_progress',
                  documents: [],
                  achievements: [],
                }),
              })

              if (createRes.ok) {
                const newProject = await createRes.json()
                if (newProject.doc) {
                  newProject.doc.templateSnapshot = {
                    name: serviceName,
                    slug: booking.service_type,
                    totalXP: 100,
                    priceMin: booking.amount || 0,
                    priceMax: booking.amount || 0,
                  }
                  newProject.doc.consultationDate = booking.date
                  newProject.doc.consultationTime = booking.time
                  newProject.doc.chat = []
                  newProject.doc.documents = []
                  newProject.doc.achievements = []
                  if (!projectsData.docs) projectsData.docs = []
                  projectsData.docs.unshift(newProject.doc)
                  projectsData.totalDocs = (projectsData.totalDocs || 0) + 1
                }
              }
            } catch (e) {
              console.warn('[me] Failed to create project for booking:', e)
            }
            existingSlugs.add(booking.service_type)
          }
        }
      }
      await pool.end()
    } catch (e) {
      console.warn('[me] Failed to sync consultation bookings:', e)
    }

    return NextResponse.json(projectsData)
  } catch (error) {
    console.error('[/api/client-projects/me] Error:', error)
    return NextResponse.json({ docs: [], error: 'Внутренняя ошибка сервера' }, { status: 200 })
  }
}
