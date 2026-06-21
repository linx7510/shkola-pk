import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  auth: { verify: false },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'isActive', 'createdAt'],
    group: 'Управление',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    create: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Имя' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      label: 'Роль',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
        { label: 'Менеджер', value: 'manager' },
        { label: 'Преподаватель', value: 'teacher' },
        { label: 'Студент', value: 'student' },
        { label: 'Наблюдатель', value: 'viewer' },
      ],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Аватар' },
    { name: 'bio', type: 'textarea', label: 'О себе' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Активен' },
  ],
    hooks: createAuditHooks('user'),
  timestamps: true,
}
