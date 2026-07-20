/**
 * api/express-audit/route.ts — публичный endpoint экспресс-аудита устава.
 *
 * Трипфайер: клиент загружает устав → LLM анализирует → клиент видит
 * короткое превью с категориями проблем (без конкретики) → мотивация
 * заказать полный аудит.
 *
 * Flow:
 *   1. Приём multipart/form-data (name, email, phone?, file, consent, honeypot)
 *   2. Валидация + honeypot + rate-limit (5/час с IP)
 *   3. Проверка файла (размер ≤ 10 МБ, тип PDF/DOCX/TXT/RTF/ODT)
 *   4. Извлечение текста (extract-text.ts)
 *   5. LLM-анализ через chatWithAI (express-prompt.ts)
 *   6. Парсинг JSON-ответа → buildPreview (filter-preview.ts)
 *   7. Создание лида в Payload (source=consultation, score в message)
 *   8. Telegram-уведомление с ПОЛНЫМ результатом (для Велеслава)
 *   9. Возврат публичного превью клиенту (без конкретики)
 *
 * Безопасность (152-ФЗ):
 *   — согласие обязательно (по умолчанию снято);
 *   — IP псевдонимизируется + хешируется;
 *   — оригинал файла не отдаётся третьим лицам;
 *   — в публичный ответ НЕ попадают цитаты/формулировки клиента.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  EXPRESS_AUDIT_SYSTEM_PROMPT,
  buildUserMessage,
  EXPRESS_AUDIT_CHAT_OPTIONS,
  MAX_USTAV_CHARS,
  type FullAuditResult,
} from '@/lib/audit/express-prompt'
import {
  extractText,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from '@/lib/audit/extract-text'
import { buildPreview, isValidAuditResult, type AuditPreview } from '@/lib/audit/filter-preview'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

/* ─── Утилиты (как в api/leads) ─── */

