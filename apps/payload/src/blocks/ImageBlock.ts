import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Изображение', plural: 'Изображения' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Изображение', required: true },
    { name: 'caption', type: 'text', label: 'Подпись' },
    { name: 'alignment', type: 'select', label: 'Выравнивание', options: [
      { label: 'По центру', value: 'center' },
      { label: 'Слева', value: 'left' },
      { label: 'Справа', value: 'right' },
    ], defaultValue: 'center' },
    { name: 'width', type: 'select', label: 'Ширина', options: [
      { label: 'Полная', value: 'full' },
      { label: 'Ограниченная (800px)', value: 'limited' },
      { label: 'Малая (400px)', value: 'small' },
    ], defaultValue: 'full' },
  ],
}
