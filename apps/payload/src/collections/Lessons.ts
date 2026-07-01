import type { CollectionConfig } from 'payload'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  labels: { singular: 'Урок', plural: 'Уроки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'order', 'isFree'],
    group: 'Обучение',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название урока' },
    { name: 'content', type: 'richText', label: 'Содержание' },
    { name: 'videoUrl', type: 'text', label: 'URL видео' },
    { name: 'duration', type: 'number', defaultValue: 0, label: 'Длительность (мин)' },
    { name: 'module', type: 'relationship', relationTo: 'modules', required: true, label: 'Модуль' },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок' },
    { name: 'isFree', type: 'checkbox', defaultValue: false, label: 'Бесплатный', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}

