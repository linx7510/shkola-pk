import type { CollectionConfig } from 'payload'
import { richTextEditor } from '../lexicalFeatures'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Услуга', plural: 'Услуги' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'price', 'isPublished', 'order'],
    group: 'Контент',
    listSearchableFields: ['title', 'slug'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название услуги' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг' },
    { name: 'shortDesc', type: 'textarea', maxLength: 200, label: 'Краткое описание' },
    { name: 'content', type: 'richText', required: true, label: 'Подробное описание', editor: richTextEditor },
    { name: 'icon', type: 'text', label: 'Иконка' },
    { name: 'price', type: 'number', label: 'Цена (руб)', min: 0 },
    { name: 'priceNote', type: 'text', label: 'Примечание к цене' },
    { name: 'isPublished', type: 'checkbox', defaultValue: true, label: 'Опубликована', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Порядок', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}

