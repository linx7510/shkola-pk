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
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Содержание статьи (HTML)',
      admin: {
        description: '📝 Редактируйте текст в HTML. Теги: <h2>заголовок</h2>, <p>абзац</p>, <ul><li>пункт</li></ul>, <blockquote>цитата</blockquote>, <a href="...">ссылка</a>, <strong>жирный</strong>, <em>курсив</em>.\n\n🖼 Для вставки изображения с настройками размера и обтекания используйте кнопку «Вставить изображение» над полем. Изображения вставляются с inline-стилями: <img src="..." style="width:400px;float:left;margin:0 1.5rem 1rem 0;"> — где width=ширина, float=обтекание (left/right/none), margin=отступы.',
        components: {
          beforeInput: ['@/components/ImageInsertButton#ImageInsertButton'],
        },
      },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Обложка' },
    { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Категория', filterOptions: { type: { equals: 'blog' } } },
    { name: 'tags', type: 'text', label: 'Теги (через запятую)', admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'users', label: 'Автор', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликован', admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', label: 'Дата публикации', admin: { position: 'sidebar', date: { displayFormat: 'dd.MM.yyyy' } } },
    { name: 'headCode', type: 'textarea', label: 'Код в HEAD', admin: { position: 'sidebar', description: 'Вставьте код для head' } },
    { name: 'bodyCode', type: 'textarea', label: 'Код в BODY', admin: { position: 'sidebar', description: 'Вставьте код для body' } },
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
