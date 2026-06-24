import type { GlobalConfig } from 'payload'

/**
 * Footer Global — управление подвалом сайта
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Подвал сайта',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor' || req.user?.role === 'manager',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Колонки подвала',
      labels: { singular: 'Колонка', plural: 'Колонки' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Заголовок колонки' },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'links',
          label: 'Тип колонки',
          options: [
            { label: 'Ссылки', value: 'links' },
            { label: 'Текст (HTML)', value: 'text' },
            { label: 'Социальные сети', value: 'socials' },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Текст колонки (HTML)',
          admin: { condition: (_, sibling) => sibling?.type === 'text' },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Ссылки',
          admin: { condition: (_, sibling) => sibling?.type === 'links' },
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Название' },
            { name: 'href', type: 'text', required: true, label: 'Ссылка' },
            { name: 'openInNewTab', type: 'checkbox', defaultValue: false, label: 'В новой вкладке' },
          ],
        },
        {
          name: 'socials',
          type: 'array',
          label: 'Социальные сети',
          admin: { condition: (_, sibling) => sibling?.type === 'socials' },
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Буквы/иконка (TG, VK, YT)' },
            { name: 'href', type: 'text', required: true, label: 'Ссылка' },
            { name: 'title', type: 'text', label: 'Подсказка (title)' },
          ],
        },
      ],
    },
    {
      name: 'bottomBar',
      type: 'group',
      label: 'Нижняя строка (copyright)',
      fields: [
        { name: 'copyright', type: 'text', label: 'Текст копирайта', defaultValue: '© 2015–2026 Школа ПК — Велеслав Старков' },
        {
          name: 'legalLinks',
          type: 'array',
          label: 'Правовые ссылки',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Название' },
            { name: 'href', type: 'text', required: true, label: 'Ссылка' },
          ],
        },
      ],
    },
    {
      name: 'contacts',
      type: 'group',
      label: 'Контакты в подвале',
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон' },
        { name: 'phoneHref', type: 'text', label: 'Ссылка телефона' },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'telegram', type: 'text', label: 'Telegram' },
        { name: 'address', type: 'textarea', label: 'Адрес' },
      ],
    },
    { name: 'headCode', type: 'textarea', label: 'Код в HEAD (для подвала)', admin: { position: 'sidebar' } },
    { name: 'bodyCode', type: 'textarea', label: 'Код в BODY (для подвала)', admin: { position: 'sidebar' } },
  ],
}
