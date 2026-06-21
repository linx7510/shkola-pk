import type { CollectionConfig, Field } from 'payload'

/**
 * ServiceTemplates — шаблоны услуг (конструктор пакетов).
 *
 * Это ЯДРО масштабируемой системы. Каждый шаблон = один вид услуги
 * с собственным набором этапов, документов, XP и бейджей.
 *
 * Использование:
 *   - Создаём шаблон «ПК под ключ — Персонифицированный» → 31 документ, 100 XP
 *   - Создаём шаблон «Только Устав» → 1 документ, 100 XP (масштабируется)
 *   - Создаём шаблон «Аудит устава» → 3 документа, 100 XP
 *   - Создаём шаблон «Бухгалтерское сопровождение 6 мес» → 6 документов, 100 XP
 *
 * Каждый ClientProject ссылается на template и наследует структуру.
 * При изменении шаблона — все активные проекты НЕ затрагиваются (snapshot).
 *
 * Поля template копируются в ClientProject при создании (snapshot),
 * чтобы история конкретного клиента не менялась при редактировании шаблона.
 */

// ─── Поля этапа (вложенный массив) ────────────────────────────────────────
const stageFields: Field[] = [
  {
    name: 'num',
    type: 'number',
    label: 'Номер этапа (0-9)',
    required: true,
    admin: { description: '0 = Бриф, 1+ = этапы разработки' },
  },
  {
    name: 'name',
    type: 'text',
    label: 'Название этапа',
    required: true,
    admin: { description: 'Например: «Бриф», «Устав», «Положения»' },
  },
  {
    name: 'icon',
    type: 'text',
    label: 'Иконка (emoji)',
    defaultValue: '📋',
    admin: { description: 'Например: 📝 📜 ⚖️ 🎯 ⭐' },
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Описание этапа',
  },
  {
    name: 'who',
    type: 'select',
    label: 'Кто выполняет',
    defaultValue: 'executor',
    options: [
      { label: 'Клиент', value: 'client' },
      { label: 'Исполнитель', value: 'executor' },
      { label: 'Совместно', value: 'both' },
    ],
  },
  // Документы этапа (вложенный массив)
  {
    name: 'documents',
    type: 'array',
    label: 'Документы этапа',
    fields: [
      {
        name: 'code',
        type: 'text',
        label: 'Код (уникальный)',
        required: true,
        admin: { description: 'Например: ustav, protokol_1, polozhenie_paevye' },
      },
      {
        name: 'name',
        type: 'text',
        label: 'Название документа',
        required: true,
      },
      {
        name: 'xp',
        type: 'number',
        label: 'XP за готовность',
        required: true,
        defaultValue: 1,
        admin: { description: 'Сумма XP всех документов должна = totalXP шаблона' },
      },
      {
        name: 'estimatedDays',
        type: 'number',
        label: 'Срок разработки (дней)',
        defaultValue: 1,
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Описание документа (для ЛК клиента)',
      },
    ],
  },
]

// ─── Поля бейджа ──────────────────────────────────────────────────────────
const achievementFields: Field[] = [
  {
    name: 'code',
    type: 'text',
    label: 'Код (уникальный)',
    required: true,
  },
  {
    name: 'name',
    type: 'text',
    label: 'Название',
    required: true,
  },
  {
    name: 'icon',
    type: 'text',
    label: 'Иконка (emoji)',
    required: true,
    defaultValue: '🏆',
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Описание',
  },
  {
    name: 'xp',
    type: 'number',
    label: 'Бонусные XP (сверху документов)',
    defaultValue: 0,
    admin: { description: 'Если 0 — это «финальный» бейдж без доп. XP' },
  },
  {
    name: 'unlockCondition',
    type: 'select',
    label: 'Условие разблокировки',
    defaultValue: 'manual',
    options: [
      { label: 'Вручную (Исполнитель отмечает)', value: 'manual' },
      { label: 'Все документы этапа готовы', value: 'stage_done' },
      { label: 'Достигнут порог XP', value: 'xp_threshold' },
      { label: 'Определённые документы готовы', value: 'docs_done' },
    ],
  },
  {
    name: 'unlockStage',
    type: 'number',
    label: 'Этап для разблокировки (если unlockCondition=stage_done)',
    admin: { condition: (data) => data.unlockCondition === 'stage_done' },
  },
  {
    name: 'unlockXPThreshold',
    type: 'number',
    label: 'Порог XP (если unlockCondition=xp_threshold)',
    admin: { condition: (data) => data.unlockCondition === 'xp_threshold' },
  },
  {
    name: 'unlockDocCodes',
    type: 'text',
    label: 'Коды документов через запятую (если unlockCondition=docs_done)',
    admin: { condition: (data) => data.unlockCondition === 'docs_done' },
  },
]

