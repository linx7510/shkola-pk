import type { CollectionConfig } from 'payload'
import DownloadButton from '../components/DownloadButton'

/**
 * Media collection — хранит изображения с автоматической конвертацией в WebP.
 *
 * При загрузке PNG/JPG автоматически создаются 5 размеров:
 * - thumbnail (100×100) — для админки и превью
 * - small (320×320) — для списка блогов
 * - medium (768×768) — для статей
 * - large (1200×1200) — для hero-блоков
 * - hero (1920×1080) — для главных баннеров
 *
 * Все размеры сохраняются в WebP (качество 80) — существенная экономия трафика.
 * Оригинальный файл сохраняется как есть (для совместимости).
 *
 * Для вставки в контент используйте URL формата:
 *   /api/media/file/{filename}      — оригинал
 *   /api/media/file/{filename}-small.webp   — маленький WebP
 *   /api/media/file/{filename}-medium.webp  — средний WebP
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медиафайл', plural: 'Медиафайлы' },
  upload: {
    // Разрешённые типы — изображения + документы
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    // Автоматические размеры с конвертацией в WebP
    imageSizes: [
      {
        name: 'thumbnail',
        width: 100,
        height: 100,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'small',
        width: 320,
        height: 320,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'medium',
        width: 768,
        height: 768,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'large',
        width: 1200,
        height: 1200,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
    ],
    // Формат отображения в админке
    adminThumbnail: 'thumbnail',
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'createdAt'],
    group: 'Контент',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'downloadLink',
      type: 'ui',
      admin: {
        components: {
          Field: { path: '../components/DownloadButton', serverProps: {} },
        },
      },
    },
    { name: 'alt', type: 'text', label: 'Альтернативный текст (обязательно для SEO)' },
    { name: 'caption', type: 'text', label: 'Подпись' },
  ],
  timestamps: true,
}
