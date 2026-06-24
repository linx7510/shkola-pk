import type { GlobalConfig } from 'payload'

/**
 * Header Global — управление шапкой сайта (горизонтальное меню)
 * Упрощённая версия — без arrays внутри (массивы вынесены в отдельные поля-текст)
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
      name: 'menuItemsJson',
      type: 'textarea',
      label: 'Пункты меню (JSON)',
      admin: {
        description: 'JSON-массив пунктов меню. Формат: [{"label":"Курсы","href":"/kursy"},{"label":"Услуги","href":"/uslugi","dropdown":[{"label":"Аудит","href":"/uslugi#audit"}]}]. Оставьте пустым — будет использоваться меню по умолчанию из кода.',
      },
    },
    {
      name: 'logoText',
      type: 'text',
      label: 'Текстовый логотип',
      defaultValue: 'Школа ПК',
    },
    {
      name: 'logoImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение логотипа (заменяет текст)',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Телефон в шапке',
    },
    {
      name: 'phoneHref',
      type: 'text',
      label: 'Ссылка телефона (tel:...)',
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'Текст кнопки (правый блок)',
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'Ссылка кнопки',
    },
    {
      name: 'headCode',
      type: 'textarea',
      label: 'Код в HEAD (для шапки)',
      admin: { position: 'sidebar', description: 'Дополнительный код в <head> для шапки (мета-теги, стили)' },
    },
    {
      name: 'bodyCode',
      type: 'textarea',
      label: 'Код в BODY (для шапки)',
      admin: { position: 'sidebar', description: 'Дополнительный код для шапки (скрипты, счётчики)' },
    },
  ],
}
