import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getUserFromRequest } from '@/lib/api-middleware'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://shkola_pk:Shk0laPK2026!Db@localhost:5432/shkola_pk'
})

export async function GET(request: NextRequest) {
  try {
    const admin = getUserFromRequest(request)
    if (!admin || (admin.role !== 'admin' && admin.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')

    let whereClause = ''
    const params: any[] = []
    let paramIndex = 1

    if (entity) {
      whereClause += `WHERE entity = $${paramIndex}`
      params.push(entity)
      paramIndex++
    }
    if (action) {
      whereClause += whereClause ? ` AND action = $${paramIndex}` : `WHERE action = $${paramIndex}`
      params.push(action)
      paramIndex++
    }

    const offset = (page - 1) * limit
    const [logsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT al.*, u.name as user_name, u.email as user_email 
         FROM audit_logs al 
         LEFT JOIN users u ON al.user_id = u.id 
         ${whereClause}
         ORDER BY al.created_at DESC 
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
