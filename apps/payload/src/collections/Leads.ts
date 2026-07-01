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
        { label: 'Консультация', value: 'consultation' },
        { label: 'Бесплатный урок', value: 'free-lesson' },
        { label: 'Контактная форма', value: 'contact' },
        { label: 'Регистрация ПК', value: 'registration' },
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
        { label: 'Конвертирована', value: 'converted' },
        { label: 'Закрыта', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
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
