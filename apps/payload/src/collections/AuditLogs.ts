import type { CollectionConfig } from 'payload'

/**
 * AuditLogs — журнал действий пользователей в админке.
 * 
 * Заполняется автоматически через хуки createAuditHooks() в lib/audit.ts.
 * Read-only: пользователи не могут создавать/редактировать/удалять записи через админку.
 * 
 * Таблица: audit.audit_logs (schema "audit" в БД shkola_pk_payload)
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { 
    singular: 'Запись журнала', 
    plural: 'Журнал действий' 
  },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['createdAt', 'user', 'action', 'entity', 'entityId', 'ip'],
    group: 'Система',
    listSearchableFields: ['action', 'entity', 'entityId'],
    description: 'Журнал всех действий пользователей (создание, редактирование, удаление, вход). Заполняется автоматически. Read-only.',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false,  // Read-only
    update: () => false,  // Read-only
    delete: ({ req }) => req.user?.role === 'admin',  // Allow admin to purge old logs
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Пользователь',
      admin: { position: 'sidebar' },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      label: 'Действие',
      options: [
        { label: 'Создание', value: 'create' },
        { label: 'Обновление', value: 'update' },
        { label: 'Удаление', value: 'delete' },
        { label: 'Вход (успех)', value: 'login_success' },
        { label: 'Вход (провал)', value: 'login_failed' },
        { label: 'Выход', value: 'logout' },
      ],
    },
    {
      name: 'entity',
      type: 'select',
      required: true,
      label: 'Сущность',
      options: [
        { label: 'Страница', value: 'page' },
        { label: 'Статья блога', value: 'blog-post' },
        { label: 'Пользователь', value: 'user' },
        { label: 'Курс', value: 'course' },
        { label: 'Лид (заявка)', value: 'lead' },
        { label: 'Услуга', value: 'service' },
        { label: 'Глоссарий', value: 'glossary-term' },
        { label: 'FAQ', value: 'faq-item' },
        { label: 'Категория', value: 'category' },
        { label: 'Медиафайл', value: 'media' },
      ],
    },
    {
      name: 'entityId',
      type: 'text',
      label: 'ID сущности',
      admin: { position: 'sidebar' },
    },
    {
      name: 'details',
      type: 'textarea',
      label: 'Детали (JSON)',
    },
    {
      name: 'ip',
      type: 'text',
      label: 'IP (анонимизированный)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'userAgent',
      type: 'textarea',
      label: 'User-Agent',
      admin: { position: 'sidebar' },
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Время действия',
      admin: { 
        position: 'sidebar',
        date: { displayFormat: 'dd.MM.yyyy HH:mm:ss' },
      },
    },
  ],
  timestamps: false,  // Используем только createdAt, без updatedAt
}
