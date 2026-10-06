import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Pool } from 'pg'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  return pool
}

// Простой анти-абьюз: 5 запросов в час с IP
const rl = new Map<string, { count: number; resetAt: number }>()
function rateOk(ip: string): boolean {
  const now = Date.now()
  const e = rl.get(ip)
  if (!e || now > e.resetAt) { rl.set(ip, { count: 1, resetAt: now + 3600_000 }); return true }
  if (e.count >= 5) return false
  e.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!rateOk(ip)) {
      return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
    }
    const { email } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Укажите корректный email' }, { status: 400 })
    }

    const db = getPool()
    const user = await db.query(
      'SELECT id, email, name FROM users WHERE lower(email) = $1 AND is_active != false LIMIT 1',
      [String(email).trim().toLowerCase()]
    )

    // Всегда отвечаем ok — не раскрываем, существует ли аккаунт
    if (user.rows.length > 0) {
      const u = user.rows[0]
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 3600_000) // 1 час
      await db.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expiration = $2, updated_at = NOW() WHERE id = $3',
        [token, expires.toISOString(), u.id]
      )
      const link = `https://велеслав.рус/auth/reset-password?token=${token}`
      try {
        const { sendEmail } = await import('@/lib/email')
        await sendEmail({
          to: u.email,
          subject: 'Восстановление пароля — Школа ПК',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#14110d;border:1px solid #2a2520;border-radius:12px;overflow:hidden">
<div style="padding:24px;text-align:center;border-bottom:1px solid #2a2520"><h2 style="color:#F5E6D3;margin:0">Школа потребительской кооперации</h2></div>
<div style="padding:28px 32px;color:#D6C6B2;font-size:15px;line-height:1.7">
<p>Здравствуйте, ${u.name || 'коллега'}!</p>
<p>Вы запросили восстановление пароля в личном кабинете Школы ПК. Ссылка для установки нового пароля (действует 1 час):</p>
<p style="text-align:center;margin:24px 0"><a href="${link}" style="display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#C96E4D,#E68863);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Установить новый пароль</a></p>
<p style="color:#8B7E6B;font-size:13px">Если кнопка не работает, скопируйте ссылку: ${link}</p>
<p style="color:#8B7E6B;font-size:13px">Если вы не запрашивали восстановление — просто проигнорируйте это письмо, пароль не изменится.</p>
</div>
<div style="padding:20px 32px;border-top:1px solid #2a2520;color:#8B7E6B;font-size:12px">Школа ПК · велеслав.рус · 8 902 472-07-38</div>
</div>`,
        })
      } catch (mailErr) {
        console.error('[forgot-password] mail error:', mailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[forgot-password] error:', e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
