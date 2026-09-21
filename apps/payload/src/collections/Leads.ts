import type { CollectionConfig } from 'payload'
import { createAuditHooks, logAudit } from '../lib/audit'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'source', 'status', 'createdAt'],
    group: 'Продажи',
    listSearchableFields: ['name', 'email', 'phone'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'manager') return true
      return false
    },
    create: () => true,
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Имя' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'message', type: 'textarea', label: 'Сообщение' },
    {
      name: 'source',
      type: 'select',
      label: 'Источник',
      options: [
        { label: 'Главная форма', value: 'homepage' },
        { label: 'Главная CTA', value: 'home_cta' },
        { label: 'Консультация', value: 'consultation' },
        { label: 'Бесплатный урок', value: 'free-lesson' },
        { label: 'Контактная форма', value: 'contact' },
        { label: 'Регистрация ПК', value: 'registration' },
        { label: 'ИИ-аудит устава', value: 'ai-audit' },
      ],
    },
    { name: 'courseSlug', type: 'text', label: 'Слаг курса', admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      label: 'Статус',
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'В обработке', value: 'processing' },
        { label: 'Связались', value: 'contacted' },
        { label: 'Квалифицирована', value: 'qualified' },
        { label: 'Консультация', value: 'consultation' },
        { label: 'КП отправлено', value: 'proposal' },
        { label: 'Думает', value: 'thinking' },
        { label: 'Спящий', value: 'sleeping' },
        { label: 'Конвертирована', value: 'converted' },
        { label: 'Закрыта', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    // CRM v4.2 — скоринг и воронка (Этап A)
    { name: 'leadScore', type: 'number', label: 'Lead Score (0–100)', admin: { position: 'sidebar', readOnly: true, description: 'Рассчитывается автоматически при создании' } },
    { name: 'riskScore', type: 'number', label: 'Risk Score (0–100)', admin: { position: 'sidebar', readOnly: true, description: 'Критичность ситуации пайщика' } },
    {
      name: 'segment',
      type: 'select',
      label: 'Сегмент',
      options: [
        { label: 'Изучает тему', value: 'researcher' },
        { label: 'Хочет создать ПК', value: 'create_pc' },
        { label: 'Снизить налоги', value: 'tax_save' },
        { label: 'Обучение', value: 'education' },
        { label: 'Председатель ПК с проблемой', value: 'chairman_problem' },
        { label: 'Другое', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'objection',
      type: 'select',
      label: 'Возражение',
      options: [
        { label: 'Нет бюджета', value: 'no_budget' },
        { label: 'Нет времени', value: 'no_time' },
        { label: 'Не доверяет', value: 'no_trust' },
        { label: 'Подумает', value: 'thinking' },
        { label: 'Изучает', value: 'studying' },
        { label: 'Другое', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'objectionNotes', type: 'textarea', label: 'Детали возражения', admin: { position: 'sidebar' } },
    { name: 'nextAction', type: 'text', label: 'Следующее действие', admin: { position: 'sidebar' } },
    { name: 'sleepUntil', type: 'date', label: 'Спящий до', admin: { position: 'sidebar' } },
    { name: 'notes', type: 'textarea', label: 'Заметки', admin: { position: 'sidebar' } },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', label: 'Ответственный', admin: { position: 'sidebar' } },
    // 152-ФЗ: согласие на обработку персональных данных
    {
      name: 'consentAccepted',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      label: 'Согласие на обработку ПДн (152-ФЗ)',
      admin: {
        description: 'Отметьте, если пользователь дал согласие',
        position: 'sidebar',
      },
    },
    {
      name: 'consentAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      label: 'Время согласия',
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
      label: 'IP адрес (псевдонимизированный)',
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'SHA-256 хеш IP (152-ФЗ, для анонимной аналитики)' },
      label: 'IP хеш (SHA-256)',
    },
    {
      name: 'userAgent',
      type: 'textarea',
      admin: { position: 'sidebar', readOnly: true },
      label: 'User-Agent',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }: any) => {
        // CRM v4.2 (Этап A): Rule-based Lead Score + Risk Score + авто-сегмент
        if (operation === 'create') {
          const text = `${data.message || ''}`
          // — Lead Score 0–100: заполненность (0-20) + источник (0-25) + интент (0-20) + срочность (0-20) + бонус за контакт (0-15)
          let lead = 0
          lead += [data.name, data.phone, data.email, data.message].filter(Boolean).length * 5
          const srcW: Record<string, number> = { consultation: 25, 'free-lesson': 20, registration: 15, 'ai-audit': 18, contact: 12, home_cta: 12, homepage: 10 }
          lead += srcW[data.source] ?? 10
          const intents: [RegExp, number][] = [
            [/блокиров|фнс|проверк|штраф|доначисл/i, 20],
            [/создат|открыт|зарегистрир/i, 18],
            [/налог|ндс|снизит|экономи/i, 16],
            [/курс|обучен|урок/i, 12],
          ]
          lead += intents.find(([re]) => re.test(text))?.[1] ?? 8
          lead += /срочн|сегодня|как можно|немедленн/i.test(text) ? 20 : 10
          data.leadScore = Math.min(100, lead)
          // — Risk Score 0–100: критические ситуации пайщика
          let risk = 0
          const riskRules: [RegExp, number][] = [
            [/блокиров|115[- ]?фз|арест|счёт|счет.{0,15}(закр|блок)/i, 35],
            [/фнс|проверк|доначисл|требован|выездн/i, 30],
            [/устав.{0,25}(стар|не соответ)|редакц.{0,12}201[0-9]/i, 25],
            [/конфликт|пайщик.{0,20}(выход|конфликт|ссор)|исключ/i, 20],
            [/долг|пени|недоимк|доначисл/i, 15],
          ]
          riskRules.forEach(([re, w]) => { if (re.test(text)) risk += w })
          data.riskScore = Math.min(100, risk)
          // — Авто-сегмент
          if (!data.segment) {
            if (/создат|открыт|зарегистрир/i.test(text)) data.segment = 'create_pc'
            else if (/налог|ндс|снизит|экономи/i.test(text)) data.segment = 'tax_save'
            else if (/курс|обучен|урок/i.test(text)) data.segment = 'education'
            else if (/блокиров|фнс|проверк|конфликт|устав|пайщик/i.test(text)) data.segment = 'chairman_problem'
            else data.segment = 'researcher'
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }: any) => {
        if (operation === 'create') {
          console.log(`[Lead] New lead: ${doc.name} <${doc.email}> from ${doc.source || 'website'}`)
          // Audit log
          await logAudit({
            userId: req?.user?.id,
            action: 'create',
            entity: 'lead',
            entityId: doc?.id,
            details: { name: doc.name, source: doc.source, phone: doc.phone ? '***' : null },
            ip: req?.headers?.['x-forwarded-for'] || req?.ip,
            userAgent: req?.headers?.['user-agent'] ? req.headers['user-agent'].slice(0, 500) : undefined,
          })
        } else if (operation === 'update') {
          await logAudit({
            userId: req?.user?.id,
            action: 'update',
            entity: 'lead',
            entityId: doc?.id,
            details: { name: doc.name, status: doc.status },
            ip: req?.headers?.['x-forwarded-for'] || req?.ip,
            userAgent: req?.headers?.['user-agent'] ? req.headers['user-agent'].slice(0, 500) : undefined,
          })
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }: any) => {
        await logAudit({
          userId: req?.user?.id,
          action: 'delete',
          entity: 'lead',
          entityId: doc?.id,
          details: { name: doc.name },
          ip: req?.headers?.['x-forwarded-for'] || req?.ip,
          userAgent: req?.headers?.['user-agent'] ? req.headers['user-agent'].slice(0, 500) : undefined,
        })
      },
    ],
  },
}
