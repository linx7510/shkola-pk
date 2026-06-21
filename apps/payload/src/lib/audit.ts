import { Pool } from 'pg'

// Подключение к shkola_pk БД (где audit_logs)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL  // Теперь одна БД — shkola_pk_payload
})

export interface AuditLogInput {
  userId?: string | number
  action: string  // 'create' | 'update' | 'delete' | 'login' | 'logout' | etc
  entity: string  // 'page' | 'blog-post' | 'user' | 'course' | 'lead' | etc
  entityId?: string | number
  details?: any
  ip?: string
  userAgent?: string
}

/**
 * Записать audit log
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const { randomBytes } = await import('crypto')
    const id = randomBytes(12).toString('hex')
    
    await pool.query(
      `INSERT INTO audit.audit_logs ("id", "userId", "action", "entity", "entityId", "details", "ip", "userAgent")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        input.userId?.toString() || null,
        input.action,
        input.entity,
        input.entityId?.toString() || null,
        input.details ? (typeof input.details === 'string' ? input.details : JSON.stringify(input.details)) : null,
        input.ip || null,
        input.userAgent || null,
      ]
    )
  } catch (error) {
    console.error('[audit] Failed to log:', error)
  }
}

/**
 * Псевдонимизация IP (152-ФЗ)
 */
export function anonymizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  const v4 = ip.match(/^(\d+\.\d+\.\d+\.)\d+$/)
  if (v4) return `${v4[1]}0`
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::'
  return ip
}

/**
 * Хук-обёртки для Payload afterChange/afterDelete
 */
export function createAuditHooks(entityName: string) {
  return {
    afterChange: [
      async ({ doc, operation, req }: any) => {
        if (operation === 'create' || operation === 'update') {
          const ip = anonymizeIp(req?.headers?.get?.('x-forwarded-for') || req?.headers?.['x-forwarded-for'] || req?.ip)
          const ua = req?.headers?.get?.('user-agent') || req?.headers?.['user-agent'] || ''
          
          await logAudit({
            userId: req?.user?.id,
            action: operation,
            entity: entityName,
            entityId: doc?.id,
            details: {
              title: doc?.title || doc?.name || doc?.slug || `#${doc?.id}`,
              slug: doc?.slug,
            },
            ip: ip || undefined,
            userAgent: ua ? ua.slice(0, 500) : undefined,
          })
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }: any) => {
        const ip = anonymizeIp(req?.headers?.get?.('x-forwarded-for') || req?.headers?.['x-forwarded-for'] || req?.ip)
        const ua = req?.headers?.get?.('user-agent') || req?.headers?.['user-agent'] || ''
        
        await logAudit({
          userId: req?.user?.id,
          action: 'delete',
          entity: entityName,
          entityId: doc?.id,
          details: {
            title: doc?.title || doc?.name || doc?.slug || `#${doc?.id}`,
          },
          ip: ip || undefined,
          userAgent: ua ? ua.slice(0, 500) : undefined,
        })
      },
    ],
  }
}
