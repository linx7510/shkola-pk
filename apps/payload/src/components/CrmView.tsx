'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type LeadRow = {
  id: number | string
  name?: string | null
  phone?: string | null
  email?: string | null
  source?: string | null
  status?: string | null
  createdAt?: string | null
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'new', label: 'Новые' },
  { value: 'processing', label: 'В обработке' },
  { value: 'contacted', label: 'Связались' },
  { value: 'qualified', label: 'Квалифицирована' },
  { value: 'consultation', label: 'Консультация' },
  { value: 'proposal', label: 'КП отправлено' },
  { value: 'thinking', label: 'Думает' },
  { value: 'sleeping', label: 'Спящие' },
  { value: 'converted', label: 'Конвертирована' },
  { value: 'closed', label: 'Закрыта' },
]

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label.replace(/ые$|ая$|ы$|а$|а$/, (m) => m)]),
)

// Полные названия статусов для таблицы (единственное число)
const STATUS_TITLES: Record<string, string> = {
  new: 'Новая',
  processing: 'В обработке',
  contacted: 'Связались',
  qualified: 'Квалифицирована',
  consultation: 'Консультация',
  proposal: 'КП отправлено',
  thinking: 'Думает',
  sleeping: 'Спящая',
  converted: 'Конвертирована',
  closed: 'Закрыта',
}

const SOURCE_LABELS: Record<string, string> = {
  homepage: 'Главная форма',
  home_cta: 'Главная CTA',
  consultation: 'Консультация',
  'free-lesson': 'Бесплатный урок',
  contact: 'Контактная форма',
  registration: 'Регистрация ПК',
  'ai-audit': 'ИИ-аудит устава',
}

const PAGE_SIZE = 25

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

