import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: { singular: 'Сделка', plural: 'Сделки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'stage', 'amount', 'clientName', 'source', 'updatedAt'],
    group: 'CRM',
    listSearchableFields: ['title', 'clientName', 'clientContact'],
    components: {
      views: {
        kanban: {
          path: '/kanban',
          exact: true,
          Component: '/src/components/CrmDealsView#CrmDealsView',
          meta: { title: 'Воронка сделок' },
        },
      },
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'manager') return true
      return false
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    ...createAuditHooks('deal'),
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Сделка' },
    {
      name: 'service',
      type: 'select',
      label: 'Услуга',
      options: [
        { label: 'Аудит устава', value: 'audit' },
        { label: 'ЦПП (разработка)', value: 'cpp' },
        { label: 'Бухобслуживание — Старт', value: 'buh_start' },
        { label: 'Бухобслуживание — Базовый', value: 'buh_base' },
        { label: 'Бухобслуживание — Стандартный', value: 'buh_std' },
        { label: 'Бухобслуживание — Вертикаль', value: 'buh_vert' },
        { label: 'Сайт', value: 'site' },
        { label: 'Воронка Битрикс24', value: 'funnel' },
        { label: 'Консультация', value: 'consult' },
        { label: 'Обучение (курс)', value: 'course' },
        { label: 'Другое', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'stage',
      type: 'select',
      defaultValue: 'new',
      label: 'Стадия',
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'Квалифицирована', value: 'qualified' },
        { label: 'КП отправлено', value: 'proposal' },
        { label: 'Согласование', value: 'negotiation' },
        { label: 'Договор и оплата', value: 'contract' },
        { label: 'В работе', value: 'work' },
        { label: 'Закрыта — успех', value: 'won' },
        { label: 'Закрыта — отказ', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'amount', type: 'number', label: 'Сумма, ₽' },
    {
      name: 'source',
      type: 'select',
      label: 'Источник',
      options: [
        { label: 'Сайт (форма)', value: 'site' },
        { label: 'Welcome-воронка', value: 'welcome' },
        { label: 'Воронка аудита', value: 'audit_funnel' },
        { label: 'Сарафан', value: 'referral' },
        { label: 'Соцсети', value: 'social' },
        { label: 'Прямое обращение', value: 'direct' },
        { label: 'Повторный клиент', value: 'repeat' },
        { label: 'Другое', value: 'other' },
      ],
    },
    { name: 'clientName', type: 'text', label: 'Клиент' },
    { name: 'clientContact', type: 'text', label: 'Контакт (тел./email)' },
    { name: 'leadId', type: 'number', label: '№ лида', admin: { position: 'sidebar', description: 'Из какой заявки выросла сделка' } },
    { name: 'responsible', type: 'text', label: 'Ответственный', admin: { position: 'sidebar' } },
    { name: 'notes', type: 'textarea', label: 'Комментарий' },
    {
      name: 'closeReason',
      type: 'select',
      label: 'Причина отказа',
      options: [
        { label: 'Дорого', value: 'price' },
        { label: 'Не целевой', value: 'not_target' },
        { label: 'Сделает сам', value: 'diy' },
        { label: 'Замолчал', value: 'silent' },
        { label: 'Выбрал другого', value: 'competitor' },
        { label: 'Другое', value: 'other' },
      ],
      admin: { position: 'sidebar', condition: (_, sibling) => sibling?.stage === 'lost' },
    },
    { name: 'closedAt', type: 'date', label: 'Дата закрытия', admin: { position: 'sidebar', condition: (_, sibling) => sibling?.stage === 'won' || sibling?.stage === 'lost' } },
  ],
}
