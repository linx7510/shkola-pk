import type { Block } from 'payload'

export const CardsBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Карточки', plural: 'Карточки' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    {
      name: 'cards',
      type: 'array',
      label: 'Карточки',
      required: true,
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'description', type: 'textarea', required: true, label: 'Описание' },
        { name: 'link', type: 'text', label: 'Ссылка' },
      ],
    },
  ],
}
