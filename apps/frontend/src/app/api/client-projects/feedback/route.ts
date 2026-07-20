import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

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
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('JWT ', '').replace('Bearer ', '') || ''
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const body = await request.json()
    const { projectId, stage, feedback, documentCode, turnstileToken } = body

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

    // Verify user
    const meRes = await fetch(`${PAYLOAD_API}/api/users/me`, {
      headers: { Authorization: authHeader! },
    })
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Токен недействителен' }, { status: 401 })
    }
    const meData = await meRes.json()
    const userId = meData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })
    }

    // Get project
    const projectRes = await fetch(
      `${PAYLOAD_API}/api/client-projects/${projectId}?depth=1`,
      { headers: { 'Authorization': `JWT ${token}` } }
    )
    
    if (!projectRes.ok) {
      return NextResponse.json({ error: 'Проект не найден' }, { status: 404 })
    }
    
    const project = await projectRes.json()

    // Verify ownership
    if (project.client && String(project.client.id || project.client) !== String(userId)) {
      return NextResponse.json({ error: 'Нет доступа к проекту' }, { status: 403 })
    }

    // Rate limit check: max 10 feedback messages per hour
    const now = Date.now()
    const recentMessages = (project.chat || []).filter((m: any) => {
      if (m.author !== 'client') return false
      const sentAt = new Date(m.sentAt).getTime()
      return (now - sentAt) < 60 * 60 * 1000 // last hour
    })
    if (recentMessages.length >= 10) {
      return NextResponse.json(
        { error: 'Слишком много сообщений за час. Попробуйте позже.' },
        { status: 429 }
      )
    }

    const stageNames = ['Бриф', 'Устав', 'Учреждение', 'Положения', 'Целевые программы', 'Образцы']
    const stageName = stageNames[stage] || `Этап ${stage}`
    
    const chatMessage = `💬 Отзыв клиента по этапу «${stageName}»:\n${feedback}`
    
    const updatedChat = [
      ...(project.chat || []),
      { author: 'client', message: chatMessage, sentAt: new Date().toISOString() }
    ]

    // Add admin notification
    const updatedNotifications = [
      ...(project.notifications || []),
      {
        type: 'client_feedback',
        message: `Новый отзыв клиента по этапу «${stageName}» (проект ${projectId}).`,
        sentAt: new Date().toISOString(),
        channel: 'admin',
      }
    ]
    
    // Use custom endpoint (supports custom project IDs like proj-test-001)
    await fetch(`${PAYLOAD_API}/api/custom/update-progress/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`,
      },
      body: JSON.stringify({
        chat: updatedChat,
        notifications: updatedNotifications,
      }),
    })

    // Telegram-уведомление
    try {
      const { notifyNewFeedback } = await import('@/lib/telegram-notify')
      await notifyNewFeedback({
        clientEmail: meData.user?.email || '',
        clientName: meData.user?.name || 'Клиент',
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
