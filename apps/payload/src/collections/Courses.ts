import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Курс', plural: 'Курсы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublished', 'price', 'order'],
    group: 'Обучение',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'editor') return true
      return { isPublished: { equals: true } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название курса' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг', admin: { position: 'sidebar' } },
    { name: 'description', type: 'textarea', required: true, label: 'Описание' },
    { name: 'shortDesc', type: 'textarea', maxLength: 200, label: 'Краткое описание' },
    { name: 'icon', type: 'text', label: 'Иконка (emoji или CSS класс)' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Обложка' },
    { name: 'price', type: 'number', label: 'Цена (руб)', min: 0 },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок сортировки', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликован', admin: { position: 'sidebar' } },
  ],
    hooks: createAuditHooks('course'),
  timestamps: true,
}

