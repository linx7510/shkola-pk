import type { GlobalConfig } from 'payload'
import { richTextEditor } from '../lexicalFeatures'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: { singular: 'Настройки сайта', plural: 'Настройки сайта' },
  access: { read: () => true },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Школа ПК', label: 'Название сайта' },
    { name: 'siteDescription', type: 'textarea', defaultValue: 'Первая Онлайн Школа Потребительских Кооперативов', label: 'Описание сайта' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Логотип' },
    { name: 'headerPhone', type: 'text', label: 'Телефон в шапке' },
    { name: 'headerEmail', type: 'email', label: 'Email в шапке' },
    { name: 'headerTelegram', type: 'text', label: 'Telegram' },
    { name: 'footerText', type: 'richText', label: 'Текст в подвале', editor: richTextEditor },
    { name: 'yookassaShopId', type: 'text', label: 'YooKassa Shop ID', admin: { position: 'sidebar' } },
    { name: 'yookassaSecretKey', type: 'text', label: 'YooKassa Secret Key', admin: { position: 'sidebar' } },
    { name: 'smtpHost', type: 'text', label: 'SMTP Host', admin: { position: 'sidebar' } },
    { name: 'smtpPort', type: 'number', label: 'SMTP Port', admin: { position: 'sidebar' } },
    { name: 'smtpUser', type: 'text', label: 'SMTP User', admin: { position: 'sidebar' } },
    {
      name: 'analytics',
      type: 'group',
      label: 'Аналитика',
      fields: [
        { name: 'yandexMetrikaId', type: 'text', label: 'Yandex Metrika ID' },
        { name: 'googleAnalyticsId', type: 'text', label: 'Google Analytics ID' },
      ],
    },
  ],
}

