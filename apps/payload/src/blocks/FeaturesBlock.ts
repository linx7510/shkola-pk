import type { Block } from 'payload'
export const FeaturesBlock: Block = {
  slug: 'features',
  labels: { singular: 'Блок преимуществ', plural: 'Блоки преимуществ' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    {
      name: 'items',
      type: 'array',
      label: 'Элементы',
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'description', type: 'textarea', label: 'Описание' },
      ],
    },
  ],
}

