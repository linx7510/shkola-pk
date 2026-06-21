import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 попыток / 15 минут с одного IP
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, 'login')
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Попробуйте позже.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          }
        }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Call Payload CMS login API
    const res = await fetch("" + PAYLOAD_API_URL + "/api/users/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Неверный email или пароль' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
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
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Ошибка при входе' }, { status: 500 })
  }
}

