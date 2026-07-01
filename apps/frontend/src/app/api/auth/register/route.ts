import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, 'register')

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Слишком много попыток регистрации. Попробуйте позже.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
        }
      )
    }

    const body = await request.json()
    const { email, password, name, phone, captchaToken } = body

    // Yandex SmartCaptcha verification
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Подтвердите, что вы не робот' },
        { status: 400 }
      )
    }

    const captchaServerKey = process.env.SMARTCAPTCHA_SERVER_KEY
    if (captchaServerKey) {
      try {
        const captchaRes = await fetch('https://captcha-api.yandex.ru/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: captchaServerKey,
            token: captchaToken,
            ip: ip,
          }),
        })
        const captchaData = await captchaRes.json()
        if (!captchaData.status || captchaData.status !== 'ok') {
          return NextResponse.json(
            { error: 'Проверка капчи не пройдена. Попробуйте снова.' },
            { status: 403 }
          )
        }
      } catch (e) {
        console.error('[register] SmartCaptcha verify failed:', e)
        return NextResponse.json(
          { error: 'Ошибка проверки капчи' },
          { status: 500 }
        )
      }
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, пароль и имя обязательны' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 })
    }

    const res = await fetch(`${PAYLOAD_API_URL}/api/users`, {
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

    // Don't auto-login — user must verify email first
    // No cookie is set; user needs to click verification link in email, then login
    return NextResponse.json({
      user: {
        id: data.doc.id,
        email: data.doc.email,
        name: data.doc.name,
        role: data.doc.role,
        verified: data.doc._verified || false,
      },
      message: 'На указанный email отправлена ссылка для подтверждения. Проверьте почту и завершите регистрацию.',
      requireVerification: true,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Ошибка при регистрации' }, { status: 500 })
  }
}
