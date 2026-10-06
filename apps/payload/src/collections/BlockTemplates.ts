import type { CollectionConfig } from 'payload'

export const BLOCK_TYPE_OPTIONS = [
  { label: 'Герой (Hero)', value: 'hero' },
  { label: 'Преимущества', value: 'features' },
  { label: 'Призыв к действию (CTA)', value: 'cta' },
  { label: 'Контент', value: 'content' },
  { label: 'Вопрос-ответ (FAQ)', value: 'faq' },
  { label: 'Галерея', value: 'gallery' },
  { label: 'Тарифы', value: 'pricing' },
  { label: 'Отзывы', value: 'testimonials' },
  { label: 'Показатели (цифры)', value: 'stats' },
  { label: 'Текст', value: 'text' },
  { label: 'Изображение', value: 'image' },
  { label: 'Видео', value: 'video' },
  { label: 'Шаги', value: 'steps' },
  { label: 'Карточки', value: 'cards' },
  { label: 'Контакты (форма)', value: 'contact' },
  { label: 'Разделитель', value: 'divider' },
  { label: 'Цитата', value: 'quote' },
  { label: 'Таблица', value: 'table' },
  { label: 'Преподаватель', value: 'instructor' },
  { label: 'Анимация «Змейка»', value: 'snake-animation' },
  { label: 'Анимация «Пакман»', value: 'pacman-animation' },
]

const adminOrEditor = ({ req }: any) =>
  req.user?.role === 'admin' || req.user?.role === 'editor' || req.user?.role === 'manager'

export const BlockTemplates: CollectionConfig = {
  slug: 'block-templates',
  labels: { singular: 'Шаблон блока', plural: 'Шаблоны блоков' },
  admin: {
    group: 'Сайт',
    useAsTitle: 'name',
    defaultColumns: ['name', 'blockType', 'updatedAt'],
    description: 'Библиотека готовых блоков. Заполните блок на любой странице, нажмите «Сохранить блок в библиотеку» — и его можно будет вставить на любую другую страницу одной кнопкой.',
  },
  access: {
    read: adminOrEditor,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Название шаблона' },
    { name: 'blockType', type: 'select', required: true, options: BLOCK_TYPE_OPTIONS, label: 'Тип блока' },
    { name: 'description', type: 'textarea', label: 'Описание (для чего этот шаблон)' },
    { name: 'data', type: 'json', label: 'Данные блока (JSON)' },
  ],
}
