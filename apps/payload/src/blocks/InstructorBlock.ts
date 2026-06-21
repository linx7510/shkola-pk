import type { Block } from 'payload'
export const InstructorBlock: Block = {
  slug: 'instructor',
  labels: { singular: 'Инструктор', plural: 'Инструкторы' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок секции', defaultValue: 'Кто будет вас обучать?' },
    { name: 'name', type: 'text', required: true, label: 'Имя инструктора' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Фото' },
    { name: 'photoAlt', type: 'text', label: 'Alt-текст для фото' },
    {
      name: 'facts',
      type: 'array',
      label: 'Факты об инструкторе',
      fields: [
        { name: 'text', type: 'text', required: true, label: 'Текст факта' },
      ],
    },
  ],
}
