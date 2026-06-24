import type { GlobalConfig } from 'payload'

/**
 * Header Global — управление шапкой сайта (горизонтальное меню)
 */
export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Шапка сайта (меню)',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor' || req.user?.role === 'manager',
  },
  fields: [
    {
      name: 'replaceDefaults',
      type: 'checkbox',
      defaultValue: false,
      label: 'Заменить стандартное меню',
      admin: {
        position: 'sidebar',
        description: 'Если ВКЛ — пункты из CMS полностью заменят стандартное меню. Если ВЫКЛ — пункты из CMS добавятся к стандартным.',
      },
    },
    {
      name: 'menuItems',
      type: 'array',
      label: 'Пункты горизонтального меню',
      labels: { singular: 'Пункт меню', plural: 'Пункты меню' },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Название пункта' },
        { name: 'href', type: 'text', required: true, label: 'Ссылка (URL)' },
        {
          name: 'hasDropdown',
          type: 'checkbox',
          defaultValue: false,
          label: 'Есть выпадающее подменю',
        },
        {
          name: 'dropdownItems',
          type: 'array',
          label: 'Подпункты выпадающего меню',
          admin: { condition: (_, sibling) => sibling?.hasDropdown === true },
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Название' },
            { name: 'href', type: 'text', required: true, label: 'Ссылка' },
          ],
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
          label: 'Открывать в новой вкладке',
        },
      ],
    },
    {
      name: 'logo',
      type: 'group',
      label: 'Логотип в шапке',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Изображение логотипа' },
        { name: 'text', type: 'text', label: 'Текстовый логотип', defaultValue: 'Школа ПК' },
        { name: 'href', type: 'text', label: 'Ссылка при клике', defaultValue: '/' },
      ],
    },
    {
      name: 'rightBlock',
      type: 'group',
      label: 'Правый блок шапки (контакты/кнопка)',
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон' },
        { name: 'phoneHref', type: 'text', label: 'Ссылка телефона (tel:...)' },
        { name: 'ctaText', type: 'text', label: 'Текст кнопки' },
        { name: 'ctaHref', type: 'text', label: 'Ссылка кнопки' },
      ],
    },
    { name: 'headCode', type: 'textarea', label: 'Код в HEAD (для шапки)', admin: { position: 'sidebar', description: 'Дополнительный код в <head> для шапки' } },
    { name: 'bodyCode', type: 'textarea', label: 'Код в BODY (для шапки)', admin: { position: 'sidebar', description: 'Дополнительный код для шапки' } },
  ],
}
