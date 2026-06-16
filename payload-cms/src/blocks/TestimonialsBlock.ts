import type { Block } from 'payload'
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Отзывы', plural: 'Блоки отзывов' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    {
      name: 'items',
      type: 'array',
      label: 'Отзывы',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Имя' },
        { name: 'role', type: 'text', label: 'Должность' },
        { name: 'text', type: 'textarea', required: true, label: 'Текст отзыва' },
        { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Аватар' },
      ],
    },
  ],
}

