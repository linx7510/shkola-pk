import type { GlobalConfig } from 'payload'

/**
 * Footer Global — управление подвалом сайта
 * Упрощённая версия — без arrays внутри
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
      name: 'columnsJson',
      type: 'textarea',
      label: 'Колонки подвала (JSON)',
      admin: {
        description: 'JSON-массив колонок. Формат: [{"title":"Навигация","type":"links","links":[{"label":"Услуги","href":"/uslugi"}]},{"title":"О школе","type":"text","text":"Описание..."},{"title":"Мы в сети","type":"socials","socials":[{"label":"TG","href":"https://t.me/..."}]}]',
      },
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Текст копирайта',
      defaultValue: '© 2015–2026 Школа ПК — Велеслав Старков',
    },
    {
      name: 'legalLinksJson',
      type: 'textarea',
      label: 'Правовые ссылки (JSON)',
      admin: {
        description: 'JSON-массив. Формат: [{"label":"Политика конфиденциальности","href":"/privacy"}]',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Телефон',
    },
    {
      name: 'phoneHref',
      type: 'text',
      label: 'Ссылка телефона',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
    },
    {
      name: 'telegram',
      type: 'text',
      label: 'Telegram',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Адрес',
    },
    {
      name: 'headCode',
      type: 'textarea',
      label: 'Код в HEAD (для подвала)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'bodyCode',
      type: 'textarea',
      label: 'Код в BODY (для подвала)',
      admin: { position: 'sidebar' },
    },
  ],
}
