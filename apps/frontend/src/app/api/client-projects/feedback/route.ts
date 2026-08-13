import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'

// После перевода аутентификации на frontend-JWT, Payload REST
// отклоняет эти токены — работаем напрямую с PostgreSQL.

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    })
  }
  return pool
}

/**
 * Verify Cloudflare Turnstile token (anti-bot)
 */
async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!secret || !siteKey) return true // skip if not configured
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    })
    const data = await res.json()
    return data.success === true
  } catch (e) {
    console.error('[Turnstile] verify failed:', e)
    return false
  }
}

const STAGE_NAMES = ['Бриф', 'Устав', 'Учреждение', 'Положения', 'Целевые программы', 'Образцы']

/**
 * POST /api/client-projects/feedback
 * Client submits feedback for a stage or document
 *
 * Security:
 *   1. JWT auth required
 *   2. Cloudflare Turnstile anti-bot check
 *   3. Feedback length ≤ 5000 chars
 *   4. Rate limit: 10 messages/hour per project
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Локальная верификация (frontend JWT) ──
    const authUser = await getVerifiedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }
    const userId = authUser.id

    const body = await request.json()
    const { projectId, stage, feedback, turnstileToken } = body

    if (!projectId || !feedback) {
      return NextResponse.json({ error: 'Project ID и feedback обязательны' }, { status: 400 })
    }

    // Feedback length limit
    if (typeof feedback !== 'string' || feedback.length > 5000) {
      return NextResponse.json({ error: 'Отзыв слишком длинный (макс. 5000 символов)' }, { status: 400 })
    }

    // Turnstile check
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') || 'unknown'
    const isHuman = await verifyTurnstile(turnstileToken || null, clientIP)
    if (!isHuman) {
      return NextResponse.json(
        { error: 'Проверка капчи не пройдена. Обновите страницу.' },
        { status: 403 }
      )
    }

    const pg = getPool()

    // ── 2. Найти проект и проверить владельца (SQL) ──
    const projRes = await pg.query(
      'SELECT id, client_id, coop_name FROM client_projects WHERE id = $1',
      [projectId]
    )
    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: 'Проект не найден' }, { status: 404 })
    }
    const project = projRes.rows[0]
    if (String(project.client_id) !== String(userId) && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа к проекту' }, { status: 403 })
    }

    // ── 3. Rate limit: max 10 client messages per hour ──
    const recentRes = await pg.query(
      `SELECT COUNT(*)::int AS cnt
       FROM client_projects_chat
       WHERE _parent_id = $1 AND author = 'client'
         AND sent_at > NOW() - INTERVAL '1 hour'`,
      [projectId]
    )
    if ((recentRes.rows[0]?.cnt || 0) >= 10) {
      return NextResponse.json(
        { error: 'Слишком много сообщений за час. Попробуйте позже.' },
        { status: 429 }
      )
    }

    // ── 4. Сохранить отзыв в чат (SQL) ──
    const stageName = STAGE_NAMES[stage] || `Этап ${stage}`
    const chatMessage = `💬 Отзыв клиента по этапу «${stageName}»:\n${feedback}`

    {
      const orderRes = await pg.query(
        `SELECT COALESCE(MAX(_order), -1) + 1 AS next_order
         FROM client_projects_chat WHERE _parent_id = $1`,
        [projectId]
      )
      const nextOrder = orderRes.rows[0].next_order
      await pg.query(
        `INSERT INTO client_projects_chat (_order, _parent_id, author, message, sent_at)
         VALUES ($1, $2, 'client', $3, NOW())`,
        [nextOrder, projectId, chatMessage]
      )
    }

    // ── 5. Уведомление исполнителю (SQL) ──
    {
      const orderRes = await pg.query(
        `SELECT COALESCE(MAX(_order), -1) + 1 AS next_order
         FROM client_projects_notifications WHERE _parent_id = $1`,
        [projectId]
      )
      const nextOrder = orderRes.rows[0].next_order
      await pg.query(
        `INSERT INTO client_projects_notifications (_order, _parent_id, type, message, sent_at, channel)
         VALUES ($1, $2, 'client_feedback', $3, NOW(), 'admin')`,
        [nextOrder, projectId, `Новый отзыв клиента по этапу «${stageName}» (проект ${projectId}).`]
      )
    }

    // ── 6. Telegram-уведомление ──
    try {
      const { notifyNewFeedback } = await import('@/lib/telegram-notify')
      await notifyNewFeedback({
        clientEmail: authUser.email || '',
        clientName: authUser.name || 'Клиент',
        stage: stage || 0,
        stageName,
        feedback,
        projectId,
      })
    } catch (e) {
      console.warn('[feedback] Telegram notify failed:', e)
    }

    return NextResponse.json({ ok: true, message: 'Отзыв отправлен исполнителю' })
  } catch (error: any) {
    console.error('[/api/client-projects/feedback] Error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
