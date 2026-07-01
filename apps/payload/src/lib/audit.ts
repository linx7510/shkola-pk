import { Pool } from 'pg'

// Подключение к shkola_pk_payload БД (где public.audit_logs)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
 * Записать audit log в public.audit_logs
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO public.audit_logs (user_id, action, entity, entity_id, details, ip, user_agent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        input.userId ? parseInt(String(input.userId), 10) || null : null,
        input.action,
        input.entity,
        input.entityId?.toString() || null,
        input.details ? (typeof input.details === 'string' ? input.details : JSON.stringify(input.details)) : null,
        input.ip || null,
        input.userAgent ? input.userAgent.slice(0, 500) : null,
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
