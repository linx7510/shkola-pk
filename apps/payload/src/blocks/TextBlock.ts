import type { Block } from 'payload'
import { richTextEditor } from '../lexicalFeatures'

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Текст', plural: 'Текст' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    { name: 'body', type: 'richText', label: 'Текст', required: true, editor: richTextEditor },
    { name: 'backgroundColor', type: 'select', label: 'Фон', options: [
      { label: 'Тёмный', value: 'dark' },
      { label: 'Светлый акцент', value: 'accent' },
      { label: 'Прозрачный', value: 'transparent' },
    ], defaultValue: 'transparent' },
    { name: 'imageUrl', type: 'text', label: 'URL изображения (рядом с текстом)', admin: { description: 'Например: /images/hero-logo.webp' } },
    { name: 'imagePosition', type: 'select', label: 'Позиция изображения', options: [
      { label: 'Справа', value: 'right' },
      { label: 'Слева', value: 'left' },
    ], defaultValue: 'right' },
    { name: 'imageWidth', type: 'number', label: 'Ширина изображения (px)', defaultValue: 400 },
  ],
}
