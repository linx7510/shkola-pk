import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Видео', plural: 'Видео' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок' },
    { name: 'videoUrl', type: 'text', label: 'Ссылка на видео (VK, YouTube, Rutube)', required: true, admin: { description: 'Вставьте ссылку из VK: vk.com/video-123456_789012 или vk.com/video_ext.php?oid=...&id=...' } },
    { name: 'description', type: 'textarea', label: 'Описание' },
  ],
}