async function payloadApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Payload API error ${res.status}: ${text}`)
  }
  return res.json()
}

function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null
  const v4 = ip.match(/^(\d+\.\d+\.\d+\.)\d+$/)
  if (v4) return `${v4[1]}0`
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::'
  return ip
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = process.env.IP_HASH_SALT || 'shkola-pk-salt-2026'
  return crypto.createHash('sha256').update(ip + salt).digest('hex')
}

/* ─── Rate limiter (in-memory, как rate-limiter.ts но локальный для аудита) ─── */
// 5 запросов в час с одного IP — защита от abuse LLM-токенов
interface RateEntry { count: number; resetAt: number }
const auditRateStore = new Map<string, RateEntry>()
const AUDIT_RATE_MAX = 5
const AUDIT_RATE_WINDOW = 60 * 60 * 1000 // 1 час

function checkAuditRate(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = auditRateStore.get(ip)
  if (!entry || now > entry.resetAt) {
    auditRateStore.set(ip, { count: 1, resetAt: now + AUDIT_RATE_WINDOW })
    return { allowed: true, remaining: AUDIT_RATE_MAX - 1 }
  }
  if (entry.count >= AUDIT_RATE_MAX) {
    return { allowed: false, remaining: 0 }
  }
  entry.count++
  return { allowed: true, remaining: AUDIT_RATE_MAX - entry.count }
}

/* ─── Парсер JSON из ответа LLM (с восстановлением битых/обрезанных) ─── */
function parseAuditJson(raw: string): FullAuditResult | null {
  if (!raw) return null

  // Стратегия 1: прямой JSON.parse
  try {
    return JSON.parse(raw)
  } catch {}

  // Стратегия 2: блок ```json ... ``` или ```...```
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (codeBlock) {
    try {
      return JSON.parse(codeBlock[1])
    } catch {}
  }

  // Извлекаем «ядо» — текст от первой { до последней }
  let jsonStr = raw
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
  }

  // Стратегия 3: попытка распарсить извлечённое ядро
  try {
    return JSON.parse(jsonStr)
  } catch {}

  // Стратегия 4: ВОССТАНОВЛЕНИЕ обрезанного JSON (finish_reason: length).
  // Если LLM обрезал ответ на середине массива/строки — пытаемся закрыть скобки.
  const repaired = repairTruncatedJson(jsonStr)
  if (repaired) {
    try {
      return JSON.parse(repaired)
    } catch {}
  }

  // Стратегия 5 (fallback): извлечь хоть какие-то данные через regex
  return extractPartialData(raw)
}

/**
 * Восстанавливает обрезанный JSON, добавляя недостающие закрывающие токены.
 * Алгоритм: считаем баланс скобок и строк, закрываем что открыто.
 */
function repairTruncatedJson(s: string): string | null {
  let result = s
  let inString = false
  let escape = false
  const stack: string[] = [] // стек открытых { и [

  for (let i = 0; i < result.length; i++) {
    const ch = result[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if (ch === '}' || ch === ']') {
      // закрываем если совпадает с вершиной стека
      if (stack.length && stack[stack.length - 1] === ch) stack.pop()
    }
  }

  // Если оборвали посреди строки — закрываем кавычку
  if (inString) {
    result += '"'
  }

  // Частая ситуация: обрезали после "key": или "key": [1,2 — нужно закрыть массив/значение
  // Удаляем висячий хвост: незавершённое значение после последней запятой
  // Ищем последнюю запятую/двоеточие и обрезаем мусор после неё
  const trimmed = result.replace(/,\s*$/, '').replace(/:\s*$/, ': null')
  result = trimmed

  // Закрываем скобки в обратном порядке
  while (stack.length) {
    result += stack.pop()
  }

  return result
}

/**
 * Fallback-извлечение: если JSON совсем не парсится,
 * пытаемся вытащить score, summary и риски через regex.
 */
function extractPartialData(raw: string): FullAuditResult | null {
  try {
    const scoreMatch = raw.match(/"compliance_score"\s*:\s*(\d+)/)
    const summaryMatch = raw.match(/"summary"\s*:\s*"([^"]+)"/)
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null

    // Извлекаем все title рисков
    const riskTitles = [...raw.matchAll(/"title"\s*:\s*"([^"]+)"/g)].map((m) => m[1])
    const risks = riskTitles.slice(0, 8).map((title) => ({
      title,
      category: 'правовая-природа',
      severity: 'medium' as const,
      description: '',
    }))

    if (score !== null || summaryMatch || risks.length > 0) {
      return {
        compliance_score: score ?? 50,
        summary: summaryMatch?.[1] || 'Анализ выполнен частично. Закажите полный аудит для детального заключения.',
        risks,
        recommendations: [],
        missing_sections: [],
        key_findings: [],
      }
    }
  } catch {}
  return null
}

/* ─── Telegram-уведомление с ПОЛНЫМ результатом ─── */
async function notifyExpressAudit(params: {
  name: string
  email: string
  phone: string
  fileName: string
  score: number
  issuesCount: number
  full: FullAuditResult
}): Promise<void> {
  try {
    const { sendTelegramMessage } = await import('@/lib/telegram-notify')
    const highRisks = params.full.risks?.filter((r) => r.severity === 'high') || []
    const medRisks = params.full.risks?.filter((r) => r.severity === 'medium') || []

    const risksList = (params.full.risks || [])
      .slice(0, 8)
      .map(
        (r, i) =>
          `${i + 1}. [${r.severity.toUpperCase()}] ${r.title}\n   ${r.description.slice(0, 280)}${r.description.length > 280 ? '…' : ''}`
      )
      .join('\n\n')

    const text = `🔍 <b>Экспресс-аудит устава!</b>

👤 <b>Клиент:</b> ${params.name}
📧 <b>Email:</b> ${params.email || '—'}
📞 <b>Телефон:</b> ${params.phone || '—'}
📄 <b>Файл:</b> ${params.fileName}

⭐ <b>Балл соответствия:</b> ${params.score}/100
⚠️ <b>Проблем найдено:</b> ${params.issuesCount} (критичных: ${highRisks.length}, средних: ${medRisks.length})

