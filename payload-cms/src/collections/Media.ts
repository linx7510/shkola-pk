import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медиафайл', plural: 'Медиафайлы' },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300 },
      { name: 'small', width: 600, height: 400 },
      { name: 'medium', width: 900, height: 600 },
      { name: 'large', width: 1200, height: 800 },
      { name: 'hero', width: 1920, height: 1080 },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'createdAt'],
    group: 'Контент',
  },
  access: { read: () => true },
  fields: [
    { name: 'alt', type: 'text', label: 'Альтернативный текст', required: true },
    { name: 'caption', type: 'text', label: 'Подпись' },
  ],
  timestamps: true,
}

