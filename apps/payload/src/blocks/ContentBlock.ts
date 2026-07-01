import type { Block } from 'payload'
import { richTextEditor } from '../lexicalFeatures'
export const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: 'Контент-блок', plural: 'Контент-блоки' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    { name: 'body', type: 'richText', required: true, label: 'Содержание', editor: richTextEditor },
  ],
}

