import type { CollectionConfig } from 'payload'

export const LessonProgress: CollectionConfig = {
  slug: 'lesson-progress',
  labels: { singular: 'Прогресс урока', plural: 'Прогресс уроков' },
  admin: { useAsTitle: 'id', defaultColumns: ['user', 'lesson', 'completed', 'completedAt'], group: 'Обучение' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { user: { equals: req.user.id } }
    },
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, label: 'Пользователь' },
    { name: 'lesson', type: 'relationship', relationTo: 'lessons', required: true, label: 'Урок' },
    { name: 'completed', type: 'checkbox', defaultValue: false, label: 'Пройден' },
    { name: 'completedAt', type: 'date', label: 'Дата завершения' },
  ],
  timestamps: true,
}
