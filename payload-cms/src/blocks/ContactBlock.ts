import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Контакты', plural: 'Контакты' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Свяжитесь с нами' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'telegram', type: 'text', label: 'Telegram' },
    { name: 'address', type: 'textarea', label: 'Адрес' },
  ],
}
