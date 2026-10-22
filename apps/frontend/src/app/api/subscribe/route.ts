import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

async function payloadApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Payload API ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text)
}

// Псевдонимизация IP (152-ФЗ) — как в /api/leads
function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null
  const v4 = ip.match(/^(\d+\.\d+\.\d+\.)\d+$/)
  if (v4) return `${v4[1]}0`
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::'
  return null
}
const IP_SALT = process.env.IP_HASH_SALT || 'pk-ip-salt-set-in-env'
function hashIp(ip: string | null): string | null {
  if (!ip) return null
  return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex')
}
function trustedIp(request: NextRequest): string | null {
  const real = request.headers.get('x-real-ip')
  if (real && /^\d+\.\d+\.\d+\.\d+$/.test(real.trim())) return real.trim()
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return null
}

// Письмо-подтверждение (double opt-in + фиксация согласия 152-ФЗ) — чистый минимализм
function confirmEmailHtml(link: string): { html: string; text: string } {
  return {
    html: `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff">
<div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px 16px;color:#1c1c1c;font-size:15px;line-height:1.6">
<p style="margin:0 0 8px;font-size:13px;color:#8a7a68;letter-spacing:0.06em;text-transform:uppercase">Школа потребительской кооперации</p>
<h1 style="margin:0 0 16px;font-size:20px;font-weight:700">Подтвердите подписку</h1>
<p style="margin:0 0 12px">Здравствуйте! Кто-то — надеемся, вы — указал этот адрес в форме подписки на сайте велеслав.рус.</p>
<p style="margin:0 0 16px">Чтобы мы точно знали, что письма нужны именно вам, подтвердите подписку:</p>
<p style="margin:0 0 16px"><a href="${link}" style="color:#A85028;font-weight:700">Подтвердить подписку&rarr;</a></p>
<p style="margin:0 0 16px;font-size:13px;color:#666">Если ссылка не сработала, скопируйте этот адрес в браузер:<br><span style="color:#888;word-break:break-all">${link}</span></p>
<p style="margin:16px 0 0;padding-top:14px;border-top:1px solid #e8e2da;font-size:12px;color:#999">
Подтверждая подписку, вы соглашаетесь на обработку своего email-адреса для отправки писем о потребительской кооперации (ФЗ-152 «О персональных данных»). Данные не передаются третьим лицам; время подтверждения фиксируется как момент согласия. Не вы? Просто удалите это письмо — ничего приходить не будет.
</p>
</div></body></html>`,
    text:
`Школа потребительской кооперации\n\nПОДТВЕРДИТЕ ПОДПИСКУ\n\nЗдравствуйте! Кто-то — надеемся, вы — указал этот адрес в форме подписки на сайте велеслав.рус.\n\nЧтобы письма приходили именно вам, подтвердите подписку по ссылке:\n${link}\n\nПодтверждая подписку, вы соглашаетесь на обработку email-адреса для рассылки писем о потребительской кооперации (ФЗ-152). Данные не передаются третьим лицам. Не вы — просто удалите это письмо.`,
  }
}

// POST /api/subscribe — подписка с double opt-in (кнопка «Подписаться» в подвале)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, consent } = body

    if (body.website) return NextResponse.json({ ok: true })  // honeypot

    const em = String(email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) || em.length > 254) {
      return NextResponse.json({ error: 'Укажите корректный email' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Отметьте согласие на обработку email (152-ФЗ)' }, { status: 400 })
    }

    const rawIp = trustedIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    const confirmToken = crypto.randomBytes(20).toString('hex')
    const unsubToken = crypto.randomBytes(20).toString('hex')

    // 1) узнаём статус адреса через Local API CMS (не полагаемся на текст ошибок дубля)
    let status: string = 'none'
    let sendToken: string = confirmToken
    try {
      const r = await payloadApi('/subscribers/reactivate', {
        method: 'POST',
        body: JSON.stringify({ email: em }),
      })
      status = r.status || 'none'
      sendToken = r.token || confirmToken
    } catch { /* адреса нет — создаём ниже */ }

    // 2) новый адрес — создаём с токенами
    if (status === 'none') {
      try {
        await payloadApi('/subscribers', {
          method: 'POST',
          body: JSON.stringify({
            email: em,
            source: String(source || 'footer').slice(0, 60),
            status: 'pending',
            funnelStep: 0,
            confirmToken,
            unsubToken,
            ipAddress: anonymizeIp(rawIp),
            ipHash: hashIp(rawIp),
            userAgent: userAgent.slice(0, 500),
          }),
        })
        status = 'pending'
        sendToken = confirmToken
      } catch (e: any) {
        const msg = String(e.message || '')
        if (/unique|Duplicate|уникальн|недействительно/i.test(msg)) {
          // параллельная подписка тем же адресом — тихо считаем pending
          status = 'pending'
          try {
            const r = await payloadApi('/subscribers/reactivate', {
              method: 'POST', body: JSON.stringify({ email: em }),
            })
            sendToken = r.token || confirmToken
          } catch { /* оставляем свой токен */ }
        } else {
          throw e
        }
      }
    }

    if (status !== 'active') {
      const link = `https://велеслав.рус/api/subscribers/confirm?token=${sendToken}`
      // Правило доставки: гугловские адреса (gmail/googlemail и корпоративные Google-домены)
      // получают письма ТОЛЬКО с личного ящика boss@2980738.ru — канал с наилучшей репутацией;
      // все остальные — тоже с него (единый надёжный путь, 22@ оставляем для массовых рассылок).
      const isGoogleMail = /@(gmail|googlemail)\.[a-z]+$/i.test(em)
      if (isGoogleMail) console.log(`[Subscribe] ${em}: google-адрес → отправка строго с boss@`)
      const { sendPersonalEmail } = await import('@/lib/email')
      const letter = confirmEmailHtml(link)
      const sent = await sendPersonalEmail({
        to: em,
        subject: 'Подтвердите подписку — Школа ПК',
        html: letter.html,
        text: letter.text,
      })
      if (!sent) throw new Error('email send failed')
      console.log(`[Subscribe] письмо-подтверждение → ${em}`)
      // уведомление владельцу (TG с сервера недоступен — дублируем письмом)
      sendPersonalEmail({
        to: 'boss@2980738.ru',
        subject: `Новый подписчик: ${em}`,
        text: `Новый подписчик на рассылку: ${em}\nСтатус: ожидает подтверждения (double opt-in).\nИсточник: ${String(source || 'footer')}`,
        html: `<div style="font-family:Tahoma,sans-serif;font-size:14px;color:#1c1c1c">Новый подписчик: <b>${em}</b><br>Ожидает подтверждения. Источник: ${String(source || 'footer')}</div>`,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, needConfirm: status !== 'active' })
  } catch (error: any) {
    console.error('[subscribe] error:', error)
    return NextResponse.json({ error: 'Не получилось. Попробуйте позже или напишите нам: boss@2980738.ru' }, { status: 500 })
  }
}
