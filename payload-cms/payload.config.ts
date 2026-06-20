import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Categories } from './src/collections/Categories'
import { Pages } from './src/collections/Pages'
import { BlogPosts } from './src/collections/BlogPosts'
import { GlossaryTerms } from './src/collections/GlossaryTerms'
import { FaqItems } from './src/collections/FaqItems'
import { Courses } from './src/collections/Courses'
import { Modules } from './src/collections/Modules'
import { Lessons } from './src/collections/Lessons'
import { Leads } from './src/collections/Leads'
import { Orders } from './src/collections/Orders'
import { Services } from './src/collections/Services'
import { Enrollments } from './src/collections/Enrollments'
import { LessonProgress } from './src/collections/LessonProgress'
import { Settings } from './src/collections/Settings'

// === Стандартные 9 блоков ===
import { HeroBlock } from './src/blocks/HeroBlock'
import { FeaturesBlock } from './src/blocks/FeaturesBlock'
import { CtaBlock } from './src/blocks/CtaBlock'
import { ContentBlock } from './src/blocks/ContentBlock'
import { FaqBlock } from './src/blocks/FaqBlock'
import { GalleryBlock } from './src/blocks/GalleryBlock'
import { PricingBlock } from './src/blocks/PricingBlock'
import { TestimonialsBlock } from './src/blocks/TestimonialsBlock'
import { StatsBlock } from './src/blocks/StatsBlock'

// === Дополнительные 9 блоков ===
import { TextBlock } from './src/blocks/TextBlock'
import { ImageBlock } from './src/blocks/ImageBlock'
import { VideoBlock } from './src/blocks/VideoBlock'
import { StepsBlock } from './src/blocks/StepsBlock'
import { CardsBlock } from './src/blocks/CardsBlock'
import { ContactBlock } from './src/blocks/ContactBlock'
import { DividerBlock } from './src/blocks/DividerBlock'
import { QuoteBlock } from './src/blocks/QuoteBlock'
import { TableBlock } from './src/blocks/TableBlock'

// === Специфичные блоки ===
import { InstructorBlock } from './src/blocks/InstructorBlock'
import { SnakeAnimationBlock } from './src/blocks/SnakeAnimationBlock'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plugins: any[] = [
  seoPlugin({
    collections: ['blog-posts', 'courses', 'glossary-terms', 'pages'],
    uploadsCollection: 'media',
  }),
]

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — Школа ПК', description: 'Панель управления платформой Школа ПК' },
    dateFormat: 'dd.MM.yyyy',
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Pages, BlogPosts, GlossaryTerms, FaqItems, Courses, Modules, Lessons, Leads, Orders, Services, Enrollments, LessonProgress],
  globals: [Settings],
  // === 20 BLOCKS ===
  blocks: [
    HeroBlock, FeaturesBlock, CtaBlock, ContentBlock, FaqBlock,
    GalleryBlock, PricingBlock, TestimonialsBlock, StatsBlock,
    TextBlock, ImageBlock, VideoBlock, StepsBlock, CardsBlock,
    ContactBlock, DividerBlock, QuoteBlock, TableBlock,
    InstructorBlock,
    SnakeAnimationBlock,
  ],
  plugins,
  db: postgresAdapter({
    push: true,
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'src/payload-types.ts') },
  graphQL: { disable: false },
  cors: ['http://2980738.ru', 'https://2980738.ru', 'http://localhost:3000', 'http://frontend:3000'],
  csrf: ['http://2980738.ru', 'https://2980738.ru', 'http://localhost:3000', 'http://frontend:3000'],
})
