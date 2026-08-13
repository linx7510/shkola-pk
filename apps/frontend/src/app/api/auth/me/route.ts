import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api-middleware'
import { Pool } from 'pg'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  }
  return pool
}

/**
 * GET /api/auth/me
 *
 * Верифицирует session JWT локально (frontend секретом через getUserFromRequest),
 * затем подтягивает полные данные пользователя из БД.
 *
 * НЕ проксирует token в Payload — это позволяет работать с frontend-JWT
 * (выпускаемым /api/auth/login), даже если секрет Payload runtime отличается.
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getPool()
    const res = await db.query(
      'SELECT id, email, name, phone, role, bio, is_active, created_at FROM users WHERE id = $1',
      [user.userId]
    )
    const u = res.rows[0]
    if (!u) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        bio: u.bio,
        isActive: u.is_active,
        createdAt: u.created_at,
        enrollments: [],
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
