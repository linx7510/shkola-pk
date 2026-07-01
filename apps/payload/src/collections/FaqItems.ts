import type { CollectionConfig } from 'payload'
import { richTextEditor } from '../lexicalFeatures'

export const FaqItems: CollectionConfig = {
  slug: 'faq-items',
  labels: { singular: 'Вопрос-ответ', plural: 'FAQ' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order'],
    group: 'Контент',
  },
  access: { read: () => true },
  fields: [
    { name: 'question', type: 'text', required: true, label: 'Вопрос' },
    { name: 'answer', type: 'richText', required: true, label: 'Ответ', editor: richTextEditor },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Категория', filterOptions: { type: { equals: 'faq' } } },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}