<b>Резюме:</b>
${params.full.summary || '—'}

<b>Риски:</b>
${risksList || '—'}

${params.full.missing_sections?.length ? `<b>Отсутствуют разделы:</b>\n${params.full.missing_sections.map((s) => '• ' + s).join('\n')}` : ''}

👉 <b>Действие:</b> связаться с клиентом, предложить полный аудит с готовыми правками. Email: ${params.email}`

    await sendTelegramMessage(text)
  } catch (e) {
    console.warn('[express-audit] Telegram notify failed:', e)
  }
}

/* ─── MAIN: POST /api/express-audit ─── */
export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    // multipart/form-data
    const formData = await request.formData()
    const name = (formData.get('name') as string)?.trim() || ''
    const email = (formData.get('email') as string)?.trim() || ''
    const phone = (formData.get('phone') as string)?.trim() || ''
    const consentRaw = formData.get('consentAccepted')
    const consentAccepted = consentRaw === 'true' || consentRaw === 'on' || consentRaw === '1'
    const honeypot = formData.get('website') as string | null
    const file = formData.get('file') as File | null

    /* ─── Валидация ─── */
    // Honeypot: бот заполнил скрытое поле
    if (honeypot) {
      return NextResponse.json({ ok: true, preview: null }, { status: 200 })
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Укажите имя (минимум 2 символа)' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Укажите корректный email — на него придёт полный аудит' }, { status: 400 })
    }
    if (!consentAccepted) {
      return NextResponse.json({ error: 'Требуется согласие на обработку персональных данных (152-ФЗ)' }, { status: 400 })
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Загрузите файл устава (PDF, DOCX, TXT, RTF)' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Файл слишком большой (максимум ${MAX_FILE_SIZE / 1024 / 1024} МБ). Сохраните устав без сканов.` }, { status: 400 })
    }

    // Проверка типа файла
    const fileName = file.name || 'ustav.pdf'
    const ext = (fileName.toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || ''
    const mimeType = file.type || ''
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({
        error: `Неподдерживаемый формат. Разрешены: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`,
      }, { status: 400 })
    }

    /* ─── Rate limit ─── */
    const forwarded = request.headers.get('x-forwarded-for')
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown')
    const userAgent = request.headers.get('user-agent') || ''

    const rate = checkAuditRate(rawIp)
    if (!rate.allowed) {
      return NextResponse.json({
        error: 'Слишком много запросов аудита за последний час (лимит 5). Попробуйте позже или закажите полный аудит.',
      }, { status: 429 })
    }

    /* ─── Извлечение текста ─── */
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const extraction = await extractText(buffer, fileName, mimeType)
    if (!extraction.success) {
      return NextResponse.json({ error: extraction.error || 'Не удалось извлечь текст из файла.' }, { status: 400 })
    }

    // Ограничиваем длину для LLM
    const docText = extraction.text.slice(0, MAX_USTAV_CHARS)

    /* ─── LLM-анализ ─── */
    let full: FullAuditResult
    try {
      // Прямой вызов DeepSeek с response_format: json_object — гарантирует строгий JSON.
      // Обходим chatWithAI, т.к. он не поддерживает response_format.
      const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
      const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'

      if (!DEEPSEEK_API_KEY) {
        console.error('[express-audit] DEEPSEEK_API_KEY не настроен')
        return NextResponse.json({
          error: 'Сервис анализа временно недоступен. Закажите полный аудит — наш юрист проверит вручную.',
        }, { status: 503 })
      }

      const llmRes = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: EXPRESS_AUDIT_CHAT_OPTIONS.model,
          messages: [
            { role: 'system', content: EXPRESS_AUDIT_SYSTEM_PROMPT },
            { role: 'user', content: buildUserMessage(docText, fileName) },
          ],
          temperature: EXPRESS_AUDIT_CHAT_OPTIONS.temperature,
          max_tokens: EXPRESS_AUDIT_CHAT_OPTIONS.maxTokens,
          response_format: { type: 'json_object' },
        }),
      })

      if (!llmRes.ok) {
        const errText = await llmRes.text()
        console.error('[express-audit] DeepSeek API error:', llmRes.status, errText.slice(0, 300))
        return NextResponse.json({
          error: 'Сервис анализа временно недоступен. Попробуйте через минуту или закажите полный аудит.',
        }, { status: 503 })
      }

      const llmData = await llmRes.json()
      const choice = llmData.choices?.[0]
      const finishReason = choice?.finish_reason
      const content: string = choice?.message?.content || ''

      console.log(
        `[express-audit] LLM finish_reason=${finishReason} tokens=${llmData.usage?.completion_tokens} content_len=${content.length}`
      )

      const parsed = parseAuditJson(content)
      if (!parsed) {
        console.error('[express-audit] JSON не распарсен даже после восстановления. finish_reason:', finishReason, 'content_len:', content.length)
        return NextResponse.json({
          error: 'Не удалось проанализировать устав. Попробуйте другой файл (PDF/DOCX) или закажите полный аудит — наш юрист проверит вручную.',
        }, { status: 422 })
      }
      full = parsed
    } catch (llmErr: any) {
      console.error('[express-audit] LLM error:', llmErr?.message)
      return NextResponse.json({
        error: 'Сервис анализа временно недоступен. Попробуйте через минуту или закажите полный аудит.',
      }, { status: 503 })
    }

    // Проверка, что документ — действительно устав
    if (!isValidAuditResult(full)) {
      return NextResponse.json({
        error: 'Загруженный документ не похож на устав потребительского кооператива. Загрузите именно устав ПК.',
      }, { status: 422 })
    }

    /* ─── Превью для клиента (без конкретики) ─── */
    const preview: AuditPreview = buildPreview(full)

    /* ─── Создание лида в Payload ─── */
    let leadId: string | number | null = null
    try {
      const leadMessage =
        `[Экспресс-аудит устава] Файл: ${fileName}. ` +
        `Балл: ${preview.complianceScore}/100. ` +
        `Проблем: ${preview.totalIssuesFound} (отсутствует разделов: ${preview.missingSectionsCount}). ` +
        `Полный результат отправлен в Telegram-бот. ` +
        `Свяжитесь с клиентом для предложения полного аудита.`
      const lead = await payloadApi('/leads', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone: phone || null,
          email,
          message: leadMessage,
          source: 'consultation', // ближайшая доступная опция из select в коллекции Leads
          status: 'new',
          consentAccepted: true,
          consentAt: new Date().toISOString(),
          ipAddress: anonymizeIp(rawIp),
          ipHash: hashIp(rawIp),
          userAgent: userAgent.slice(0, 500),
        }),
      })
      leadId = lead.doc?.id || lead.id || null
    } catch (leadErr) {
      // Лид не создался — не блокируем отдачу результата клиенту
      console.error('[express-audit] Lead creation failed:', leadErr)
    }

    /* ─── Telegram с полным результатом (для Велеслава) ─── */
    await notifyExpressAudit({
      name,
      email,
      phone,
      fileName,
      score: preview.complianceScore,
      issuesCount: preview.totalIssuesFound,
      full,
    })

    console.log(
      `[express-audit] OK name=${name} file=${fileName} score=${preview.complianceScore} ` +
      `issues=${preview.totalIssuesFound} lead=${leadId} ${Date.now() - startedAt}ms`
    )

    return NextResponse.json({
      ok: true,
      preview,
      leadId,
    }, { status: 200 })
  } catch (error: any) {
    console.error('[express-audit] FATAL:', error?.message, error?.stack)
    return NextResponse.json({
      error: 'Внутренняя ошибка сервера. Попробуйте позже или позвоните +7 (902) 472-07-38.',
    }, { status: 500 })
  }
}

/* ─── Health-check (для мониторинга) ─── */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'express-audit',
    acceptedFormats: ALLOWED_EXTENSIONS,
    maxSizeMb: MAX_FILE_SIZE / 1024 / 1024,
  })
}
