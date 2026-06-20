import type { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Текст', plural: 'Текст' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    { name: 'body', type: 'richText', label: 'Текст', required: true },
    { name: 'backgroundColor', type: 'select', label: 'Фон', options: [
      { label: 'Тёмный', value: 'dark' },
      { label: 'Светлый акцент', value: 'accent' },
      { label: 'Прозрачный', value: 'transparent' },
    ], defaultValue: 'transparent' },
  ],
}
