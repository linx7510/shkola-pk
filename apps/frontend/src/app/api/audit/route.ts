import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'

// shkola_pk БД (где audit_logs)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.AUDIT_DATABASE_URL
})

export async function GET(request: NextRequest) {
  try {
    const admin = await getVerifiedUser(request)
    
    if (!admin || (admin.role !== 'admin' && admin.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')

    let whereClause = ''
    const params: any[] = []
    let paramIndex = 1

    if (entity) {
      whereClause += `WHERE "entity" = $${paramIndex}`
      params.push(entity)
      paramIndex++
    }
    if (action) {
      whereClause += whereClause ? ` AND "action" = $${paramIndex}` : `WHERE "action" = $${paramIndex}`
      params.push(action)
      paramIndex++
    }

    const offset = (page - 1) * limit
    const [logsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT "id", "userId", "action", "entity", "entityId", "details", "ip", "userAgent", "createdAt"
         FROM audit_logs ${whereClause}
         ORDER BY "createdAt" DESC 
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT count(*) FROM audit_logs ${whereClause}`, params),
    ])

    return NextResponse.json({
      logs: logsResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    })
  } catch (error: any) {
    console.error('[Audit API GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/audit — запись audit логов из hooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, entity, entityId, details, ip, userAgent } = body
    
    if (!entity || !action) {
      return NextResponse.json({ error: 'entity и action обязательны' }, { status: 400 })
    }
    
    // Generate text id (MongoDB ObjectId style, 24 hex chars)
    const { randomBytes } = await import('crypto')
    const id = randomBytes(12).toString('hex')
    
    const result = await pool.query(
      `INSERT INTO audit_logs ("id", "userId", "action", "entity", "entityId", "details", "ip", "userAgent")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "id"`,
      [id, userId?.toString() || null, action, entity, entityId?.toString() || null,
       details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
       ip || null, userAgent || null]
    )
    
    return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 })
  } catch (error: any) {
    console.error('[Audit API POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
