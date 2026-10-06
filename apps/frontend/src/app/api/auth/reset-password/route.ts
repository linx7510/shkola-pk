import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Pool } from 'pg'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  return pool
}

// Схема хэша — точная копия Payload local strategy (как в verifyPassword из mfa.ts)
function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (e, buf) => {
      if (e) return reject(e)
      resolve(buf.toString('hex'))
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || typeof token !== 'string' || token.length < 32) {
      return NextResponse.json({ error: 'Ссылка недействительна' }, { status: 400 })
    }
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: 'Пароль должен быть не короче 8 символов' }, { status: 400 })
    }

    const db = getPool()
    const user = await db.query(
      `SELECT id, reset_password_expiration FROM users
       WHERE reset_password_token = $1 AND reset_password_expiration > NOW() LIMIT 1`,
      [token]
    )
    if (user.rows.length === 0) {
      return NextResponse.json({ error: 'Ссылка недействительна или срок её истёк. Запросите восстановление заново.' }, { status: 400 })
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const hash = await hashPassword(String(password), salt)

    await db.query(
      `UPDATE users SET salt = $1, hash = $2, reset_password_token = NULL, reset_password_expiration = NULL,
       login_attempts = 0, lock_until = NULL, updated_at = NOW() WHERE id = $3`,
      [salt, hash, user.rows[0].id]
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[reset-password] error:', e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
