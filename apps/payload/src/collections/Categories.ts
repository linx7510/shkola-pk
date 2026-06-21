import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Категория', plural: 'Категории' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'type', 'order'],
    group: 'Контент',
    listSearchableFields: ['title', 'slug'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг' },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'blog',
      label: 'Тип категории',
      options: [
        { label: 'Блог', value: 'blog' },
        { label: 'Услуги', value: 'services' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Глоссарий', value: 'glossary' },
        { label: 'Курсы', value: 'courses' },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'parent', type: 'relationship', relationTo: 'categories', label: 'Родительская категория', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}