export const ServiceTemplates: CollectionConfig = {
  slug: 'service-templates',
  labels: {
    singular: 'Шаблон услуги',
    plural: 'Шаблоны услуг',
  },
  admin: {
    group: 'Конструктор услуг',
    useAsTitle: 'name',
    defaultColumns: ['name', 'serviceType', 'priceMin', 'priceMax', 'totalXP', 'isActive'],
    description: 'Шаблоны пакетов услуг. Каждый шаблон = набор этапов, документов, XP, бейджей. Используется для создания ClientProject.',
  },
  access: {
    read: () => true, // шаблоны видны всем (для каталога услуг)
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // ─── Основная информация ───────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      label: 'Название шаблона',
      required: true,
      admin: { description: 'Например: «ПК под ключ — Персонифицированный»' },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (для URL)',
      required: true,
      unique: true,
      admin: { description: 'Например: pk-pod-klyuch-personalized' },
    },
    {
      name: 'serviceType',
      type: 'select',
      label: 'Тип услуги',
      required: true,
      options: [
        { label: 'Создание ПК под ключ', value: 'pk_creation' },
        { label: 'Аудит устава', value: 'audit_ustav' },
        { label: 'Целевая программа', value: 'cpp_development' },
        { label: 'Бухгалтерское сопровождение', value: 'accounting' },
        { label: 'Сопровождение при проверках', value: 'tax_support' },
        { label: 'Обучение', value: 'education' },
        { label: 'Сайт под ключ', value: 'website' },
        { label: 'Другое', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание (для каталога услуг)',
    },
    {
      name: 'shortDescription',
      type: 'text',
      label: 'Краткое описание (1 строка)',
    },

    // ─── Ценообразование ──────────────────────────────────────────────────
    {
      name: 'priceMin',
      type: 'number',
      label: 'Минимальная цена (₽)',
      required: true,
    },
    {
      name: 'priceMax',
      type: 'number',
      label: 'Максимальная цена (₽)',
      required: true,
      admin: { description: 'Вилка цен: от priceMin до priceMax' },
    },
    {
      name: 'currency',
      type: 'select',
      label: 'Валюта',
      defaultValue: 'RUB',
      options: [
        { label: '₽ RUB', value: 'RUB' },
        { label: '$ USD', value: 'USD' },
        { label: '€ EUR', value: 'EUR' },
      ],
    },
    {
      name: 'paymentSchedule',
      type: 'select',
      label: 'График оплаты',
      defaultValue: '50_50',
      options: [
        { label: '50% предоплата + 50% после', value: '50_50' },
        { label: '100% предоплата (со скидкой 5%)', value: '100_prepaid' },
        { label: 'Ежемесячно', value: 'monthly' },
        { label: 'По этапам', value: 'per_stage' },
        { label: 'Свободный', value: 'custom' },
      ],
    },

    // ─── Геймификация ─────────────────────────────────────────────────────
    {
      name: 'totalXP',
      type: 'number',
      label: 'Всего XP за весь шаблон',
      required: true,
      defaultValue: 100,
      admin: {
        description: 'Стандарт = 100. Сумма XP всех документов + бейджей должна = totalXP. Нормализуется автоматически.',
      },
    },
    {
      name: 'estimatedDurationDays',
      type: 'number',
      label: 'Срок выполнения (дней)',
      defaultValue: 25,
      admin: { description: 'Ориентировочный срок от старта до финиша' },
    },

    // ─── Этапы (массив) ───────────────────────────────────────────────────
    {
      name: 'stages',
      type: 'array',
      label: 'Этапы',
      required: true,
      admin: {
        description: 'Этапы пути клиента. Каждый этап содержит несколько документов.',
        components: {
        },
      },
      fields: stageFields,
    },

    // ─── Бейджи (массив) ──────────────────────────────────────────────────
    {
      name: 'achievements',
      type: 'array',
      label: 'Бейджи (достижения)',
      admin: {
        description: 'Бейджи автоматически разблокируются по условиям или вручную Исполнителем.',
        components: {
        },
      },
      fields: achievementFields,
    },

    // ─── Статус ───────────────────────────────────────────────────────────
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Активен (доступен для новых проектов)',
      defaultValue: true,
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Публичный (виден в каталоге услуг на сайте)',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Порядок сортировки',
      defaultValue: 100,
    },

    // ─── Мета ─────────────────────────────────────────────────────────────
    { name: 'createdAt', type: 'date', label: 'Создан', admin: { readOnly: true } },
    { name: 'updatedAt', type: 'date', label: 'Обновлён', admin: { readOnly: true } },
  ],

  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Логируем создание/обновление шаблона
        if (operation === 'create') {
          console.log(`[ServiceTemplates] Создан новый шаблон: ${doc.name} (slug: ${doc.slug})`)
        } else if (operation === 'update') {
          console.log(`[ServiceTemplates] Обновлён шаблон: ${doc.name}`)
        }
      },
    ],
  },
}
