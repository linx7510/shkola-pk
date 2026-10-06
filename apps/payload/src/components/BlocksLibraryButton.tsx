'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAllFormFields, useDocumentInfo, useServerFunctions, toast } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'

type Template = {
  id: number | string
  name?: string
  blockType?: string
  description?: string
  data?: Record<string, unknown> | null
}

const BLOCK_RU: Record<string, string> = {
  hero: 'Герой', features: 'Преимущества', cta: 'Призыв к действию', content: 'Контент',
  faq: 'FAQ', gallery: 'Галерея', pricing: 'Тарифы', testimonials: 'Отзывы', stats: 'Показатели',
  text: 'Текст', image: 'Изображение', video: 'Видео', steps: 'Шаги', cards: 'Карточки',
  contact: 'Контакты', divider: 'Разделитель', quote: 'Цитата', table: 'Таблица',
  instructor: 'Преподаватель', 'snake-animation': 'Анимация «Змейка»', 'pacman-animation': 'Анимация «Пакман»',
}

const randomId = (): string => {
  const hex = '0123456789abcdef'
  let out = ''
  for (let i = 0; i < 24; i += 1) out += hex[Math.floor(Math.random() * 16)]
  return out
}

type BuiltState = Record<string, { initialValue?: unknown; value?: unknown; valid: boolean; rows?: unknown[] }>

// Рекурсивно превращает данные блока в FormState-фрагмент строки (пути БЕЗ префикса blocks.N)
const buildSubState = (data: Record<string, unknown>, prefix: string): BuiltState => {
  const state: BuiltState = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    const path = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(value)) {
      state[path] = { rows: value.map(() => ({ id: randomId() })), initialValue: value, valid: true }
      value.forEach((item, i) => {
        if (item && typeof item === 'object') {
          const nested = buildSubState(item as Record<string, unknown>, `${path}.${i}`)
          Object.assign(state, nested)
        } else {
          state[`${path}.${i}`] = { initialValue: item, value: item, valid: true }
        }
      })
    } else if (value && typeof value === 'object') {
      state[path] = { initialValue: value, value, valid: true }
    } else {
      state[path] = { initialValue: value, value, valid: true }
    }
  }
  return state
}

// Обратная операция: из состояния формы собирает данные блока N (для сохранения в библиотеку)
const buildDataFromState = (fields: Record<string, any>, basePath: string): Record<string, unknown> => {
  const data: Record<string, unknown> = {}
  const prefix = `${basePath}.`
  for (const [path, field] of Object.entries(fields)) {
    if (!path.startsWith(prefix)) continue
    const rel = path.slice(prefix.length)
    if (rel.endsWith('.id') || rel === 'blockType') continue
    if (field && Array.isArray(field.rows)) continue
    const parts = rel.split('.')
    let node: any = data
    for (let i = 0; i < parts.length - 1; i += 1) {
      const seg = parts[i]
      const nextIsIndex = /^\d+$/.test(parts[i + 1])
      if (node[seg] === undefined) node[seg] = nextIsIndex ? [] : {}
      node = node[seg]
    }
    const last = parts[parts.length - 1]
    node[last] = field.value
  }
  // массивы: rows-записи дают количество строк
  for (const [path, field] of Object.entries(fields)) {
    if (!path.startsWith(prefix) || !field || !Array.isArray(field.rows)) continue
    const rel = path.slice(prefix.length)
    const parts = rel.split('.')
    let node: any = data
    for (let i = 0; i < parts.length - 1; i += 1) {
      const seg = parts[i]
      const nextIsIndex = /^\d+$/.test(parts[i + 1])
      if (node[seg] === undefined) node[seg] = nextIsIndex ? [] : {}
      node = node[seg]
    }
    const last = parts[parts.length - 1]
    const count = field.rows.length
    if (!node[last]) node[last] = []
    while (node[last].length < count) node[last].push({})
  }
  return data
}

