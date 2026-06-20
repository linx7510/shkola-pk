
import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

// === ИМПОРТ ВСЕХ 20 БЛОКОВ для layout.blocks[] ===
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
import { PacmanAnimationBlock } from '../blocks/PacmanAnimationBlock'

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
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликована', admin: { position: 'sidebar' } },

    // === HERO (для home страницы) ===
    {
      name: 'hero',
      type: 'group',
      label: 'Hero — главный экран (только для главной)',
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

    // === SEO ===
    { name: 'content', type: 'richText', label: 'Содержание (SEO)' },

    // === LAYOUT: BLOCKS[] — гибкая компоновка страницы из 20 блоков ===
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Блоки страницы (гибкая компоновка)',
      admin: {
        description: 'Добавляйте блоки в любом порядке. Доступно 20 типов блоков.',
      },
      blocks: [
        HeroBlock,
        FeaturesBlock,
        CtaBlock,
        ContentBlock,
        FaqBlock,
        GalleryBlock,
        PricingBlock,
        TestimonialsBlock,
        StatsBlock,
        TextBlock,
        ImageBlock,
        VideoBlock,
        StepsBlock,
        CardsBlock,
        ContactBlock,
        DividerBlock,
        QuoteBlock,
        TableBlock,
        InstructorBlock,
        PacmanAnimationBlock,
      ],
    },
  ],
    hooks: createAuditHooks('page'),
  timestamps: true,
}