export const CrmView: React.FC = () => {
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [docs, setDocs] = useState<LeadRow[] | null>(null)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalDocs, setTotalDocs] = useState<number>(0)
  const [denied, setDenied] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [downloading, setDownloading] = useState<boolean>(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    searchTimer.current = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(page),
        depth: '0',
        sort: '-createdAt',
      })
      if (status) params.set('where[status][equals]', status)
      if (search.trim()) {
        const q = search.trim()
        params.set('where[or][0][name][like]', q)
        params.set('where[or][1][phone][like]', q)
        params.set('where[or][2][email][like]', q)
      }
      const res = await fetch(`/api/leads?${params.toString()}`, { credentials: 'same-origin' })
      if (res.status === 403) {
        setDenied(true)
        setDocs(null)
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      setDenied(false)
      setDocs(Array.isArray(data?.docs) ? data.docs : [])
      setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 1)
      setTotalDocs(typeof data?.totalDocs === 'number' ? data.totalDocs : 0)
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [status, search, page])

  useEffect(() => {
    void load()
  }, [load])

  const downloadCsv = useCallback(async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams({ format: 'csv' })
      if (status) params.set('status', status)
      const res = await fetch(`/api/crm-dashboard?${params.toString()}`, { credentials: 'same-origin' })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zayavki${status ? '-' + status : ''}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }, [status])

  const chips = useMemo(
    () => [{ value: '', label: 'Все' }, ...STATUS_OPTIONS],
    [],
  )

  if (denied) {
    return (
      <div className="skpk-crm">
        <style>{crmStyles}</style>
        <h1>CRM — Заявки</h1>
        <p className="skpk-crm__empty">Нет доступа: раздел доступен ролям «Администратор» и «Менеджер».</p>
      </div>
    )
  }

  return (
    <div className="skpk-crm">
      <style>{crmStyles}</style>
      <div className="skpk-crm__head">
        <h1>CRM — Заявки {totalDocs > 0 && <span className="skpk-crm__count">{totalDocs}</span>}</h1>
        <button type="button" className="skpk-crm__csv" onClick={downloadCsv} disabled={downloading}>
          {downloading ? 'Готовим…' : 'Экспорт CSV'}
        </button>
      </div>

      <div className="skpk-crm__filters">
        <div className="skpk-crm__chips">
          {chips.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`skpk-chip${status === c.value ? ' skpk-chip--active' : ''}`}
              onClick={() => {
                setStatus(c.value)
                setPage(1)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="skpk-crm__search"
          placeholder="Поиск по имени, телефону, email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="skpk-crm__empty">Загрузка…</p>
      ) : !docs || docs.length === 0 ? (
        <p className="skpk-crm__empty">Заявок не найдено.</p>
      ) : (
        <>
          <table className="skpk-crm__table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Источник</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((l) => (
                <tr key={l.id}>
                  <td>{formatDate(l.createdAt)}</td>
                  <td>
                    <Link href={`/admin/collections/leads/${l.id}`} className="skpk-crm__name">
                      {l.name || '—'}
                    </Link>
                  </td>
                  <td>{l.phone || '—'}</td>
                  <td>{l.email || '—'}</td>
                  <td>{SOURCE_LABELS[l.source || ''] || l.source || '—'}</td>
                  <td>
                    <span className={`skpk-status skpk-status--${l.status || 'new'}`}>
                      {STATUS_TITLES[l.status || ''] || l.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="skpk-crm__pager">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Назад</button>
              <span>Страница {page} из {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Вперёд →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const crmStyles = `
  .skpk-crm h1 { margin: 0 0 calc(var(--base) * 2); font-size: calc(var(--base) * 3); font-weight: 600; }
  .skpk-crm__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .skpk-crm__count { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 14px; background: var(--theme-elevation-100); color: var(--theme-elevation-800); vertical-align: middle; }
  .skpk-crm__csv { padding: 6px 14px; border: 1px solid var(--theme-elevation-150); border-radius: var(--style-radius-m); background: var(--theme-elevation-0); color: var(--theme-text); cursor: pointer; font-size: 13px; }
  .skpk-crm__csv:hover { border-color: var(--theme-elevation-400); }
  .skpk-crm__csv:disabled { opacity: .6; cursor: default; }
  .skpk-crm__filters { display: flex; flex-direction: column; gap: 10px; margin-bottom: calc(var(--base) * 2); }
  .skpk-crm__chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .skpk-chip { padding: 4px 12px; border: 1px solid var(--theme-elevation-150); border-radius: 20px; background: var(--theme-elevation-0); color: var(--theme-text); cursor: pointer; font-size: 13px; }
  .skpk-chip:hover { border-color: var(--theme-elevation-400); }
  .skpk-chip--active { background: var(--theme-elevation-900); color: var(--theme-elevation-0); border-color: var(--theme-elevation-900); }
  .skpk-crm__search { width: 100%; max-width: 420px; padding: 8px 12px; border: 1px solid var(--theme-elevation-150); border-radius: var(--style-radius-m); background: var(--theme-elevation-0); color: var(--theme-text); font-size: 14px; }
  .skpk-crm__table { width: 100%; border-collapse: collapse; border: 1px solid var(--theme-elevation-150); }
  .skpk-crm__table th { text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; color: var(--theme-elevation-600); background: var(--theme-elevation-50); border-bottom: 1px solid var(--theme-elevation-150); }
  .skpk-crm__table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid var(--theme-elevation-100); color: var(--theme-text); }
  .skpk-crm__name { color: var(--theme-text); text-decoration: none; border-bottom: 1px dashed var(--theme-elevation-400); }
  .skpk-crm__name:hover { color: var(--theme-success-600, #1a7f37); }
  .skpk-status { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; background: var(--theme-elevation-100); color: var(--theme-text); white-space: nowrap; }
  .skpk-status--new { background: var(--theme-success-300); color: #052e12; }
  .skpk-status--converted { background: var(--theme-success-500); color: #fff; }
  .skpk-status--closed, .skpk-status--sleeping { background: var(--theme-elevation-100); color: var(--theme-elevation-600); }
  .skpk-status--thinking, .skpk-status--proposal { background: var(--theme-warning-300, #ffe69c); color: #664d03; }
  .skpk-crm__empty { color: var(--theme-elevation-600); padding: calc(var(--base) * 2) 0; }
  .skpk-crm__pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: calc(var(--base) * 2); font-size: 13px; color: var(--theme-elevation-600); }
  .skpk-crm__pager button { padding: 6px 14px; border: 1px solid var(--theme-elevation-150); border-radius: var(--style-radius-m); background: var(--theme-elevation-0); color: var(--theme-text); cursor: pointer; }
  .skpk-crm__pager button:disabled { opacity: .5; cursor: default; }
`

export default CrmView
