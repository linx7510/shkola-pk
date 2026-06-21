import type { Block } from 'payload'

export const DividerBlock: Block = {
  slug: 'divider',
  labels: { singular: 'Разделитель', plural: 'Разделители' },
  fields: [
    { name: 'style', type: 'select', label: 'Стиль', options: [
      { label: 'Линия', value: 'line' },
      { label: 'Точки', value: 'dots' },
      { label: 'Пустое пространство', value: 'space' },
    ], defaultValue: 'line' },
  ],
}
