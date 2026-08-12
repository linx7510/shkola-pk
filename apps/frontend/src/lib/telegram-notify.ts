/**
 * lib/telegram-notify.ts — отправка уведомлений
 *
 * Стратегия: КАЖДОЕ уведомление дублируется на email boss@2980738.ru
 * через уже работающий SMTP (REG.RU Mail). Это не зависит от блокировок
 * Telegram и гарантирует доставку.
 *
 * Дополнительно пытаемся отправить в Telegram (если не заблокирован).
 *
 * Используется для:
 *   - Уведомления о новых заказах услуг
 *   - Уведомления о загрузке документов клиентами
 *   - Уведомления о новых отзывах/заявках
 */

import { sendEmail } from './email'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

// Email для дублирования уведомлений (надёжный канал, не зависит от Telegram)
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'boss@2980738.ru'

/**
 * Отправить сообщение в Telegram-группу (если доступен)
 */
export async function sendTelegramMessage(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены')
    return false
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(5000), // 5 сек таймаут — не блокируем основной поток
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[telegram] Ошибка отправки:', err)
      return false
    }

    return true
  } catch (err) {
    // Telegram заблокирован на сетевом уровне — это ожидаемо
    console.warn('[telegram] Недоступен (возможно заблокирован):', err instanceof Error ? err.message : err)
    return false
  }
}

/**
 * Отправить уведомление ВСЕМИ доступными каналами:
 * 1. Email на boss@2980738.ru (основной, надёжный канал)
 * 2. Telegram (дополнительно, если не заблокирован)
 *
 * Email отправляется ВСЕГДА, даже если Telegram работает.
 * Это гарантирует доставку уведомления.
 */
async function notifyAllChannels(subject: string, tgMessage: string, emailHtml: string): Promise<void> {
  // 1. Email — основной канал (отправляем первым, не зависим от Telegram)
  try {
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject,
      html: emailHtml,
    })
    console.log(`[notify] Email отправлен на ${NOTIFY_EMAIL}: ${subject}`)
  } catch (err) {
    console.error('[notify] Ошибка отправки email:', err)
  }

  // 2. Telegram — дополнительный канал (может быть заблокирован)
  const tgSent = await sendTelegramMessage(tgMessage)
  if (tgSent) {
    console.log('[notify] Telegram-уведомление отправлено')
  }
}

/**
 * Уведомление о новом заказе услуги
 */
