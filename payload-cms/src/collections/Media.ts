import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медиафайл', plural: 'Медиафайлы' },
  upload: {
    mimeTypes: ['image/*'],
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'createdAt'],
    group: 'Контент',
  },
  access: { read: () => true },
  fields: [
    { name: 'alt', type: 'text', label: 'Альтернативный текст' },
  ],
  timestamps: true,
}
