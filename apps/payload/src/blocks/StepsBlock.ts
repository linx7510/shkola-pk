import type { Block } from 'payload'

export const StepsBlock: Block = {
  slug: 'steps',
  labels: { singular: 'Шаги', plural: 'Шаги' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    {
      name: 'steps',
      type: 'array',
      label: 'Шаги',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Название шага' },
        { name: 'description', type: 'textarea', required: true, label: 'Описание' },
        { name: 'videoUrl', type: 'text', label: 'Ссылка на видео (VK, YouTube, Rutube)' },
      ],
    },
  ],
}