export const BlocksLibraryButton: React.FC = () => {
  const pathname = usePathname()
  const [fields, dispatchFields] = useAllFormFields()
  const { id, docPermissions, docPreferences } = useDocumentInfo() as any
  const { getFormState } = useServerFunctions() as any

  const [panel, setPanel] = useState<'none' | 'insert' | 'save'>('none')
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [busy, setBusy] = useState(false)

  const isPages = !!pathname && /^\/admin\/collections\/pages(\/|$)/.test(pathname)
  const currentData = React.useMemo(() => {
    try {
      return reduceFieldsToValues(fields as any, true) as Record<string, unknown>
    } catch {
      return {}
    }
  }, [fields])

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/block-templates?limit=100&sort=name&depth=0', { credentials: 'same-origin' })
      if (!res.ok) { setTemplates([]); return }
      const json = await res.json()
      setTemplates(Array.isArray(json?.docs) ? json.docs : [])
    } catch {
      setTemplates([])
    }
  }, [])

  useEffect(() => {
    if (panel === 'insert' && templates === null) void loadTemplates()
  }, [panel, templates, loadTemplates])

  if (!isPages) return null

  const insertTemplate = async (tpl: Template) => {
    if (!tpl.blockType) return
    setBusy(true)
    try {
      const blocks = Array.isArray(currentData.blocks) ? currentData.blocks : []
      const newData: Record<string, unknown> = {
        ...currentData,
        blocks: [...blocks, { blockType: tpl.blockType, ...(tpl.data || {}) }],
      }
      const result = await getFormState({
        collectionSlug: 'pages',
        id: id ?? undefined,
        data: newData,
        docPermissions,
        docPreferences,
        operation: id ? 'update' : 'create',
      })
      if (result?.state) {
        dispatchFields({ type: 'REPLACE_STATE', state: result.state, optimize: true })
        toast.success(`Блок «${tpl.name || BLOCK_RU[tpl.blockType] || tpl.blockType}» добавлен в конец страницы. Проверьте и сохраните страницу.`)
      } else {
        toast.error('Не удалось построить состояние формы для вставки.')
      }
    } catch (e: any) {
      toast.error('Ошибка вставки блока: ' + (e?.message || 'неизвестная'))
    } finally {
      setBusy(false)
      setPanel('none')
    }
  }

  const saveBlock = async (index: number) => {
    const blocks = Array.isArray(currentData.blocks) ? currentData.blocks : []
    const block = blocks[index] as Record<string, unknown> | undefined
    if (!block || !block.blockType) { toast.error('Не удалось прочитать данные блока'); return }
    const name = window.prompt('Название шаблона в библиотеке:', `${BLOCK_RU[String(block.blockType)] || block.blockType}`)
    if (!name) return
    const { blockType, ...data } = block
    setBusy(true)
    try {
      const res = await fetch('/api/block-templates', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, blockType, data }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error('Не удалось сохранить: ' + (err?.message || res.status))
        return
      }
      toast.success(`Шаблон «${name}» сохранён в библиотеке`)
      setTemplates(null)
    } finally {
      setBusy(false)
      setPanel('none')
    }
  }

  const blocksNow = Array.isArray(currentData.blocks) ? currentData.blocks : []

  return (
    <div className="skpk-lib">
      <style>{`
        .skpk-lib { position: relative; display: inline-block; margin-left: 8px; }
        .skpk-lib__btn { padding: 4px 10px; border: 1px solid var(--theme-elevation-200); border-radius: var(--style-radius-m); background: var(--theme-elevation-0); color: var(--theme-elevation-800); cursor: pointer; font-size: 12px; margin-right: 6px; }
        .skpk-lib__btn:hover { border-color: var(--theme-elevation-500); }
        .skpk-lib__panel { position: absolute; top: calc(100% + 6px); left: 8px; z-index: 60; width: 340px; max-height: 380px; overflow: auto; background: var(--theme-elevation-0); border: 1px solid var(--theme-elevation-200); border-radius: var(--style-radius-m); box-shadow: 0 8px 24px rgba(0,0,0,.18); padding: 8px; }
        .skpk-lib__item { display: block; width: 100%; text-align: left; padding: 8px 10px; border: none; background: transparent; color: var(--theme-text); cursor: pointer; border-radius: var(--style-radius-s); font-size: 13px; }
        .skpk-lib__item:hover { background: var(--theme-elevation-100); }
        .skpk-lib__item small { display: block; color: var(--theme-elevation-500); font-size: 11px; margin-top: 2px; }
        .skpk-lib__empty { padding: 10px; color: var(--theme-elevation-500); font-size: 13px; }
        .skpk-lib__title { padding: 6px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--theme-elevation-500); }
      `}</style>

      <button type="button" className="skpk-lib__btn" onClick={() => setPanel(panel === 'insert' ? 'none' : 'insert')} disabled={busy}>
        📚 Из библиотеки
      </button>
      <button type="button" className="skpk-lib__btn" onClick={() => setPanel(panel === 'save' ? 'none' : 'save')} disabled={busy}>
        💾 Блок в библиотеку
      </button>

      {panel === 'insert' && (
        <div className="skpk-lib__panel">
          <div className="skpk-lib__title">Вставить блок в конец страницы</div>
          {!templates ? (
            <div className="skpk-lib__empty">Загрузка…</div>
          ) : templates.length === 0 ? (
            <div className="skpk-lib__empty">
              Библиотека пуста. Заполните блок на этой странице, нажмите «💾 Блок в библиотеку» — и он появится здесь.
            </div>
          ) : (
            templates.map((t) => (
              <button key={String(t.id)} type="button" className="skpk-lib__item" onClick={() => insertTemplate(t)} disabled={busy}>
                {t.name || 'Без названия'}
                <small>{BLOCK_RU[String(t.blockType)] || t.blockType}{t.description ? ' · ' + t.description : ''}</small>
              </button>
            ))
          )}
        </div>
      )}

      {panel === 'save' && (
        <div className="skpk-lib__panel">
          <div className="skpk-lib__title">Сохранить блок этой страницы в библиотеку</div>
          {blocksNow.length === 0 ? (
            <div className="skpk-lib__empty">На странице пока нет блоков.</div>
          ) : (
            blocksNow.map((b: any, i: number) => (
              <button key={i} type="button" className="skpk-lib__item" onClick={() => saveBlock(i)} disabled={busy}>
                {i + 1}. {BLOCK_RU[String(b?.blockType)] || b?.blockType || '—'}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default BlocksLibraryButton
