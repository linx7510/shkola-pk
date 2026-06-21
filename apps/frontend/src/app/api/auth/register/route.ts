import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 регистрации / час с одного IP
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, 'register')
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Слишком много попыток регистрации. Попробуйте позже.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          }
        }
      )
    }

    const body = await request.json()
    const { email, password, name, phone } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, пароль и имя обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль минимум 6 символов' },
        { status: 400 }
      )
    }

    // Create user via Payload CMS API
    const res = await fetch("" + PAYLOAD_API_URL + "/api/users", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        phone: phone || undefined,
        role: 'student',
        isActive: true,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      if (data.errors?.[0]?.message?.includes('unique') || data.errors?.[0]?.message?.includes('email')) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Ошибка при регистрации' },
        { status: 400 }
      )
    }

    const data = await res.json()

    // Auto-login: call Payload login to get token
    const loginRes = await fetch("" + PAYLOAD_API_URL + "/api/users/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!loginRes.ok) {
      return NextResponse.json({
        user: { id: data.doc.id, email: data.doc.email, name: data.doc.name, role: data.doc.role },
      }, { status: 201 })
    }

    const loginData = await loginRes.json()

    return NextResponse.json({
      user: {
        id: data.doc.id,
        email: data.doc.email,
        name: data.doc.name,
        role: data.doc.role,
      },
      token: loginData.token,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Ошибка при регистрации' }, { status: 500 })
  }
}

