import type { CollectionConfig } from 'payload'

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
  ],
  timestamps: true,
}

