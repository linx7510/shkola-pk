import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

import { HeroBlock } from '../blocks/HeroBlock'
import { FeaturesBlock } from '../blocks/FeaturesBlock'
import { CtaBlock } from '../blocks/CtaBlock'
import { ContentBlock } from '../blocks/ContentBlock'
import { FaqBlock } from '../blocks/FaqBlock'
import { GalleryBlock } from '../blocks/GalleryBlock'
import { PricingBlock } from '../blocks/PricingBlock'
import { TestimonialsBlock } from '../blocks/TestimonialsBlock'
import { StatsBlock } from '../blocks/StatsBlock'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { StepsBlock } from '../blocks/StepsBlock'
import { CardsBlock } from '../blocks/CardsBlock'
import { ContactBlock } from '../blocks/ContactBlock'
import { DividerBlock } from '../blocks/DividerBlock'
import { QuoteBlock } from '../blocks/QuoteBlock'
import { TableBlock } from '../blocks/TableBlock'
import { InstructorBlock } from '../blocks/InstructorBlock'
import { SnakeAnimationBlock } from '../blocks/SnakeAnimationBlock'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublished', 'updatedAt'],
    group: 'Контент',
    listSearchableFields: ['title', 'slug'],
  },
  access: { read: () => true },
  hooks: {
    ...createAuditHooks('page'),
    beforeRead: [
      ({ req }: any) => {
        // Default sort: most recently updated first
        if (!req.query || !req.query.sort) {
          if (!req.query) req.query = {}
          req.query.sort = '-updatedAt'
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }: any) => {
        // After any page change, bump home page's updatedAt so it stays on top
        if (operation === 'update' || operation === 'create') {
          // Don't bump if we're already updating home
          if (doc.slug !== 'home') {
            try {
              const { pool } = await import('../lib/db')
              await pool.query("UPDATE pages SET updated_at = NOW() + INTERVAL '1 second' WHERE slug = 'home'")
            } catch (e) { /* silent */ }
          }
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликована', admin: { position: 'sidebar' } },
    {
      name: 'hero',
      type: 'group',
      label: 'Hero (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      fields: [
        { name: 'titleLine1', type: 'text', label: 'Заголовок (первая строка)' },
        { name: 'titleLine2', type: 'text', label: 'Заголовок (вторая строка)' },
        { name: 'description', type: 'textarea', label: 'Описание' },
        { name: 'ctaPrimaryText', type: 'text', label: 'Текст основной кнопки' },
        { name: 'ctaPrimaryLink', type: 'text', label: 'Ссылка основной кнопки' },
        { name: 'ctaSecondaryText', type: 'text', label: 'Текст второй кнопки' },
        { name: 'ctaSecondaryLink', type: 'text', label: 'Ссылка второй кнопки' },
      ],
    },
    {
      name: 'quote',
      type: 'group',
      label: 'Цитата (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      fields: [
        { name: 'text', type: 'textarea', label: 'Текст цитаты' },
        { name: 'author', type: 'text', label: 'Автор' },
      ],
    },
    {
      name: 'advantages',
      type: 'array',
      label: 'Преимущества (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      labels: { singular: 'Преимущество', plural: 'Преимущества' },
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'desc', type: 'textarea', required: true, label: 'Описание' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Статистика (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      labels: { singular: 'Показатель', plural: 'Показатели' },
      fields: [
        { name: 'value', type: 'text', required: true, label: 'Значение' },
        { name: 'label', type: 'text', required: true, label: 'Подпись' },
      ],
    },
    {
      name: 'howSteps',
      type: 'array',
      label: 'Как это работает (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      labels: { singular: 'Шаг', plural: 'Шаги' },
      fields: [
        { name: 'num', type: 'text', required: true, label: 'Номер/иконка' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'desc', type: 'textarea', required: true, label: 'Описание' },
      ],
    },
    {
      name: 'aboutCards',
      type: 'array',
      label: 'Карточки "О школе" (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      labels: { singular: 'Карточка', plural: 'Карточки' },
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)' },
        { name: 'title', type: 'text', required: true, label: 'Заголовок' },
        { name: 'desc', type: 'richText', label: 'Описание' },
      ],
    },
    {
      name: 'aboutVeleslav',
      type: 'group',
      label: 'О Велеславе (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок' },
        { name: 'photo', type: 'upload', relationTo: 'media', label: 'Фото' },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Абзацы',
          labels: { singular: 'Абзац', plural: 'Абзацы' },
          fields: [
            { name: 'text', type: 'textarea', required: true, label: 'Текст абзаца' },
          ],
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      label: 'Услуги (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      labels: { singular: 'Услуга', plural: 'Услуги' },
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)' },
        { name: 'title', type: 'text', required: true, label: 'Название' },
        { name: 'price', type: 'text', label: 'Цена' },
        { name: 'desc', type: 'textarea', required: true, label: 'Описание' },
        { name: 'href', type: 'text', label: 'Ссылка' },
      ],
    },
    {
      name: 'faqItems',
      type: 'array',
      label: 'FAQ (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      labels: { singular: 'Вопрос', plural: 'Вопросы' },
      fields: [
        { name: 'q', type: 'text', required: true, label: 'Вопрос' },
        { name: 'a', type: 'textarea', required: true, label: 'Ответ' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA блок (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок' },
        { name: 'subtitle', type: 'textarea', label: 'Подзаголовок' },
        { name: 'buttonText', type: 'text', label: 'Текст кнопки' },
        { name: 'buttonLink', type: 'text', label: 'Ссылка кнопки' },
      ],
    },
    {
      name: 'contacts',
      type: 'group',
      label: 'Контакты (только для главной)',
      admin: { condition: (_, sibling) => sibling?.slug === 'home' },
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон' },
        { name: 'phoneHref', type: 'text', label: 'Ссылка телефона' },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'telegram', type: 'text', label: 'Telegram' },
        { name: 'telegramLink', type: 'text', label: 'Ссылка Telegram' },
        { name: 'address', type: 'textarea', label: 'Адрес' },
        { name: 'legal', type: 'textarea', label: 'Юридическая информация' },
      ],
    },
    { name: 'content', type: 'richText', label: 'Содержание (SEO)' },
    { name: 'headCode', type: 'textarea', label: 'Код в HEAD', admin: { position: 'sidebar', description: 'Код для head' } },
    { name: 'bodyCode', type: 'textarea', label: 'Код в BODY', admin: { position: 'sidebar', description: 'Код для body' } },
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Блоки страницы (гибкая компоновка)',
      blocks: [
        HeroBlock, FeaturesBlock, CtaBlock, ContentBlock, FaqBlock,
        GalleryBlock, PricingBlock, TestimonialsBlock, StatsBlock,
        TextBlock, ImageBlock, VideoBlock, StepsBlock, CardsBlock,
        ContactBlock, DividerBlock, QuoteBlock, TableBlock,
        InstructorBlock, SnakeAnimationBlock,
      ],
    },
  ],
  timestamps: true,
}
