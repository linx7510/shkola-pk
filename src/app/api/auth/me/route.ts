import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api-middleware'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch user details from Payload API
    const authHeader = request.headers.get('authorization') || ''
    let token = ''
    if (authHeader.startsWith('JWT ')) token = authHeader.substring(4)
    else if (authHeader.startsWith('Bearer ')) token = authHeader.substring(7)

    const res = await fetch(`${PAYLOAD_API_URL}/api/users/${authUser.userId}?depth=1`, {
      headers: { 'Authorization': `JWT ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = await res.json()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isActive: user.isActive,
        createdAt: user.createdAt,
        enrollments: user.enrollments || [],
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
