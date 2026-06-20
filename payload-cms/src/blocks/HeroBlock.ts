import type { Block } from 'payload'
export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Герой-блок', plural: 'Герой-блоки' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'subtitle', type: 'textarea', label: 'Подзаголовок' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Фоновое изображение' },
    { name: 'ctaText', type: 'text', label: 'Текст кнопки CTA' },
    { name: 'ctaLink', type: 'text', label: 'Ссылка кнопки CTA' },
  ],
}

