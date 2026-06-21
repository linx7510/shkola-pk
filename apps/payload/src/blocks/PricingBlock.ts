import type { Block } from 'payload'
export const PricingBlock: Block = {
  slug: 'pricing',
  labels: { singular: 'Цены', plural: 'Блоки цен' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    {
      name: 'plans',
      type: 'array',
      label: 'Тарифы',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Название' },
        { name: 'price', type: 'number', required: true, label: 'Цена' },
        { name: 'priceNote', type: 'text', label: 'Примечание к цене' },
        { name: 'features', type: 'text', label: 'Возможности (по строкам)' },
        { name: 'isFeatured', type: 'checkbox', defaultValue: false, label: 'Выделенный' },
        { name: 'ctaText', type: 'text', label: 'Текст кнопки' },
        { name: 'ctaLink', type: 'text', label: 'Ссылка кнопки' },
      ],
    },
  ],
}