export async function notifyNewOrder(params: {
  clientEmail: string
  clientName: string
  serviceName: string
  amount: number
  contractNumber: string
  projectId: string | number
}): Promise<void> {
  const subject = `🔔 Новый заказ: ${params.serviceName} — ${new Intl.NumberFormat('ru-RU').format(params.amount)} ₽`

  const tgMessage = `🔔 <b>Новый заказ услуги!</b>

👤 <b>Клиент:</b> ${params.clientName} (${params.clientEmail})
📦 <b>Услуга:</b> ${params.serviceName}
💰 <b>Сумма:</b> ${new Intl.NumberFormat('ru-RU').format(params.amount)} ₽
📄 <b>Договор:</b> №${params.contractNumber}
🆔 <b>Проект ID:</b> ${params.projectId}

👉 Проверьте в админке: Личный кабинет → Проекты клиентов`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #C96E4D;">
        <h2 style="margin: 0 0 16px; color: #333;">🔔 Новый заказ услуги</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Клиент:</td><td style="padding: 8px 0; color: #333;"><strong>${params.clientName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${params.clientEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Услуга:</td><td style="padding: 8px 0; color: #333;"><strong>${params.serviceName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Сумма:</td><td style="padding: 8px 0; color: #333; font-size: 18px;"><strong>${new Intl.NumberFormat('ru-RU').format(params.amount)} ₽</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Договор:</td><td style="padding: 8px 0; color: #333;">№${params.contractNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Проект ID:</td><td style="padding: 8px 0; color: #333;">${params.projectId}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Проверьте в админке: Личный кабинет → Проекты клиентов</p>
      </div>
    </div>
  `

  await notifyAllChannels(subject, tgMessage, emailHtml)
}

/**
 * Уведомление о загрузке документа клиентом
 */
export async function notifyDocumentUploaded(params: {
  clientEmail: string
  clientName: string
  fileName: string
  documentCode: string
  feedback?: string
  stage: number
  projectId: string | number
}): Promise<void> {
  const stageNames = ['Бриф', 'Устав', 'Учреждение', 'Положения', 'Целевые программы', 'Образцы']
  const stageName = stageNames[params.stage] || `Этап ${params.stage}`

  const subject = `📤 Загружен документ: ${params.fileName} — ${params.clientName}`

  const tgMessage = `📤 <b>Клиент загрузил документ!</b>

👤 <b>Клиент:</b> ${params.clientName} (${params.clientEmail})
📄 <b>Файл:</b> ${params.fileName}
📝 <b>Код документа:</b> ${params.documentCode}
📊 <b>Этап:</b> ${stageName}
${params.feedback ? `💬 <b>Комментарий:</b> ${params.feedback}` : ''}
🆔 <b>Проект ID:</b> ${params.projectId}

👉 Проверьте в админке: Личный кабинет → Проекты клиентов → ${params.projectId}`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #2196F3;">
        <h2 style="margin: 0 0 16px; color: #333;">📤 Клиент загрузил документ</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Клиент:</td><td style="padding: 8px 0; color: #333;"><strong>${params.clientName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${params.clientEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Файл:</td><td style="padding: 8px 0; color: #333;"><strong>${params.fileName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Код документа:</td><td style="padding: 8px 0; color: #333;">${params.documentCode}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Этап:</td><td style="padding: 8px 0; color: #333;">${stageName}</td></tr>
          ${params.feedback ? `<tr><td style="padding: 8px 0; color: #666;">Комментарий:</td><td style="padding: 8px 0; color: #333;">${params.feedback}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #666;">Проект ID:</td><td style="padding: 8px 0; color: #333;">${params.projectId}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Проверьте в админке: Личный кабинет → Проекты клиентов → ${params.projectId}</p>
      </div>
    </div>
  `

  await notifyAllChannels(subject, tgMessage, emailHtml)
}

/**
 * Уведомление о новой заявке (lead)
 */
export async function notifyNewLead(params: {
  name: string
  email: string
  phone: string
  message: string
  source: string
}): Promise<void> {
  const subject = `📨 Новая заявка с сайта: ${params.name}`

  const tgMessage = `📨 <b>Новая заявка с сайта!</b>

👤 <b>Имя:</b> ${params.name}
📧 <b>Email:</b> ${params.email || '—'}
📞 <b>Телефон:</b> ${params.phone || '—'}
📝 <b>Сообщение:</b> ${params.message || '—'}
🔍 <b>Источник:</b> ${params.source}

👉 Проверьте в админке: Продажи → Заявки`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #4CAF50;">
        <h2 style="margin: 0 0 16px; color: #333;">📨 Новая заявка с сайта</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Имя:</td><td style="padding: 8px 0; color: #333;"><strong>${params.name}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${params.email || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Телефон:</td><td style="padding: 8px 0; color: #333;">${params.phone || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Сообщение:</td><td style="padding: 8px 0; color: #333;">${params.message || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Источник:</td><td style="padding: 8px 0; color: #333;">${params.source}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Проверьте в админке: Продажи → Заявки</p>
      </div>
    </div>
  `

  await notifyAllChannels(subject, tgMessage, emailHtml)
}

/**
 * Уведомление о новом отзыве клиента
 */
export async function notifyNewFeedback(params: {
  clientEmail: string
  clientName: string
  stage: number
  stageName: string
  feedback: string
  projectId: string | number
}): Promise<void> {
  const subject = `💬 Новый отзыв от клиента: ${params.clientName}`

  const tgMessage = `💬 <b>Новый отзыв от клиента!</b>

👤 <b>Клиент:</b> ${params.clientName} (${params.clientEmail})
📊 <b>Этап:</b> ${params.stageName}
📝 <b>Отзыв:</b> ${params.feedback}
🆔 <b>Проект ID:</b> ${params.projectId}

👉 Проверьте в админке: Личный кабинет → Проекты клиентов → ${params.projectId}`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #FF9800;">
        <h2 style="margin: 0 0 16px; color: #333;">💬 Новый отзыв от клиента</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Клиент:</td><td style="padding: 8px 0; color: #333;"><strong>${params.clientName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${params.clientEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Этап:</td><td style="padding: 8px 0; color: #333;">${params.stageName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Отзыв:</td><td style="padding: 8px 0; color: #333;">${params.feedback}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Проект ID:</td><td style="padding: 8px 0; color: #333;">${params.projectId}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Проверьте в админке: Личный кабинет → Проекты клиентов → ${params.projectId}</p>
      </div>
    </div>
  `

  await notifyAllChannels(subject, tgMessage, emailHtml)
}
