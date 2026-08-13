import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const authUser = await getVerifiedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }
    const userId = authUser.id

    const body = await request.json()
    const { projectId, message } = body

    if (!projectId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Укажите projectId и message' }, { status: 400 })
    }

    // Проверить что проект принадлежит пользователю
    const projectRes = await pool.query(
      'SELECT id, coop_name, client_id FROM client_projects WHERE id = $1',
      [projectId]
    )
    if (projectRes.rows.length === 0) {
      return NextResponse.json({ error: 'Проект не найден' }, { status: 404 })
    }

    const project = projectRes.rows[0]
    if (String(project.client_id) !== String(userId) && authUser.role !== "admin") {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    // Добавить сообщение в client_projects_chat
    const { randomUUID } = await import('crypto')
    const msgId = randomUUID()
    
    // Получить следующий _order
    const orderRes = await pool.query(
      'SELECT COALESCE(MAX(_order), -1) + 1 as next_order FROM client_projects_chat WHERE _parent_id = $1',
      [projectId]
    )
    const nextOrder = orderRes.rows[0].next_order

    await pool.query(
      `INSERT INTO client_projects_chat (id, _order, _parent_id, author, message, sent_at)
       VALUES ($1, $2, $3, 'client', $4, NOW())`,
      [msgId, nextOrder, projectId, message.trim()]
    )

    // Отправить email-уведомление исполнителю
    try {
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({
        to: process.env.NOTIFY_EMAIL || 'boss@2980738.ru',
        subject: `💬 Новое сообщение от клиента: ${project.coop_name || ''}`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #E68863;">
            <h2 style="margin: 0 0 16px; color: #333;">💬 Новое сообщение в чате проекта</h2>
            <p style="color: #666; margin: 0 0 8px;"><strong>Проект:</strong> ${project.coop_name || ''}</p>
            <p style="color: #666; margin: 0 0 16px;"><strong>Сообщение:</strong></p>
            <div style="padding: 12px; background: #f9f9f9; border-radius: 6px; color: #333; white-space: pre-wrap;">${message.trim()}</div>
            <p style="color: #999; font-size: 12px; margin: 16px 0 0;">
              Ответить: https://велеслав.рус/admin → Проекты клиентов → ${project.coop_name} → Чат с Исполнителем
            </p>
          </div>
        </div>`,
      })
      console.log('[chat] Email уведомление отправлено на boss@2980738.ru')
    } catch (e) {
      console.warn('[chat] Email notification failed:', e)
    }

    return NextResponse.json({ ok: true, message: 'Сообщение отправлено' })
  } catch (error: any) {
    console.error('[chat] Error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
