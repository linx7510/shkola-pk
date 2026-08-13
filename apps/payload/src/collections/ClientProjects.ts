import type { CollectionConfig, Field } from 'payload'
import { sendClientChatReplyEmail } from '../lib/notify-email'

/**
 * ClientProjects — проекты клиентов.
 *
 * Каждый проект = путь клиента к выполнению договора.
 * Ссылается на ServiceTemplate (шаблон услуги) и наследует его структуру:
 *   - stages + documents копируются из template при создании (snapshot)
 *   - achievements копируются из template при создании (snapshot)
 *   - chat, calendar, notifications — уникальны для каждого проекта
 *
 * Snapshot нужен, чтобы при изменении шаблона (например, добавили новый документ)
 * уже запущенные проекты НЕ менялись — у них своя фикс-структура.
 */

const documentStatusFields: Field[] = [
  {
    name: 'code',
    type: 'text',
    label: 'Код',
    required: true,
  },
  {
    name: 'name',
    type: 'text',
    label: 'Название',
    required: true,
  },
  {
    name: 'stage',
    type: 'number',
    label: 'Этап (0-9)',
    required: true,
  },
  {
    name: 'stageName',
    type: 'text',
    label: 'Название этапа',
  },
  {
    name: 'stageIcon',
    type: 'text',
    label: 'Иконка этапа',
  },
  {
    name: 'xp',
    type: 'number',
    label: 'XP за готовность',
    required: true,
  },
  {
    name: 'estimatedDays',
    type: 'number',
    label: 'Срок разработки (дней)',
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Описание',
  },
  {
    name: 'status',
    type: 'select',
    label: 'Статус',
    defaultValue: 'pending',
    options: [
      { label: '📝 В очереди', value: 'pending' },
      { label: '⏳ В разработке', value: 'in_progress' },
      { label: '📥 Доступен к скачиванию', value: 'available' },
      { label: '✅ Готов', value: 'ready' },
      { label: '👁 На согласовании', value: 'review' },
      { label: '⏸ Согласован', value: 'approved' },
      { label: '📤 Подан в ФНС', value: 'submitted' },
      { label: '⭐ Зарегистрирован', value: 'registered' },
    ],
  },
  { name: 'readyAt', type: 'date', label: 'Дата готовности' },
  { name: 'approvedAt', type: 'date', label: 'Дата согласования' },
  {
    name: 'file',
    type: 'upload',
    relationTo: 'media',
    label: 'Файл документа',
  },
  { name: 'comment', type: 'textarea', label: 'Комментарий Исполнителя' },
  { name: 'clientComment', type: 'textarea', label: 'Комментарий Клиента' },
]

const achievementFields: Field[] = [
  { name: 'code', type: 'text', label: 'Код', required: false },
  { name: 'name', type: 'text', label: 'Название', required: false },
  { name: 'icon', type: 'text', label: 'Иконка', required: true },
  { name: 'description', type: 'textarea', label: 'Описание' },
  { name: 'xp', type: 'number', label: 'Бонусные XP' },
  {
    name: 'unlockCondition',
    type: 'select',
    label: 'Условие разблокировки',
    options: [
      { label: 'Вручную', value: 'manual' },
      { label: 'Все документы этапа готовы', value: 'stage_done' },
      { label: 'Порог XP', value: 'xp_threshold' },
      { label: 'Документы готовы', value: 'docs_done' },
    ],
  },
  { name: 'unlockStage', type: 'number', label: 'Этап (для stage_done)' },
  { name: 'unlockXPThreshold', type: 'number', label: 'Порог XP (для xp_threshold)' },
  { name: 'unlockDocCodes', type: 'text', label: 'Коды документов (для docs_done)' },
  { name: 'unlocked', type: 'checkbox', label: 'Открыт', defaultValue: false },
  { name: 'unlockedAt', type: 'date', label: 'Дата открытия' },
]

