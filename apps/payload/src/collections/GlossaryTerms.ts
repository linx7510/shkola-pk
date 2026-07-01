import type { CollectionConfig } from 'payload'

export const GlossaryTerms: CollectionConfig = {
  slug: 'glossary-terms',
  labels: { singular: 'Термин глоссария', plural: 'Глоссарий' },
  admin: {
    useAsTitle: 'term',
    defaultColumns: ['term', 'slug', 'category', 'order'],
    group: 'Контент',
    listSearchableFields: ['term', 'slug'],
  },
  access: { read: () => true },
  fields: [
    { name: 'term', type: 'text', required: true, unique: true, label: 'Термин' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг' },
    { name: 'definition', type: 'textarea', required: true, label: 'Определение' },
    { name: 'extendedContent', type: 'richText', label: 'Расширенное описание' },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Категория', filterOptions: { type: { equals: 'glossary' } } },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: true, label: 'Опубликован', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}

