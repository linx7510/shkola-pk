import type { CollectionConfig } from 'payload'

export const Modules: CollectionConfig = {
  slug: 'modules',
  labels: { singular: 'Модуль', plural: 'Модули' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'order'],
    group: 'Обучение',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название модуля' },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, label: 'Курс' },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок' },
  ],
  timestamps: true,
}

