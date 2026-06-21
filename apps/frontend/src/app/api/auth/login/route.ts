import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { Pool } from 'pg'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

// Pool для audit_logs (в shkola_pk БД)
const auditPool = new Pool({
  connectionString: process.env.DATABASE_URL  // Одна БД
})

async function logFailedLogin(email: string, ip: string | null, userAgent: string | null) {
  try {
    const { randomBytes } = await import('crypto')
    const id = randomBytes(12).toString('hex')
    await auditPool.query(
      `INSERT INTO audit.audit_logs ("id", "userId", "action", "entity", "details", "ip", "userAgent")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, null, 'login_failed', 'user', JSON.stringify({ email }), ip, userAgent ? userAgent.slice(0, 500) : null]
    )
  } catch (e) {
    // Silent fail — don't block login flow
    console.error('[audit] Failed to log login failure:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip, 'login')
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Попробуйте позже.' },
        { status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
                     'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateLimit.resetAt) } }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    const res = await fetch(PAYLOAD_API_URL + "/api/users/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      // ═══ ЛОГИРУЕМ НЕУДАЧНЫЙ ЛОГИН ═══
      const userAgent = request.headers.get('user-agent') || ''
      await logFailedLogin(email, ip, userAgent)

      const data = await res.json()
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Неверный email или пароль' },
        { status: 401,
          headers: { 'X-RateLimit-Remaining': String(rateLimit.remaining) } }
      )
    }

    const data = await res.json()

    // Логируем успешный логин
    try {
      const { randomBytes } = await import('crypto')
      const id = randomBytes(12).toString('hex')
      const userAgent = request.headers.get('user-agent') || ''
      await auditPool.query(
        `INSERT INTO audit.audit_logs ("id", "userId", "action", "entity", "details", "ip", "userAgent")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, String(data.user.id), 'login_success', 'user', JSON.stringify({ email: data.user.email }), ip, userAgent.slice(0, 500)]
      )
    } catch (e) {
      console.error('[audit] Failed to log login success:', e)
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role, avatar: data.user.avatar },
      token: data.token,
    }, {
      headers: { 'X-RateLimit-Remaining': String(rateLimit.remaining) }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
