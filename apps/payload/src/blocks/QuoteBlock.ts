import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Цитата', plural: 'Цитаты' },
  fields: [
    { name: 'text', type: 'textarea', required: true, label: 'Текст цитаты' },
    { name: 'author', type: 'text', label: 'Автор' },
  ],
}
