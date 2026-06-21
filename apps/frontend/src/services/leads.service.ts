/**
 * leads.service.ts — бизнес-логика для работы с лидами
 * 
 * Отделена от route handler для тестируемости и переиспользования.
 */

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

/** Псевдонимизация IP (152-ФЗ) — последние 3 цифры обнуляем */
export function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null
  const v4 = ip.match(/^(\d+\.\d+\.\d+\.)\d+$/)
  if (v4) return v4[1] + "0"
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::'
  return ip
}

/** Валидация данных лида */
export function validateLeadData(data: Record<string, unknown>): { valid: boolean; error?: string } {
  const { name, phone, email, consentAccepted } = data as any
  
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Имя обязательно (минимум 2 символа)' }
  }
  if (!phone && !email) {
    return { valid: false, error: 'Укажите телефон или email' }
  }
  if (!consentAccepted) {
    return { valid: false, error: 'Требуется согласие на обработку персональных данных (152-ФЗ)' }
  }
  return { valid: true }
}

/** Проверка honeypot (анти-спам) */
export function isHoneypotFilled(data: Record<string, unknown>): boolean {
  return !!(data as any).website
}

/** Создать лид в Payload CMS */
export async function createLead(data: {
  name: string
  phone?: string | null
  email?: string | null
  message?: string | null
  source?: string
  courseSlug?: string | null
  ipAddress?: string | null
  userAgent?: string
}) {
  const res = await fetch("" + PAYLOAD_API_URL + "/api/leads", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      message: data.message?.trim() || null,
      source: data.source || 'homepage',
      courseSlug: data.courseSlug || null,
      status: 'new',
      consentAccepted: true,
      consentAt: new Date().toISOString(),
      ipAddress: data.ipAddress,
      userAgent: (data.userAgent || '').slice(0, 500),
    }),
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Payload API error ' + res.status + ': ' + text)
  }
  
  return res.json()
}

/** Получить список лидов (admin) */
export async function getLeads(params: {
  authHeader: string
  page?: number
  limit?: number
  status?: string
}) {
  let path = '/leads?limit=' + (params.limit || 50) + '&page=' + (params.page || 1) + '&sort=-createdAt'
  if (params.status) path += '&where[status][equals]=' + params.status
  
  const res = await fetch("" + PAYLOAD_API_URL + path, {
    headers: { Authorization: params.authHeader },
  })
  
  if (!res.ok) {
    throw new Error('Payload API error ' + res.status)
  }
  
  return res.json()
}

