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
    return NextResponse.json(projectsData)
  } catch (error) {
    console.error('[/api/client-projects/me] Error:', error)
    return NextResponse.json(
      { docs: [], error: 'Внутренняя ошибка сервера' },
      { status: 200 }
    )
  }
}
