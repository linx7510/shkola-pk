/**
 * Email-уведомления клиентам (payload app).
 *
 * Использует встроенный email-transport Payload (payload.sendEmail),
 * настроенный через nodemailerAdapter в payload.config.ts:
 *   SMTP sm39.hosting.reg.ru:587, user 22@xn--80adbka9ab1c.xn--p1acf, pass = SMTP_PASS (env).
 *
 * Если transport недоступен (SMTP_PASS не задан / placeholder) —
 * payload.sendEmail === undefined, функция логирует предупреждение
 * и завершается без ошибки (fire-and-forget, не ломает сохранение).
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://велеслав.рус'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface ClientChatReplyArgs {
  payload: any
  to: string
  message: string
  projectName?: string
}

/**
 * Отправляет клиенту email о новом сообщении исполнителя в чате проекта.
 * Тема: «💬 Новое сообщение по вашему проекту», CTA → /dashboard.
 */
export async function sendClientChatReplyEmail({
  payload,
  to,
  message,
  projectName,
}: ClientChatReplyArgs): Promise<void> {
  if (!to) return

  const dashboardUrl = `${APP_URL}/dashboard`
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')
  const safeProject = escapeHtml(projectName || '')

  const projectBlock = safeProject
    ? `<p style="margin: 0 0 16px; color: #8B7E6B; font-size: 14px;">Проект: <strong style="color: #D6C6B2;">${safeProject}</strong></p>`
    : ''

  const html = `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 32px 24px;">
  <img src="https://велеслав.рус/images/hero-logo.webp" alt="Школа ПК — Велеслав Старков" width="80" height="80" style="display: inline-block; border-radius: 12px; margin-bottom: 16px;" />
  <h1 style="margin: 0 0 16px; color: #E7DCCF; font-size: 24px;">💬 Новое сообщение по вашему проекту</h1>
  ${projectBlock}
  <p style="margin: 0 0 12px; color: #8B7E6B; font-size: 14px;">Исполнитель написал вам в чате:</p>
  <div style="padding: 16px; background: #1A1714; border-left: 4px solid #E68863; border-radius: 8px; color: #E7DCCF; font-size: 16px; line-height: 1.6;">${safeMessage}</div>
  <p style="margin: 24px 0 8px; color: #8B7E6B; font-size: 14px;">Чтобы ответить — зайдите в личный кабинет:</p>
  <p style="margin: 0 0 24px;">
    <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #E68863; color: #0D0C0A; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Перейти в личный кабинет →</a>
  </p>
  <hr style="border: none; border-top: 1px solid #2A2520; margin: 24px 0;" />
  <p style="margin: 4px 0 0; color: #6B5F4F; font-size: 12px;">Школа ПК — Велеслав Старков • велеслав.рус</p>
</div>`

  if (typeof payload?.sendEmail !== 'function') {
    console.warn('[notify-email] payload.sendEmail недоступен — SMTP не настроен. Пропуск отправки клиенту:', to)
    return
  }

  await payload.sendEmail({
    to,
    subject: '💬 Новое сообщение по вашему проекту',
    html,
  })
}