export const ClientProjects: CollectionConfig = {
  slug: 'client-projects',
  labels: {
    singular: 'Проект клиента',
    plural: 'Проекты клиентов',
  },
  admin: {
    group: 'Личный кабинет',
    useAsTitle: 'coopName',
    defaultColumns: ['coopName', 'client', 'template', 'stage', 'totalXP', 'contract'],
    description: 'Проекты клиентов по договорам. Каждый проект ссылается на шаблон услуги (ServiceTemplate) и наследует его структуру.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { client: { equals: user?.id } }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'client' || user?.role === 'student',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '👤 Клиент и договор',
          fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Клиент',
    },
    {
      name: 'coopName',
      type: 'text',
      required: true,
      label: 'Название кооператива',
    },
    {
      name: 'coopSlug',
      type: 'text',
      label: 'Slug кооператива',
      admin: { description: 'Для URL: /dashboard/[coopSlug]' },
    },

    // ─── Шаблон услуги ────────────────────────────────────────────────────
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'service-templates',
      required: true,
      label: 'Шаблон услуги',
      admin: {
        description: 'При выборе шаблона — структура (этапы, документы, бейджи) копируется в этот проект (snapshot).',
      },
    },
    {
      name: 'templateSnapshot',
      type: 'json',
      label: 'Снапшот шаблона (на момент создания)',
      admin: { hidden: true },
    },

    // ─── Договор ──────────────────────────────────────────────────────────
    {
      name: 'contract',
      type: 'group',
      label: 'Договор',
      fields: [
        { name: 'number', type: 'text', label: 'Номер', required: true },
        { name: 'signedAt', type: 'date', label: 'Дата подписания', required: true },
        {
          name: 'amount',
          type: 'number',
          label: 'Сумма (₽)',
          required: true,
          admin: { description: 'Фактическая сумма договора (в пределах вилки шаблона)' },
        },
        {
          name: 'paymentStatus',
          type: 'select',
          label: 'Статус оплаты',
          defaultValue: 'prepaid_50',
          options: [
            { label: 'Ожидает оплаты', value: 'pending' },
            { label: 'Предоплата 50%', value: 'prepaid_50' },
            { label: 'Предоплата 100%', value: 'prepaid_100' },
            { label: 'Оплачен полностью', value: 'paid_100' },
            { label: 'Частичная оплата', value: 'partial' },
          ],
        },
        { name: 'paidAt', type: 'date', label: 'Дата предоплаты' },
        { name: 'finalPaidAt', type: 'date', label: 'Дата финальной оплаты' },
        {
          name: 'paymentSchedule',
          type: 'select',
          label: 'График оплаты',
          options: [
            { label: '50/50', value: '50_50' },
            { label: '100% предоплата', value: '100_prepaid' },
            { label: 'Ежемесячно', value: 'monthly' },
            { label: 'По этапам', value: 'per_stage' },
            { label: 'Свободный', value: 'custom' },
          ],
        },
      ],
    },

    // ─── Прогресс ─────────────────────────────────────────────────────────
    {
      name: 'stage',
      type: 'number',
      label: 'Текущий этап (0-9)',
      defaultValue: 0,
      admin: { description: '0 = Бриф, 1+ = этапы разработки' },
    },
    {
      name: 'totalXP',
      type: 'number',
      label: 'Всего XP',
      defaultValue: 0,
      admin: { readOnly: true, description: 'Авто-расчёт: сумма XP готовых документов + открытых бейджей' },
    },
    {
      name: 'percent',
      type: 'number',
      label: 'Процент выполнения',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    // Поля для консультаций (дата и время запланированной консультации)
  { name: 'consultationDate', type: 'date', label: 'Дата консультации', admin: { position: 'sidebar', date: { displayFormat: 'dd.MM.yyyy' } } },
  { name: 'consultationTime', type: 'text', label: 'Время консультации', admin: { position: 'sidebar' } },
  { name: 'createdAt', type: 'date', label: 'Создан', admin: { readOnly: true } },
    { name: 'updatedAt', type: 'date', label: 'Обновлён', admin: { readOnly: true } },
          ],
        },
        {
          label: '📄 Документы',
          fields: [
    {
      name: 'documents',
      type: 'array',
      label: 'Документы',
      admin: {
        description: 'Snapshot из шаблона. Статус меняет Исполнитель.',
        initCollapsed: true,
      },
      fields: documentStatusFields,
    },

          ],
        },
        {
          label: '🏆 Бейджи и чат',
          fields: [
    {
      name: 'achievements',
      type: 'array',
      label: 'Бейджи',
      fields: achievementFields,
    },

    // ─── Чат ──────────────────────────────────────────────────────────────
    {
      name: 'chat',
      type: 'array',
      label: 'Чат с Исполнителем',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'author',
          type: 'select',
          label: 'Автор',
          required: true,
          options: [
            { label: 'Клиент', value: 'client' },
            { label: 'Исполнитель', value: 'executor' },
            { label: 'Система', value: 'system' },
          ],
        },
        { name: 'message', type: 'textarea', label: 'Сообщение', required: false },
        { name: 'sentAt', type: 'date', label: 'Дата', required: false },
        {
          name: 'attachedDocumentCode',
          type: 'text',
          label: 'Код привязанного документа',
        },
      ],
    },

    // ─── Календарь ────────────────────────────────────────────────────────
    {
      name: 'calendar',
      type: 'array',
      label: 'Календарь сроков',
      admin: { initCollapsed: true },
      fields: [
        { name: 'event', type: 'text', label: 'Событие', required: false },
        { name: 'date', type: 'date', label: 'Дата', required: false },
        {
          name: 'type',
          type: 'select',
          label: 'Тип',
          options: [
            { label: 'Дедлайн документа', value: 'deadline' },
            { label: 'Встреча/созвон', value: 'meeting' },
            { label: 'Подача в ФНС', value: 'submission' },
            { label: 'Получение ЕГРЮЛ', value: 'registration' },
            { label: 'Оплата', value: 'payment' },
          ],
        },
        { name: 'done', type: 'checkbox', label: 'Завершено', defaultValue: false },
      ],
    },

    // ─── Уведомления ──────────────────────────────────────────────────────
    {
      name: 'notifications',
      type: 'array',
      label: 'Уведомления',
      admin: { initCollapsed: true },
      fields: [
        { name: 'type', type: 'text', label: 'Тип', required: false },
        { name: 'message', type: 'textarea', label: 'Сообщение', required: false },
        { name: 'sentAt', type: 'date', label: 'Отправлено', required: false },
        { name: 'readAt', type: 'date', label: 'Прочитано' },
        {
          name: 'channel',
          type: 'select',
          label: 'Канал',
          required: false,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Telegram', value: 'telegram' },
            { label: 'В ЛК', value: 'dashboard' },
            { label: 'Админ', value: 'admin' },
          ],
        },
      ],
    },

          ],
        },
      ],
    },
  ],

  hooks: {
    // ─── При создании: копируем структуру из template ────────────────────
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.template) {
          // Загружаем шаблон
          const template = await req.payload.findByID({
            collection: 'service-templates',
            id: data.template as string,
          })

          if (template) {
            // Snapshot структуры в JSON
            data.templateSnapshot = {
              name: template.name,
              slug: template.slug,
              totalXP: template.totalXP,
              priceMin: template.priceMin,
              priceMax: template.priceMax,
              snapshotDate: new Date().toISOString(),
            }

            // Копируем документы
            const docs: any[] = []
            for (const stage of (template.stages || [])) {
              for (const doc of (stage.documents || [])) {
                docs.push({
                  code: doc.code,
                  name: doc.name,
                  stage: stage.num,
                  stageName: stage.name,
                  stageIcon: stage.icon,
                  xp: doc.xp,
                  estimatedDays: doc.estimatedDays,
                  description: doc.description,
                  status: 'pending',
                })
              }
            }
            data.documents = docs

            // Копируем бейджи
            data.achievements = (template.achievements || []).map((a: any) => ({
              code: a.code,
              name: a.name,
              icon: a.icon,
              description: a.description,
              xp: a.xp,
              unlockCondition: a.unlockCondition,
              unlockStage: a.unlockStage,
              unlockXPThreshold: a.unlockXPThreshold,
              unlockDocCodes: a.unlockDocCodes,
              unlocked: false,
            }))

            // Чат пустой — клиент напишет первым когда будет готов
            data.chat = []
          }
        }
        return data
      },
    ],

    // ─── После изменения: авто-расчёт XP + проверка бейджей ──────────────
    // ВНИМАНИЕ: вызов req.payload.update внутри afterChange приводит к
    // бесконечной рекурсии, поэтому прогресс тут НЕ пересчитывается.
    // Расчёт XP и процентов выполняется:
    //   - при создании проекта: в /api/client-projects/order route
    //   - при загрузке документов: в /api/client-projects/upload route
    //   - при обновлении через админку: вручную или через /api/custom/update-progress
    //
    // Этот afterChange НЕ вызывает req.payload.update → рекурсии нет.
    // Он только отправляет email клиенту при появлении нового сообщения
    // исполнителя в чате (fire-and-forget, try/catch, не блокирует сохранение).
    afterChange: [
      // ─── Email клиенту при ответе исполнителя в чате ───────────────────
      // Срабатывает ТОЛЬКО при сохранении проекта через Payload (админка):
      //   исполнитель редактирует client_projects → добавляет chat message
      //   с author='executor' → сохраняет → клиенту уходит email.
      // Клиент пишет через /api/client-projects/chat (raw SQL INSERT в
      //   client_projects_chat) — это НЕ обновляет документ client_projects
      //   через Payload, поэтому хук на сообщения клиента не срабатывает
      //   (что и требуется: клиенту незачем получать письмо на свой же ответ).
      // Идемпотентность: сравнение chat до/после по id поддокумента массива
      //   (только НОВЫЕ сообщения, не повторяем для старых / отредактированных).
      async ({ doc, previousDoc, req, operation }: any) => {
        try {
          if (operation !== 'update') return doc
          const newDoc: any = doc
          const prev: any = previousDoc

          const chatAfter: any[] = Array.isArray(newDoc.chat) ? newDoc.chat : []
          const chatBefore: any[] = Array.isArray(prev?.chat) ? prev.chat : []

          if (chatAfter.length === 0) return doc

          // Стабильный ключ дедупликации: id поддокумента массива
          // (Payload хранит id для каждой строки client_projects_chat),
          // либо composite-ключ как fallback, если id отсутствует.
          const keyOf = (m: any): string => {
            if (!m) return ''
            if (m.id) return `id:${m.id}`
            return `${m.author || ''}|${m.message || ''}|${m.sentAt || ''}`
          }
          const beforeKeys = new Set(
            chatBefore.map(keyOf).filter(Boolean),
          )

          // Новые сообщения от исполнителя (НЕ от клиента и НЕ системные).
          // author === 'client' — пишет клиент (не уведомляем его же).
          // author === 'system' — авто-сообщения (логи загрузки и т.п.),
          //   у них своя логика уведомлений; чат-reply шлём только исполнителю.
          const newExecutorMessages = chatAfter.filter((m) => {
            if (!m) return false
            if (!m.author || m.author === 'client' || m.author === 'system') return false
            if (!m.message || !String(m.message).trim()) return false
            const k = keyOf(m)
            return k ? !beforeKeys.has(k) : false
          })

          if (newExecutorMessages.length === 0) return doc

          // Email клиента: поле client = relationship → users (auth).
          // Может прийти как ID (строка/число) либо как populated-объект.
          const clientRef: any = newDoc.client
          let clientEmail: string | undefined
          if (clientRef && typeof clientRef === 'object' && clientRef.email) {
            clientEmail = clientRef.email
          } else if (clientRef) {
            try {
              const user: any = await req.payload.findByID({
                collection: 'users',
                id: String(clientRef),
                depth: 0,
              })
              clientEmail = user?.email
            } catch {
              clientEmail = undefined
            }
          }

          if (!clientEmail) {
            console.warn(
              '[client-projects chat] нет email клиента для уведомления, project:',
              newDoc.id,
            )
            return doc
          }

          // Fire-and-forget: не блокируем ответ админки.
          void (async () => {
            for (const msg of newExecutorMessages) {
              try {
                await sendClientChatReplyEmail({
                  payload: req.payload,
                  to: clientEmail as string,
                  message: String(msg.message || ''),
                  projectName: newDoc.coopName || '',
                })
                console.log(
                  `[client-projects chat] email клиенту ${clientEmail}: новое сообщение исполнителя`,
                )
              } catch (e) {
                console.error(
                  '[client-projects chat] ошибка отправки email клиенту:',
                  e,
                )
              }
            }
          })()
        } catch (e) {
          console.error('[client-projects afterChange chat notify] error:', e)
        }
        return doc
      },
    ],
  },
}
