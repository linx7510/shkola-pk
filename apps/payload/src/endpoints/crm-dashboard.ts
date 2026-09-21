import type { PayloadRequest } from 'payload'

// CRM-дашборд минимум (Этап A): таблица лидов + фильтр по статусу + CSV-экспорт
// Доступ: только admin/manager (авторизация админки Payload)
export const crmDashboardEndpoint = {
  path: '/crm-dashboard',
  method: 'get' as const,
  handler: async (req: PayloadRequest) => {
    const user = (req as any).user
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return new Response('401: Требуется вход в админку Payload (роль admin или manager). Откройте /admin, войдите и вернитесь на /api/crm-dashboard', {
        status: 401,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const url = new URL(req.url || 'http://localhost')
    const status = url.searchParams.get('status') || ''
    const format = url.searchParams.get('format') || 'html'
    const limit = Math.min(Number(url.searchParams.get('limit') || 300), 1000)

    const leads = await req.payload.find({
      collection: 'leads',
      limit,
      sort: '-createdAt',
      depth: 0,
      where: status ? { status: { equals: status } } : {},
    })

    const docs = leads.docs as any[]

    if (format === 'csv') {
      const head = ['Дата', 'Имя', 'Телефон', 'Email', 'Источник', 'Статус', 'LeadScore', 'RiskScore', 'Сегмент', 'Возражение', 'Сообщение']
      const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const lines = [head.join(';')]
      for (const d of docs) {
        lines.push([
          new Date(d.createdAt).toLocaleString('ru-RU'),
          d.name, d.phone || '', d.email || '', d.source || '', d.status || '',
          d.leadScore ?? '', d.riskScore ?? '', d.segment || '', d.objection || '',
          (d.message || '').replace(/\s+/g, ' '),
        ].map(esc).join(';'))
      }
      return new Response('\uFEFF' + lines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    const stat: Record<string, number> = {}
    const all = await req.payload.find({ collection: 'leads', limit: 1000, depth: 0, sort: '-createdAt' })
    for (const d of (all.docs as any[])) stat[d.status || 'new'] = (stat[d.status || 'new'] || 0) + 1
    const statHtml = Object.entries(stat).map(([k, v]) => `<span style="display:inline-block;background:rgba(230,136,99,.12);border:1px solid rgba(230,136,99,.3);border-radius:999px;padding:4px 12px;margin:0 6px 6px 0;font-size:.85rem">${k}: <b>${v}</b></span>`).join('')

    const statusOptions = ['new', 'processing', 'contacted', 'qualified', 'consultation', 'proposal', 'thinking', 'sleeping', 'converted', 'closed']
    const rows = docs.map((d) => {
      const score = d.leadScore != null ? `<b style="color:#E68863">${d.leadScore}</b>` : '—'
      const risk = d.riskScore != null ? (d.riskScore >= 61 ? `<b style="color:#C94D4D">${d.riskScore} ⚠</b>` : String(d.riskScore)) : '—'
      return `<tr>
<td>${new Date(d.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
<td><b>${d.name || ''}</b></td>
<td>${d.phone || ''}<br><small>${d.email || ''}</small></td>
<td>${d.source || ''}</td>
<td>${d.status || ''}</td>
<td style="text-align:center">${score}</td>
<td style="text-align:center">${risk}</td>
<td>${d.segment || ''}</td>
<td>${(d.nextAction || '')}${(d.objection ? `<br><small>возражение: ${d.objection}</small>` : '')}</td>
</tr>`
    }).join('\n')

    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>CRM — Лиды (${docs.length})</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0D0C0A;color:#D6C6B2;margin:0;padding:2rem}
h1{font-size:1.4rem;color:#E7DCCF}
table{width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:.88rem}
th{background:rgba(230,136,99,.1);color:#E7DCCF;text-align:left;padding:.6rem .7rem;border:1px solid rgba(214,198,178,.14)}
td{padding:.55rem .7rem;border:1px solid rgba(214,198,178,.1);vertical-align:top}
tr:nth-child(even) td{background:rgba(214,198,178,.03)}
a{color:#E68863}
.nav{margin:1rem 0}.nav a{margin-right:.6rem;text-decoration:none;border:1px solid rgba(214,198,178,.2);padding:4px 10px;border-radius:999px;font-size:.85rem}
.nav a.on{border-color:rgba(230,136,99,.6);color:#E68863}
</style></head><body>
<h1>📋 CRM — Лиды <small style="color:#8A7E6F;font-size:.85rem">(${docs.length} последних)</small></h1>
<div class="nav"><a href="/api/crm-dashboard">все</a>${statusOptions.map(s => `<a href="/api/crm-dashboard?status=${s}">${s}</a>`).join('')}<a href="/api/crm-dashboard?format=csv">⬇ CSV</a></div>
<div>${statHtml}</div>
<table>
<tr><th>Дата</th><th>Имя</th><th>Контакты</th><th>Источник</th><th>Статус</th><th>Lead</th><th>Risk</th><th>Сегмент</th><th>Действие</th></tr>
${rows || '<tr><td colspan="9">Пусто</td></tr>'}
</table>
<p style="color:#8A7E6F;font-size:.8rem">Дашборд CRM v4.2 (Этап A). Управление статусами — в <a href="/admin/collections/leads" style="color:#E68863">админке Payload</a>.</p>
</body></html>`

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  },
}
