import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('JWT ', '').replace('Bearer ', '') || ''
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Проверить токен
    const meRes = await fetch(`${PAYLOAD_API_URL}/api/users/me`, {
      headers: { Authorization: `JWT ${token}` },
    })
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Токен недействителен' }, { status: 401 })
    }
    const meData = await meRes.json()
    const userId = meData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, message } = body

    if (!projectId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Укажите projectId и message' }, { status: 400 })
    }

    // Получить текущий проект и его чат
    const projectRes = await fetch(`${PAYLOAD_API_URL}/api/client-projects/${projectId}?depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    })
    if (!projectRes.ok) {
      return NextResponse.json({ error: 'Проект не найден' }, { status: 404 })
    }
    const project = await projectRes.json()

    // Проверить что проект принадлежит пользователю
    if (project.client?.id !== userId && project.client !== userId) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    // Добавить сообщение в чат
    const currentChat = project.chat || []
    const newMessage = {
      author: 'client',
      message: message.trim(),
      sentAt: new Date().toISOString(),
    }

    const updateRes = await fetch(`${PAYLOAD_API_URL}/api/client-projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        chat: [...currentChat, newMessage],
      }),
    })

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}))
      console.error('[chat] Update error:', errData)
      return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 500 })
    }

    // Отправить email-уведомление исполнителю
    try {
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({
        to: process.env.NOTIFY_EMAIL || 'boss@2980738.ru',
        subject: `💬 Новое сообщение от клиента: ${project.coopName || ''}`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #E68863;">
            <h2 style="margin: 0 0 16px; color: #333;">💬 Новое сообщение в чате проекта</h2>
            <p style="color: #666; margin: 0 0 8px;"><strong>Проект:</strong> ${project.coopName || ''}</p>
            <p style="color: #666; margin: 0 0 16px;"><strong>Сообщение:</strong></p>
            <div style="padding: 12px; background: #f9f9f9; border-radius: 6px; color: #333; white-space: pre-wrap;">${message.trim()}</div>
            <p style="color: #999; font-size: 12px; margin: 16px 0 0;">Ответьте в админке: Личный кабинет → Проекты клиентов → ${projectId}</p>
          </div>
        </div>`,
      })
    } catch (e) {
      console.warn('[chat] Email notification failed:', e)
    }

    return NextResponse.json({ ok: true, message: 'Сообщение отправлено' })
  } catch (error: any) {
    console.error('[chat] Error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
