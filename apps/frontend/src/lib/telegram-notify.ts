/**
 * lib/telegram-notify.ts — отправка уведомлений в Telegram
 * 
 * Используется для:
 *   - Уведомления о новых заказах услуг
 *   - Уведомления о загрузке документов клиентами
 *   - Уведомления о новых отзывах/заявках
 * 
 * Bot: @school_leads_bot (Школа ПК)
 * Token хранится в .env: TELEGRAM_BOT_TOKEN
 * Chat ID группы: TELEGRAM_CHAT_ID
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

interface TelegramMessage {
  text: string
  parseMode?: 'HTML' | 'Markdown'
}

/**
 * Отправить сообщение в Telegram-группу
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
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[telegram] Ошибка отправки:', err)
      return false
    }

    return true
  } catch (err) {
    console.error('[telegram] Ошибка:', err)
    return false
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
  const text = `🔔 <b>Новый заказ услуги!</b>

👤 <b>Клиент:</b> ${params.clientName} (${params.clientEmail})
📦 <b>Услуга:</b> ${params.serviceName}
💰 <b>Сумма:</b> ${new Intl.NumberFormat('ru-RU').format(params.amount)} ₽
📄 <b>Договор:</b> №${params.contractNumber}
🆔 <b>Проект ID:</b> ${params.projectId}

👉 Проверьте в админке: Личный кабинет → Проекты клиентов`

  await sendTelegramMessage(text)
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

  const text = `📤 <b>Клиент загрузил документ!</b>

👤 <b>Клиент:</b> ${params.clientName} (${params.clientEmail})
📄 <b>Файл:</b> ${params.fileName}
📝 <b>Код документа:</b> ${params.documentCode}
📊 <b>Этап:</b> ${stageName}
${params.feedback ? `💬 <b>Комментарий:</b> ${params.feedback}` : ''}
🆔 <b>Проект ID:</b> ${params.projectId}

👉 Проверьте в админке: Личный кабинет → Проекты клиентов → ${params.projectId}`

  await sendTelegramMessage(text)
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
  const text = `📨 <b>Новая заявка с сайта!</b>

👤 <b>Имя:</b> ${params.name}
📧 <b>Email:</b> ${params.email || '—'}
📞 <b>Телефон:</b> ${params.phone || '—'}
📝 <b>Сообщение:</b> ${params.message || '—'}
🔍 <b>Источник:</b> ${params.source}

👉 Проверьте в админке: Продажи → Заявки`

  await sendTelegramMessage(text)
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
  const text = `💬 <b>Новый отзыв от клиента!</b>

👤 <b>Клиент:</b> ${params.clientName} (${params.clientEmail})
📊 <b>Этап:</b> ${params.stageName}
📝 <b>Отзыв:</b> ${params.feedback}
🆔 <b>Проект ID:</b> ${params.projectId}

👉 Проверьте в админке: Личный кабинет → Проекты клиентов → ${params.projectId}`

  await sendTelegramMessage(text)
}
