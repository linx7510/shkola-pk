import type { Block } from 'payload'
export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Герой-блок', plural: 'Герой-блоки' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'subtitle', type: 'textarea', label: 'Подзаголовок' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Фоновое изображение' },
    { name: 'ctaText', type: 'text', label: 'Текст основной кнопки CTA' },
    { name: 'ctaLink', type: 'text', label: 'Ссылка основной кнопки CTA' },
    { name: 'ctaText2', type: 'text', label: 'Текст второй кнопки CTA' },
    { name: 'ctaLink2', type: 'text', label: 'Ссылка второй кнопки CTA' },
  ],
}
