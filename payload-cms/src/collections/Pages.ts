import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublished', 'updatedAt'],
    group: 'Контент',
    listSearchableFields: ['title', 'slug'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг', admin: { position: 'sidebar' } },
    { name: 'content', type: 'richText', label: 'Содержание' },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликована', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
