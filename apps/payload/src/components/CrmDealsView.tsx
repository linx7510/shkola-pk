'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from '@payloadcms/ui'

type Deal = {
  id: number | string
  title?: string | null
  service?: string | null
  stage?: string | null
  amount?: number | null
  source?: string | null
  clientName?: string | null
  clientContact?: string | null
  responsible?: string | null
  notes?: string | null
  updatedAt?: string | null
}

const STAGES: { value: string; label: string; color: string }[] = [
  { value: 'new', label: 'Новые', color: '#8d99ae' },
  { value: 'qualified', label: 'Квалифицированы', color: '#5c7cfa' },
  { value: 'proposal', label: 'КП отправлено', color: '#748ffc' },
  { value: 'negotiation', label: 'Согласование', color: '#f59f00' },
  { value: 'contract', label: 'Договор и оплата', color: '#fd7e14' },
  { value: 'work', label: 'В работе', color: '#20c997' },
  { value: 'won', label: 'Успех', color: '#37b24d' },
  { value: 'lost', label: 'Отказ', color: '#e8590c' },
]

const SERVICES: { value: string; label: string }[] = [
  { value: 'audit', label: 'Аудит устава' },
  { value: 'cpp', label: 'ЦПП' },
  { value: 'buh_start', label: 'Бух — Старт' },
  { value: 'buh_base', label: 'Бух — Базовый' },
  { value: 'buh_std', label: 'Бух — Стандартный' },
  { value: 'buh_vert', label: 'Бух — Вертикаль' },
  { value: 'site', label: 'Сайт' },
  { value: 'funnel', label: 'Воронка Б24' },
  { value: 'consult', label: 'Консультация' },
  { value: 'course', label: 'Обучение' },
  { value: 'other', label: 'Другое' },
]

const serviceLabel = (v?: string | null) => SERVICES.find((s) => s.value === v)?.label || '—'
const fmtMoney = (n?: number | null) =>
  n ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'

const STAGE_ORDER = STAGES.map((s) => s.value)

export const CrmDealsView = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', service: 'audit', amount: '', clientName: '', clientContact: '', source: 'site' })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/deals?limit=250&depth=0&sort=-updatedAt', { credentials: 'include' })
      const data = await res.json()
      setDeals(Array.isArray(data?.docs) ? data.docs : [])
    } catch {
      toast.error('Не удалось загрузить сделки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => (filter ? deals.filter((d) => d.service === filter) : deals),
    [deals, filter],
  )

  const byStage = useMemo(() => {
    const map: Record<string, Deal[]> = {}
    for (const s of STAGE_ORDER) map[s] = []
    for (const d of filtered) {
      const st = d.stage && map[d.stage] ? d.stage : 'new'
      map[st].push(d)
    }
    return map
  }, [filtered])

  const move = useCallback(
    async (deal: Deal, dir: 1 | -1) => {
      const idx = STAGE_ORDER.indexOf(deal.stage || 'new')
      const next = STAGE_ORDER[Math.min(Math.max(idx + dir, 0), STAGE_ORDER.length - 1)]
      if (next === deal.stage) return
      setDeals((prev) => prev.map((d) => (d.id === deal.id ? { ...d, stage: next } : d)))
      try {
        const res = await fetch(`/api/deals/${deal.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: next, closedAt: next === 'won' || next === 'lost' ? new Date().toISOString() : null }),
        })
        if (!res.ok) throw new Error()
        toast.success(`«${deal.title}» → ${STAGES.find((s) => s.value === next)?.label}`)
      } catch {
        toast.error('Перенос не сохранился')
        void load()
      }
    },
    [load],
  )

  const create = useCallback(async () => {
    if (!form.title.trim()) {
      toast.error('Название обязательно')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          service: form.service,
          stage: 'new',
          amount: form.amount ? Number(form.amount) : null,
          clientName: form.clientName || null,
          clientContact: form.clientContact || null,
          source: form.source,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Сделка создана')
      setShowForm(false)
      setForm({ title: '', service: 'audit', amount: '', clientName: '', clientContact: '', source: 'site' })
      void load()
    } catch {
      toast.error('Не удалось создать сделку')
    } finally {
      setBusy(false)
    }
  }, [form, load])

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8,
    border: '1px solid rgba(0,0,0,.18)', background: '#fff', fontSize: 14,
  }

  return (
    <div style={{ padding: '20px 24px', fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Воронка сделок</h1>
        <span style={{ color: '#6b7280', fontSize: 13 }}>
          {filtered.length} сделок ·{' '}
          {fmtMoney(filtered.reduce((s, d) => s + (d.stage !== 'lost' ? d.amount || 0 : 0), 0))} в трубе
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: 200 }}>
            <option value="">Все услуги</option>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#7C5C3E', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            + Сделка
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#f7f4ef', border: '1px solid rgba(0,0,0,.08)', borderRadius: 12, padding: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
          <input style={inputStyle} placeholder="Название (напр. «Аудит устава — ПК Остров»)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select style={inputStyle} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input style={inputStyle} placeholder="Сумма, ₽" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })} />
          <input style={inputStyle} placeholder="Клиент" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <input style={inputStyle} placeholder="Контакт (тел./email)" value={form.clientContact} onChange={(e) => setForm({ ...form, clientContact: e.target.value })} />
          <select style={inputStyle} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            <option value="site">Источник: сайт</option>
            <option value="welcome">Welcome-воронка</option>
            <option value="audit_funnel">Воронка аудита</option>
            <option value="referral">Сарафан</option>
            <option value="social">Соцсети</option>
            <option value="direct">Прямое обращение</option>
            <option value="repeat">Повторный клиент</option>
            <option value="other">Другое</option>
          </select>
          <button onClick={create} disabled={busy} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#37b24d', color: '#fff', fontWeight: 600, cursor: busy ? 'wait' : 'pointer', fontSize: 14 }}>
            Создать
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#6b7280' }}>Загрузка…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(210px, 1fr))', gap: 10, alignItems: 'start', overflowX: 'auto' }}>
          {STAGES.map((st) => {
            const items = byStage[st.value] || []
            const sum = items.reduce((s, d) => s + (d.amount || 0), 0)
            return (
              <div key={st.value} style={{ background: 'rgba(0,0,0,.02)', borderRadius: 12, padding: 8, minHeight: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px 10px' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                  <strong style={{ fontSize: 12.5, flex: 1 }}>{st.label}</strong>
                  <span style={{ fontSize: 11.5, color: '#6b7280' }}>{items.length}</span>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', padding: '0 6px 8px' }}>{fmtMoney(sum)}</div>
                {items.map((d) => (
                  <div key={d.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderLeft: `3px solid ${st.color}`, borderRadius: 10, padding: '8px 10px', marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3, marginBottom: 4 }}>{d.title}</div>
                    <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4 }}>
                      {d.clientName || '—'} · {serviceLabel(d.service)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 12.5, color: '#374151', flex: 1 }}>{fmtMoney(d.amount)}</strong>
                      {st.value !== 'new' && (
                        <button title="Стадией назад" onClick={() => move(d, -1)} style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, padding: '1px 7px' }}>←</button>
                      )}
                      {st.value !== 'lost' && (
                        <button title="Следующая стадия" onClick={() => move(d, 1)} style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, padding: '1px 7px' }}>→</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CrmDealsView
