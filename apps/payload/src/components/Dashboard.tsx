'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type CardState = {
  leadsNew: number | null
  leadsTotal: number | null
  ordersWeek: number | null
  enrollments: number | null
  bookings: number | null
}

type LeadRow = {
  id: number | string
  name?: string | null
  phone?: string | null
  email?: string | null
  status?: string | null
  createdAt?: string | null
}

const statusLabels: Record<string, string> = {
  new: 'Новая',
  processing: 'В обработке',
  contacted: 'Связались',
  qualified: 'Квалифицирована',
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

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

export const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState<CardState | null>(null)
  const [leads, setLeads] = useState<LeadRow[] | null>(null)

  useEffect(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    void (async () => {
      const [leadsNew, leadsTotal, ordersWeek, enrollments, bookings] = await Promise.all([
        fetchTotal('leads', 'where[status][equals]', 'new'),
        fetchTotal('leads'),
        fetchTotal('orders', 'where[createdAt][greater_than]', weekAgo),
        fetchTotal('enrollments'),
        fetchTotal('consultation-bookings'),
      ])
      let recent: LeadRow[] | null = null
      try {
        const res = await fetch('/api/leads?limit=8&sort=-createdAt&depth=0', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          recent = Array.isArray(data?.docs) ? data.docs : null
        }
      } catch {
        recent = null
      }
      setCounts({ leadsNew, leadsTotal, ordersWeek, enrollments, bookings })
      setLeads(recent)
    })()
  }, [])

  const cards = counts
    ? [
        counts.leadsNew !== null && { label: 'Новые заявки', value: counts.leadsNew, href: '/admin/collections/leads?limit=10&where[status][equals]=new' },
        counts.leadsTotal !== null && { label: 'Заявок всего', value: counts.leadsTotal, href: '/admin/collections/leads' },
        counts.ordersWeek !== null && { label: 'Заказы за 7 дней', value: counts.ordersWeek, href: '/admin/collections/orders' },
        counts.enrollments !== null && { label: 'Записи на курсы', value: counts.enrollments, href: '/admin/collections/enrollments' },
        counts.bookings !== null && { label: 'Консультации', value: counts.bookings, href: '/admin/collections/consultation-bookings' },
      ].filter(Boolean) as { label: string; value: number; href: string }[]
    : []

  const nothingVisible = cards.length === 0 && !leads

  return (
    <div className="skpk-dash">
      <style>{`
        .skpk-dash { margin-bottom: calc(var(--base) * 3); }
        .skpk-dash h2 { margin: 0 0 calc(var(--base) * 1.5); font-size: calc(var(--base) * 2.5); font-weight: 600; }
        .skpk-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; margin-bottom: calc(var(--base) * 3); }
        .skpk-card { display: block; padding: 16px; border: 1px solid var(--theme-elevation-150); border-radius: var(--style-radius-m); background: var(--theme-elevation-0); text-decoration: none; transition: border-color .15s ease; }
        .skpk-card:hover { border-color: var(--theme-elevation-400); }
        .skpk-card__value { font-size: 28px; font-weight: 700; line-height: 1.2; color: var(--theme-text); }
        .skpk-card__label { margin-top: 4px; font-size: 13px; color: var(--theme-elevation-600); }
        .skpk-table { width: 100%; border-collapse: collapse; border: 1px solid var(--theme-elevation-150); border-radius: var(--style-radius-m); overflow: hidden; }
        .skpk-table th { text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; color: var(--theme-elevation-600); background: var(--theme-elevation-50); border-bottom: 1px solid var(--theme-elevation-150); }
        .skpk-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid var(--theme-elevation-100); color: var(--theme-text); }
        .skpk-table tr:last-child td { border-bottom: none; }
        .skpk-status { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 12px; background: var(--theme-elevation-100); color: var(--theme-text); }
        .skpk-status--new { background: var(--theme-success-300); color: var(--theme-success-900, #052e12); }
        .skpk-alllink { font-size: 13px; color: var(--theme-elevation-600); }
      `}</style>

      <h2>Рабочий стол</h2>

      {cards.length > 0 && (
        <div className="skpk-cards">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="skpk-card">
              <div className="skpk-card__value">{c.value}</div>
              <div className="skpk-card__label">{c.label}</div>
            </Link>
          ))}
        </div>
      )}

      {leads && leads.length > 0 && (
        <div>
          <table className="skpk-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{formatDate(l.createdAt)}</td>
                  <td>{l.name || '—'}</td>
                  <td>{l.phone || '—'}</td>
                  <td>{l.email || '—'}</td>
                  <td>
                    <span className={`skpk-status${l.status === 'new' ? ' skpk-status--new' : ''}`}>
                      {statusLabels[l.status || ''] || l.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 8, textAlign: 'right' }}>
            <Link href="/admin/collections/leads" className="skpk-alllink">Все заявки →</Link>
          </p>
        </div>
      )}

      {nothingVisible && null}
    </div>
  )
}

export default Dashboard
