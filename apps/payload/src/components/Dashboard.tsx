'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type LeadRow = {
  id: number | string
  name?: string | null
  phone?: string | null
  email?: string | null
  status?: string | null
  createdAt?: string | null
}

type DealRow = {
  id: number | string
  title?: string | null
  stage?: string | null
  amount?: number | null
  clientName?: string | null
}

async function fetchTotal(collection: string, whereKey?: string, whereValue?: string): Promise<number | null> {
  try {
    const params = new URLSearchParams({ limit: '1', depth: '0' })
    if (whereKey && whereValue) params.set(whereKey, whereValue)
    const res = await fetch(`/api/${collection}?${params.toString()}`, { credentials: 'same-origin' })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.totalDocs === 'number' ? data.totalDocs : null
  } catch {
    return null
  }
}

const statusLabels: Record<string, string> = {
  new: 'Новая',
  processing: 'В обработке',
  contacted: 'Связались',
  qualified: 'Квалифицирована',
  consultation: 'Консультация',
  proposal: 'КП отправлено',
  thinking: 'Думает',
  sleeping: 'Спящий',
  converted: 'Конвертирована',
  closed: 'Закрыта',
}

const fmtDate = (iso?: string | null) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

const TILE = (to: string, icon: string, title: string, sub: string, count?: number | null, accent = '#6B4A2E') => ({
  to, icon, title, sub, count, accent,
})

export const Dashboard: React.FC = () => {
  const [leadsNew, setLeadsNew] = useState<number | null>(null)
  const [dealsOpen, setDealsOpen] = useState<number | null>(null)
  const [pagesN, setPagesN] = useState<number | null>(null)
  const [postsN, setPostsN] = useState<number | null>(null)
  const [subsN, setSubsN] = useState<number | null>(null)
  const [leads, setLeads] = useState<LeadRow[] | null>(null)
  const [deals, setDeals] = useState<DealRow[] | null>(null)

  useEffect(() => {
    void (async () => {
      const [ln, dOpen, pg, posts, subs] = await Promise.all([
        fetchTotal('leads', 'where[status][equals]', 'new'),
        fetchTotal('deals', 'where[stage][not_equals]', 'lost'),
        fetchTotal('pages'),
        fetchTotal('blog-posts'),
        fetchTotal('subscribers'),
      ])
      setLeadsNew(ln); setDealsOpen(dOpen); setPagesN(pg); setPostsN(posts); setSubsN(subs)
      try {
        const res = await fetch('/api/leads?limit=7&sort=-createdAt&depth=0', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          setLeads(Array.isArray(data?.docs) ? data.docs : [])
        }
      } catch { /* пусто */ }
      try {
        const res = await fetch('/api/deals?limit=7&sort=-updatedAt&depth=0', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          setDeals(Array.isArray(data?.docs) ? data.docs : [])
        }
      } catch { /* пусто */ }
    })()
  }, [])

  const tiles = [
    TILE('/admin/collections/leads/crm', '📥', 'CRM — Заявки', 'лиды с сайта и рассылок', leadsNew, '#b45309'),
    TILE('/admin/collections/deals/kanban', '🎯', 'Воронка сделок', 'продающая труба услуг', dealsOpen, '#4f7cff'),
    TILE('/admin/collections/pages', '📄', 'Страницы', 'контент сайта', pagesN),
    TILE('/admin/collections/blog-posts', '✍️', 'Блог', 'статьи и публикации', postsN, '#0e7a5f'),
    TILE('/admin/collections/subscribers', '📬', 'Подписчики', 'база рассылки', subsN, '#7c5cbf'),
    TILE('/admin/collections/client-projects', '🛠', 'Веб-студия', 'проекты клиентов', null, '#0b7285'),
    TILE('/admin/collections/courses', '🎓', 'Обучение', 'курсы и уроки', null, '#9a3412'),
    TILE('/admin/collections/users', '⚙️', 'Настройки', 'пользователи и доступы', null, '#52525b'),
  ]

  const tileStyle: React.CSSProperties = {
    display: 'block', textDecoration: 'none',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: 14, padding: '14px 16px', minHeight: 92,
    transition: 'background .15s, transform .15s',
  }

  return (
    <div style={{ padding: '22px 26px', fontFamily: 'Tahoma, system-ui, sans-serif', maxWidth: 1180, margin: '0 auto' }}>
      {/* Прячем штатную простыню карточек коллекций под нашим Рабочим столом */}
      <style>{'.widget-content .collections{display:none !important}'}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Рабочий стол Школы ПК</h1>
        <span style={{ opacity: 0.55, fontSize: 13 }}>велеслав.рус · модель С500</span>
      </div>
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: 0, marginBottom: 18 }}>
        Все разделы под рукой. {leadsNew !== null && dealsOpen !== null ? `Новых заявок: ${leadsNew} · открытых сделок: ${dealsOpen}.` : ''}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12, marginBottom: 26 }}>
        {tiles.map((t) => (
          <Link key={t.to + t.title} href={t.to} style={tileStyle} className="shk-tile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${t.accent}22`, borderRadius: 10, border: `1px solid ${t.accent}55` }}>{t.icon}</span>
              {t.count !== null && t.count !== undefined && (
                <span style={{ marginLeft: 'auto', background: t.accent, color: '#fff', borderRadius: 99, fontSize: 12, fontWeight: 700, padding: '2px 10px' }}>{t.count}</span>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 2 }}>{t.title}</div>
            <div style={{ fontSize: 12, opacity: 0.55 }}>{t.sub}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Последние заявки</h2>
            <Link href="/admin/collections/leads/crm" style={{ marginLeft: 'auto', fontSize: 12.5, opacity: 0.7 }}>все →</Link>
          </div>
          {leads === null ? <span style={{ opacity: .5, fontSize: 13 }}>загрузка…</span> : leads.length === 0 ? <span style={{ opacity: .5, fontSize: 13 }}>пока пусто</span> : leads.map((l) => (
            <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 13 }}>
              <span style={{ flex: 1 }}>
                <strong>{l.name || '—'}</strong>
                <span style={{ opacity: .5 }}> · {l.email || l.phone || ''}</span>
              </span>
              <span style={{ fontSize: 11.5, opacity: .55, background: 'rgba(255,255,255,.06)', padding: '2px 8px', borderRadius: 99 }}>{statusLabels[l.status || ''] || l.status}</span>
              <span style={{ fontSize: 11, opacity: .4, width: 92, textAlign: 'right' }}>{fmtDate(l.createdAt)}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Сделки в трубе</h2>
            <Link href="/admin/collections/deals/kanban" style={{ marginLeft: 'auto', fontSize: 12.5, opacity: 0.7 }}>воронка →</Link>
          </div>
          {deals === null ? <span style={{ opacity: .5, fontSize: 13 }}>загрузка…</span> : deals.length === 0 ? <span style={{ opacity: .5, fontSize: 13 }}>создайте первую сделку</span> : deals.map((d) => (
            <div key={d.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 13 }}>
              <span style={{ flex: 1 }}>
                <strong>{d.title || '—'}</strong>
                <span style={{ opacity: .5 }}> · {d.clientName || ''}</span>
              </span>
              <span style={{ opacity: .75 }}>{d.amount ? new Intl.NumberFormat('ru-RU').format(d.amount) + ' ₽' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`.shk-tile:hover{background:rgba(255,255,255,.07);transform:translateY(-1px)}`}</style>
    </div>
  )
}

export default Dashboard
