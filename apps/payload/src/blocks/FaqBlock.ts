import type { Block } from 'payload'
import { richTextEditor } from '../lexicalFeatures'
export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ-блок', plural: 'FAQ-блоки' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    {
      name: 'items',
      type: 'array',
      label: 'Вопросы и ответы',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Вопрос' },
        { name: 'answer', type: 'richText', required: true, label: 'Ответ', editor: richTextEditor },
      ],
    },
  ],
}

