/**
 * audit.service.ts — бизнес-логика для audit логов
 * 
 * Отделена от route handler для тестируемости.
 */

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.AUDIT_DATABASE_URL,
})

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

/** Проверка админских прав через Payload */
export async function getAdminFromToken(authHeader: string | null): Promise<{ id: number; role: string; email: string } | null> {
  if (!authHeader) return null
  try {
    const res = await fetch("" + PAYLOAD_API_URL + "/api/users/me", {
      headers: { Authorization: authHeader },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.user) return null
    return { id: data.user.id, role: data.user.role, email: data.user.email }
  } catch {
    return null
  }
}

/** Получить audit логи с пагинацией и фильтрами */
export async function getAuditLogs(params: {
  page?: number
  limit?: number
  entity?: string
  action?: string
}) {
  const page = params.page || 1
  const limit = Math.min(params.limit || 50, 200)
  
  let whereClause = ''
  const queryParams: any[] = []
  let paramIndex = 1

  if (params.entity) {
    whereClause += 'WHERE "entity" = $' + paramIndex
    queryParams.push(params.entity)
    paramIndex++
  }
  if (params.action) {
    whereClause += whereClause ? ' AND "action" = $' + paramIndex : 'WHERE "action" = $' + paramIndex
    queryParams.push(params.action)
    paramIndex++
  }

  const offset = (page - 1) * limit
  const [logsResult, countResult] = await Promise.all([
    pool.query(
      'SELECT "id", "userId", "action", "entity", "entityId", "details", "ip", "userAgent", "createdAt" FROM audit_logs ' + whereClause + ' ORDER BY "createdAt" DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1),
      [...queryParams, limit, offset]
    ),
    pool.query('SELECT count(*) FROM audit_logs ' + whereClause, queryParams),
  ])

  return {
    logs: logsResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  }
}

/** Записать audit лог */
export async function createAuditLog(data: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: any
  ip?: string
  userAgent?: string
}) {
  const { randomBytes } = await import('crypto')
  const id = randomBytes(12).toString('hex')
  
  const result = await pool.query(
    'INSERT INTO audit_logs ("id", "userId", "action", "entity", "entityId", "details", "ip", "userAgent") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "id"',
    [
      id,
      data.userId?.toString() || null,
      data.action,
      data.entity,
      data.entityId?.toString() || null,
      data.details ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) : null,
      data.ip || null,
      data.userAgent || null,
    ]
  )
  
  return result.rows[0].id
}

