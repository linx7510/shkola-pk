/**
 * payload-types.ts — TypeScript типы для всех блоков Payload CMS
 * 
 * ВНИМАНИЕ: Этот файл создан вручную (npx payload generate:types не работает
 * из-за ERR_REQUIRE_ASYNC_MODULE в @payloadcms/richtext-lexical).
 * 
 * При изменении Payload-схемы блока → обновить соответствующий интерфейс здесь.
 * Скрипт scripts/check-block-sync.sh проверяет соответствие.
 */

// === RichText (Lexical JSON) ===
export type RichText = {
  root: {
    type: string
    format: string
    indent: number
    version: number
    direction: string
    children: any[]
  }
}

// === Media ===
export interface Media {
  id: number
  url: string
  alt?: string
  filename: string
  mimeType: string
  filesize: number
  width: number
  height: number
}

// === Block Types ===

export interface HeroBlock {
  title: string
  subtitle?: string
  backgroundImage?: Media | null
  ctaText?: string
  ctaLink?: string
  ctaText2?: string
  ctaLink2?: string
}

export interface FeaturesBlock {
  title?: string
  items: Array<{
    icon?: string
    title: string
    description?: string
  }>
}

export interface CtaBlock {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  buttonText2?: string
  buttonLink2?: string
  backgroundImage?: Media | null
}

export interface FaqBlock {
  title?: string
  items: Array<{
    question: string
    answer: RichText
  }>
}

export interface PricingBlock {
  title?: string
  plans: Array<{
    name: string
    price: number | string
    priceNote?: string
    features?: string | string[]
    isFeatured?: boolean
    ctaText?: string
    ctaLink?: string
  }>
}

export interface TestimonialsBlock {
  title?: string
  items: Array<{
    name: string
    role?: string
    text: string
    avatar?: Media | null
  }>
}

export interface GalleryBlock {
  title?: string
  images: Array<{
    image: Media
    caption?: string
  }>
}

export interface StatsBlock {
  title?: string
  stats: Array<{
    value: string
    label: string
    icon?: string
  }>
}

export interface ContentBlock {
  title?: string
  body: RichText  // ← Schema: body (richText)
}

export interface TextBlock {
  title?: string
  body: RichText
  backgroundColor?: 'dark' | 'accent' | 'transparent'
}

export interface ImageBlock {
  image: Media
  caption?: string
  alignment?: 'center' | 'left' | 'right'
  width?: 'full' | 'limited' | 'small'
}

export interface VideoBlock {
  title?: string
  videoUrl: string
  description?: string
}

export interface StepsBlock {
  title?: string
  steps: Array<{
    title: string
    description: string
  }>
}

export interface CardsBlock {
  title?: string
  cards: Array<{
    icon?: string
    title: string
    description: string
    link?: string
  }>
}

export interface ContactBlock {
  title?: string
  phone?: string
  email?: string
  telegram?: string
  address?: string
}

export interface DividerBlock {
  style?: 'line' | 'dots' | 'space'
}

export interface QuoteBlock {
  text: string
  author?: string
}

export interface TableBlock {
  title?: string
  columns: Array<{ header: string }>
  rows: Array<{ cells: Array<{ value: string }> }>
}

export interface InstructorBlock {
  title?: string
  name: string
  photo?: Media | null
  photoAlt?: string
  facts: Array<{ text: string }>
}

export interface SnakeAnimationBlock {
  enabled?: boolean
  maxSnakes?: number
  explosionRadius?: number
}

// === Page ===
export interface Page {
  id: number
  title: string
  slug: string
  isPublished: boolean
  blocks?: Array<{
    blockType: string
    [key: string]: any
  }>
}
