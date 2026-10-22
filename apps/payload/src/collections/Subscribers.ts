import type { CollectionConfig } from 'payload'

// Подписчики рассылки (кнопка «Подписаться» в подвале сайта).
// Создание — публичное (форма футера), чтение/правка — только админ/менеджер.
// /api/subscribers/unsub?token=... — публичная отписка одной ссылкой (152-ФЗ).
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Подписчик', plural: 'Подписчики' },
  admin: {
    group: 'CRM',
    defaultColumns: ['email', 'status', 'source', 'funnelStep', 'createdAt'],
    useAsTitle: 'email',
  },
  access: {
    create: () => true,
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  endpoints: [
    {
      // подтверждение подписки (double opt-in) — переход по ссылке из письма
      path: '/confirm',
      method: 'get',
      handler: async (req: any) => {
        let token = String(req?.query?.get?.('token') || '')
        if (!token && req?.url) {
          try { token = new URL(req.url, 'http://local').searchParams.get('token') || '' } catch { /* ignore */ }
        }
        if (!token && req?.query && typeof req.query === 'object') {
          token = String((req.query as any).token || '')
        }
        console.log('[confirm] query=', JSON.stringify(req?.query), 'url=', String(req?.url).slice(0, 80), '→ token len', token.length)
        const reOk = /^[a-f0-9]{32,64}$/
        const page = (title: string, body: string) => new Response(
          '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title></head>' +
          '<body style="font-family:Tahoma,sans-serif;background:#14110d;color:#D6C6B2;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
          '<div style="max-width:560px;text-align:center;padding:2rem">' + body +
          '<p style="margin-top:1.5rem"><a href="https://велеслав.рус" style="color:#C06030">← на велеслав.рус</a></p></div></body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        )
        if (!reOk.test(token)) {
          return page('Подписка', '<h2>Некорректная ссылка</h2>')
        }
        const found = await req.payload.find({
          collection: 'subscribers', where: { confirmToken: { equals: token } }, limit: 1, depth: 0,
        })
        const doc = found.docs[0]
        if (!doc) {
          return page('Подписка', '<h2>Ссылка не найдена</h2><p>Возможно, подписка уже подтверждена. Письма приходят на ваш адрес.</p>')
        }
        if (doc.status !== 'active') {
          await req.payload.update({
            collection: 'subscribers', id: doc.id,
            data: { status: 'active', funnelStep: 0, funnelSentAt: null },
          })
        }
        // welcome-письмо шлёт фронт (там SMTP): внутренний вызов, снаружи путь закрыт nginx-маршрутизацией
        try {
          await fetch('http://127.0.0.1:3000/api/subscribe/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Internal-Call': '1' },
            body: JSON.stringify({ email: doc.email, unsubToken: doc.unsubToken }),
          })
        } catch (e: any) { /* письмо воронки догонит cron */ }
        return page('Подписка подтверждена',
          '<h2 style="color:#8fbf7f">Подписка подтверждена ✓</h2>' +
          '<p>Первое письмо с лучшими материалами уже отправлено на ваш адрес. ' +
          'Согласие на обработку данных (152-ФЗ) зафиксировано временем подтверждения.</p>')
      },
    },
    {
      // внутренний: статус по email + реактивация/перевыпуск (для фронт-роута подписки)
      path: '/reactivate',
      method: 'post',
      handler: async (req: any) => {
        let email = ''
        try { email = String((await req.json?.())?.email || '') } catch { /* пустое тело */ }
        email = email.trim().toLowerCase()
        const reMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
        if (!reMail.test(email)) return Response.json({ error: 'bad email' }, { status: 400 })
        const found = await req.payload.find({
          collection: 'subscribers', where: { email: { equals: email } }, limit: 1, depth: 0,
        })
        const doc = found.docs[0]
        if (!doc) return Response.json({ ok: true, status: 'none' })
        const crypto = await import('crypto')
        if (doc.status === 'unsubscribed') {
          await req.payload.update({
            collection: 'subscribers', id: doc.id,
            data: { status: 'pending', funnelStep: 0, funnelSentAt: null },
          })
        }
        // перевыпуск токена подтверждения, если он ещё не подтверждён
        let token = doc.confirmToken
        if (doc.status !== 'active') {
          token = crypto.randomBytes(20).toString('hex')
          await req.payload.update({
            collection: 'subscribers', id: doc.id,
            data: { confirmToken: token },
          })
        }
        return Response.json({ ok: true, status: doc.status === 'active' ? 'active' : 'pending', token })
      },
    },
    {
      path: '/unsub',
      method: 'get',
      handler: async (req: any) => {
        const token = String(req?.query?.get?.('token') || req?.searchParams?.get?.('token') || '');
        const reOk = /^[a-f0-9]{32,64}$/;
        if (!reOk.test(token)) {
          return new Response('Некорректная ссылка отписки', { status: 400 })
        }
        const found = await req.payload.find({
          collection: 'subscribers',
          where: { unsubToken: { equals: token } },
          limit: 1,
          depth: 0,
        })
        const doc = found.docs[0]
        if (!doc) {
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>Отписка</title></head>' +
            '<body style="font-family:Tahoma,sans-serif;background:#14110d;color:#D6C6B2;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
            '<div style="text-align:center"><h2>Ссылка не найдена</h2><p>Возможно, вы уже отписались ранее.</p></div></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          )
        }
        await req.payload.update({
          collection: 'subscribers',
          id: doc.id,
          data: { status: 'unsubscribed' },
        })
        return new Response(
          '<!doctype html><html><head><meta charset="utf-8"><title>Отписка</title></head>' +
          '<body style="font-family:Tahoma,sans-serif;background:#14110d;color:#D6C6B2;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
          '<div style="text-align:center"><h2>Вы отписаны 🌿</h2><p>Писем больше не будет. Если передумаете — форма подписки в подвале сайта велеслав.рус.</p>' +
          '<p style="margin-top:1.5rem"><a href="https://велеслав.рус" style="color:#C06030">← на велеслав.рус</a></p></div></body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        )
      },
    },
  ],
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text' },
    { name: 'source', type: 'text', defaultValue: 'footer' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Ожидает подтверждения', value: 'pending' },
        { label: 'Активен', value: 'active' },
        { label: 'Отписался', value: 'unsubscribed' },
      ],
    },
    { name: 'funnelStep', type: 'number', defaultValue: 0, admin: { description: 'Шаг воронки, отправленный подписчику' } },
    { name: 'funnelSentAt', type: 'date', admin: { description: 'Когда ушли последние письмо воронки' } },
    { name: 'confirmToken', type: 'text', unique: true, admin: { readOnly: true, description: 'Токен подтверждения подписки (double opt-in)' } },
    { name: 'unsubToken', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'ipAddress', type: 'text' },
    { name: 'ipHash', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
}

export default Subscribers
