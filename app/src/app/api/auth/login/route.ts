import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Call Payload CMS login API
    const res = await fetch(`${PAYLOAD_API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    const data = await res.json()

    // Transform Payload response to match our frontend format
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        avatar: data.user.avatar,
      },
      token: data.token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Ошибка при входе' }, { status: 500 })
  }
}
