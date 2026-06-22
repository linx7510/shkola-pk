import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Статья блога', plural: 'Блог' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'isPublished', 'publishedAt'],
    group: 'Контент',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'editor') return true
      return { isPublished: { equals: true } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг', admin: { position: 'sidebar' } },
    { name: 'excerpt', type: 'textarea', maxLength: 300, label: 'Анонс' },
    { name: 'content', type: 'textarea', required: true, label: 'Содержание статьи (HTML)', admin: { description: 'Редактируйте текст в HTML. Заголовки: <h2>текст</h2>, абзацы: <p>текст</p>, списки: <ul><li>пункт</li></ul>, цитаты: <blockquote>текст</blockquote>' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Обложка' },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Категория', filterOptions: { type: { equals: 'blog' } } },
    { name: 'tags', type: 'text', label: 'Теги (через запятую)', admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'users', label: 'Автор', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликован', admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', label: 'Дата публикации', admin: { position: 'sidebar', date: { displayFormat: 'dd.MM.yyyy' } } },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO мета-теги',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'title', type: 'text', label: 'Meta Title' },
        { name: 'description', type: 'textarea', label: 'Meta Description' },
      ],
    },
  ],
  hooks: createAuditHooks('blog-post'),
  timestamps: true,
}
