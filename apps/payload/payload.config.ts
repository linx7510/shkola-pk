import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ru } from '@payloadcms/translations/languages/ru'
import { en } from '@payloadcms/translations/languages/en'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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
import { ServiceTemplates } from './src/collections/ServiceTemplates'
import { ClientProjects } from './src/collections/ClientProjects'
import { Orders } from './src/collections/Orders'
import { Services } from './src/collections/Services'
import { Enrollments } from './src/collections/Enrollments'
import { LessonProgress } from './src/collections/LessonProgress'
import { Settings } from './src/collections/Settings'
import { Header } from './src/collections/Header'
import { Footer } from './src/collections/Footer'
import { AuditLogs } from './src/collections/AuditLogs'

// === Custom endpoints ===
import { updateProjectProgressEndpoint } from './src/endpoints/update-project-progress'
import { sendTestEmailEndpoint } from './src/endpoints/send-test-email'

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
/* S3 storage — restored P1-4
  s3Storage({
    collections: {
      media: {
        prefix: 'media',
      },
    },
    bucket: process.env.S3_BUCKET || 'shkola-pk-media',
    config: {
      endpoint: process.env.S3_ENDPOINT || 'https://s3.regru.cloud',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
      region: process.env.S3_REGION || 'ru-1',
      forcePathStyle: true,
    },
  }), */

/* SEO plugin — restored P1-4
  seoPlugin({
    collections: ['blog-posts', 'courses', 'glossary-terms', 'pages',
  ],
    uploadsCollection: 'media',
  }), */
]

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — Школа ПК', description: 'Панель управления платформой Школа ПК' },
    dateFormat: 'dd.MM.yyyy',
  },
  i18n: {
    supportedLanguages: { ru, en },
    fallbackLanguage: 'ru',
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Pages, BlogPosts, GlossaryTerms, FaqItems, Courses, Modules, Lessons, Leads, Orders, Services, Enrollments, LessonProgress, ServiceTemplates, ClientProjects, AuditLogs],
  globals: [Settings, Header, Footer],
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
    push: false,
    migrationDir: path.resolve(dirname, 'src/migrations'),
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  secret: (() => {
    const s = process.env.PAYLOAD_SECRET;
    if (!s || s.length < 32) {
      throw new Error('PAYLOAD_SECRET must be set and be at least 32 chars long. Set it in .env');
    }
    return s;
  })(),
  typescript: { outputFile: path.resolve(dirname, 'src/payload-types.ts') },
  graphQL: { disable: false },
  cors: ['http://2980738.ru', 'https://2980738.ru', 'http://localhost:3000', 'http://frontend:3000'],
  csrf: ['http://2980738.ru', 'https://2980738.ru', 'http://localhost:3000', 'http://frontend:3000'],
  endpoints: [
    updateProjectProgressEndpoint,
    sendTestEmailEndpoint,
  ],
  // === Email (SMTP через mail.ru) ===
  // Используется для отправки verification emails при регистрации,
  // уведомлений о загрузке документов, и других транзакционных писем.
  // Требует SMTP_PASS = app-password от mail.ru (не основной пароль!)
  // Создать app password: https://mail.ru/?authid=kv_sessionid&helpId=mail-security-protection-external
  // Если SMTP_PASS не задан (placeholder) — email transport не активируется,
  // но Payload работает нормально (письма только логируются).
  ...(process.env.SMTP_PASS && process.env.SMTP_PASS !== 'email_password_change_me' ? {
    email: nodemailerAdapter({
      defaultFromName: 'Школа ПК',
      defaultFromAddress: process.env.SMTP_USER || 'boss@2980738.ru',
      transportOptions: {
        host: process.env.SMTP_HOST || 'smtp.mail.ru',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS,
        },
        secure: false,
        requireTLS: true,
      },
    }),
  } : {}),
})
