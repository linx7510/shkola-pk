import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Видео', plural: 'Видео' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    { name: 'videoUrl', type: 'text', label: 'Ссылка на видео (YouTube/Rutube)', required: true },
    { name: 'description', type: 'textarea', label: 'Описание' },
  ],
}
