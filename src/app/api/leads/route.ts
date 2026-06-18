import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

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

// Псевдонимизация IP (152-ФЗ) — последние 3 цифры обнуляем
function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null
  // IPv4: 192.168.1.42 → 192.168.1.0
  const v4 = ip.match(/^(\d+\.\d+\.\d+\.)\d+$/)
  if (v4) return `${v4[1]}0`
  // IPv6 — возвращаем префикс /64
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::'
  return ip
}

// POST /api/leads — приём заявки с формы
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, message, source, courseSlug, consentAccepted } = body

    // Валидация
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Имя обязательно (минимум 2 символа)' }, { status: 400 })
    }
    if (!phone && !email) {
      return NextResponse.json({ error: 'Укажите телефон или email' }, { status: 400 })
    }
    if (!consentAccepted) {
      return NextResponse.json({ error: 'Требуется согласие на обработку персональных данных (152-ФЗ)' }, { status: 400 })
    }

    // Анти-спам: honeypot поле (если заполнено — бот)
    if (body.website) {
      return NextResponse.json({ ok: true }) // тихо отвечаем OK, но не сохраняем
    }

    // Извлекаем IP и User-Agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || null)
    const userAgent = request.headers.get('user-agent') || ''

    // Создаём лид в Payload
    const lead = await payloadApi('/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        message: message?.trim() || null,
        source: source || 'homepage',
        courseSlug: courseSlug || null,
        status: 'new',
        consentAccepted: true,
        consentAt: new Date().toISOString(),
        ipAddress: anonymizeIp(ip),
        userAgent: userAgent.slice(0, 500), // ограничиваем длину
      }),
    })

    console.log(`[Lead] New lead created: ${name} from ${source || 'homepage'}`)

    return NextResponse.json({
      ok: true,
      leadId: lead.doc?.id || lead.id,
      message: 'Заявка принята. Мы свяжемся с вами в ближайшее время.',
    }, { status: 201 })

  } catch (error) {
    console.error('[Leads API] Error:', error)
    return NextResponse.json({
      error: 'Ошибка сервера. Попробуйте позже или позвоните +7 (902) 472-07-38',
    }, { status: 500 })
  }
}

// GET /api/leads — список заявок (только для админа)
export async function GET(request: NextRequest) {
  try {
    // Простая проверка токена через Payload
    const auth = request.headers.get('authorization')
    if (!auth) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    const status = searchParams.get('status')

    let path = `/leads?limit=${limit}&page=${page}&sort=-createdAt`
    if (status) path += `&where[status][equals]=${status}`

    const data = await payloadApi(path, {
      headers: { Authorization: auth },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Leads API GET] Error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
