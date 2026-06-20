import type { Block } from 'payload'
export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Галерея', plural: 'Галереи' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    {
      name: 'images',
      type: 'array',
      label: 'Изображения',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
        { name: 'caption', type: 'text', label: 'Подпись' },
      ],
    },
  ],
}

