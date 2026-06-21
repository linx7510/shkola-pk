import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  labels: { singular: 'Запись на курс', plural: 'Записи на курсы' },
  admin: { useAsTitle: 'id', defaultColumns: ['user', 'course', 'progress', 'createdAt'], group: 'Обучение' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { user: { equals: req.user.id } }
    },
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, label: 'Пользователь' },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, label: 'Курс' },
    { name: 'progress', type: 'number', defaultValue: 0, min: 0, max: 100, label: 'Прогресс (%)' },
  ],
  timestamps: true,
}
