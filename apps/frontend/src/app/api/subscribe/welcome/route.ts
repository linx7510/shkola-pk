import { NextRequest, NextResponse } from 'next/server'

// POST /api/subscribe/welcome — внутренний (вызывает CMS после confirm; снаружи путь уходит в /api → 3001).
// Шлёт приветственное письмо (шаг 1 воронки) сразу после подтверждения подписки.
function welcomeHtml(unsubLink: string): { html: string; text: string } {
  const L = (path: string) => `https://велеслав.рус${path}?utm_source=subscriber&utm_medium=email&utm_campaign=welcome`
  const links = [
    ['Потребительский кооператив как бизнес — полный разбор инструмента', L('/blog/potrebitelskiy-kooperativ-kak-biznes')],
    ['Обнуление НДС через ПК — главная математика модели, на пальцах', L('/blog/obnulenie-nds-cherez-potrebitelskiy-kooperativ')],
    ['ПК вне закона — чем кончаются серые схемы: три реальных дела', L('/blog/pk-vne-zakona-obnal-cherez-kooperativ')],
  ] as const
  const li = links.map(([t, u]) =>
    `<li style="margin:0 0 8px"><a href="${u}" style="color:#A85028">${t}</a></li>`).join('')
  const textLinks = links.map(([t, u]) => `- ${t}\n  ${u}`).join('\n')
  return {
    html: `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff">
<div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px 16px;color:#1c1c1c;font-size:15px;line-height:1.6">
<p style="margin:0 0 8px;font-size:13px;color:#8a7a68;letter-spacing:0.06em;text-transform:uppercase">Школа потребительской кооперации · с 2015 года</p>
<h1 style="margin:0 0 16px;font-size:20px;font-weight:700">Добро пожаловать! Три материала для старта</h1>
<p style="margin:0 0 12px">Здравствуйте! Это Велеслав Старков, Школа потребительской кооперации. Спасибо за подтверждение подписки — писать буду по делу: разборы, законы, живые кейсы и новые статьи. Не чаще 1–2 раз в неделю.</p>
<p style="margin:0 0 8px;font-weight:700">С чего начать:</p>
<ul style="margin:0 0 16px;padding-left:20px">
${li}
</ul>
<p style="margin:0 0 16px;padding:12px 14px;background:#f7f4ef;border-left:3px solid #C06030;font-size:14px"><b>Мини-книга в подарок:</b> «10 причин, почему бизнес открывает потребительский кооператив» — механика, цифры, ссылки на НК. <a href="https://велеслав.рус/mini-kniga-10-prichin-chast-1.pdf?utm_source=subscriber&utm_medium=email&utm_campaign=minikniga10&utm_content=welcome" style="color:#A85028;font-weight:700">Скачать часть 1 (PDF)</a>. Часть 2 — причины 6–10 и расчёт «пять лет завода с ПК» — придёт следующими письмами.</p><p style="margin:0 0 16px;padding:12px 14px;background:#f7f4ef;border-left:3px solid #C06030;font-size:14px"><b>Любите видео?</b> Бесплатный курс <a href="${L('/besplatno')}" style="color:#A85028">«Что такое потребительский кооператив»</a> — 13 коротких видео, за вечер — вся суть.</p>
<p style="margin:0 0 12px">Вопросы по теме? Просто ответьте на это письмо — читаю лично.</p>
<p style="margin:16px 0 0;padding-top:14px;border-top:1px solid #e8e2da;font-size:12px;color:#999">Вы получили это письмо, потому что подтвердили подписку на велеслав.рус.<br>Не нужны письма? <a href="${unsubLink}" style="color:#999">Отписаться</a>.</p>
</div></body></html>`,
    text: `Школа потребительской кооперации · с 2015 года\n\nДОБРО ПОЖАЛОВАТЬ! ТРИ МАТЕРИАЛА ДЛЯ СТАРТА\n\nЗдравствуйте! Это Велеслав Старков, Школа потребительской кооперации. Спасибо за подтверждение подписки — писать буду по делу, не чаще 1–2 раз в неделю.\n\nС чего начать:\n${textLinks}\nМИНИ-КНИГА В ПОДАРОК: «10 причин, почему бизнес открывает потребительский кооператив».\nСкачать часть 1 (PDF): https://велеслав.рус/mini-kniga-10-prichin-chast-1.pdf?utm_source=subscriber&utm_medium=email&utm_campaign=minikniga10&utm_content=welcome\nЧасть 2 придёт следующими письмами.\n\n\nЛюбите видео? Бесплатный курс «Что такое потребительский кооператив» — 13 коротких видео:\n${L('/besplatno')}\n\nВопросы по теме? Просто ответьте на это письмо — читаю лично.\n\n---\nВы получили это письмо, потому что подтвердили подписку на велеслав.рус.\nОтписаться: ${unsubLink}`,
  }
}

export async function POST(request: NextRequest) {
  // внутренний вызов: снаружи /api/subscribe/* не маршрутизируется на фронт (nginx → CMS)
  const ip = request.headers.get('x-real-ip')
  if (ip && ip !== '127.0.0.1') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  try {
    const { email, unsubToken } = await request.json()
    const em = String(email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
      return NextResponse.json({ error: 'bad email' }, { status: 400 })
    }
    const letter = welcomeHtml(`https://велеслав.рус/api/subscribers/unsub?token=${String(unsubToken || '')}`)
    const { sendPersonalEmail } = await import('@/lib/email')
    const ok = await sendPersonalEmail({
      to: em,
      subject: 'Добро пожаловать в Школу ПК — 3 материала для старта',
      html: letter.html,
      text: letter.text,
    })
    console.log(`[Subscribe] welcome → ${em}: ${ok ? 'отправлено' : 'ОШИБКА'}`)
    return NextResponse.json({ ok })
  } catch (e: any) {
    console.error('[subscribe/welcome] error:', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
