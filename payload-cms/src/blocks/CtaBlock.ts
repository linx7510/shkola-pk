import type { Block } from 'payload'
export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'CTA-блок', plural: 'CTA-блоки' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'buttonText', type: 'text', label: 'Текст кнопки' },
    { name: 'buttonLink', type: 'text', label: 'Ссылка кнопки' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Фоновое изображение' },
  ],
}

