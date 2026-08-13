import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

// Pool для прямых SQL-запросов (custom IDs не работают через Payload API)
let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    })
  }
  return pool
}

interface ServiceTemplateInfo {
  id: string
  slug: string
  name: string
  service_type: string
  price_min: number
  price_max: number
  total_x_p: number
  estimated_duration_days: number
  payment_schedule: string
  short_description: string
  description: string
}

/**
 * POST /api/client-projects/order
 *
 * Создаёт новый проект клиента на основе выбранного шаблона услуги.
 * Используется в Личном кабинете при нажатии «Заказать услугу».
 *
 * Тело запроса:
 *   - serviceTemplateSlug: string (slug из service_templates)
 *   - coopName: string (название кооператива, например «Кооператив Игоря»)
 *
 * Возвращает:
 *   - { ok: true, projectId, contractNumber, amount }
 *
 * Безопасность:
 *   - JWT auth required
 *   - Один активный проект на пользователя (если уже есть — возвращает существующий)
 *   - Проверка что шаблон существует и активен
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getVerifiedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }
    const userId = authUser.id

    // 2. Парсим тело
    const body = await request.json()
    const { serviceTemplateSlug, coopName } = body

    if (!serviceTemplateSlug) {
      return NextResponse.json({ error: 'Не указан шаблон услуги (serviceTemplateSlug)' }, { status: 400 })
    }
    if (!coopName || coopName.length < 3) {
      return NextResponse.json({ error: 'Укажите название кооператива (минимум 3 символа)' }, { status: 400 })
    }

    const pg = getPool()

    // 3. Проверяем — не заказывал ли уже пользователь эту же услугу?
    // (разные услуги можно заказывать — каждый создаст отдельный проект)
    const existingRes = await pg.query(
      `SELECT cp.id, cp.coop_name, st.slug as template_slug
       FROM client_projects cp
       JOIN service_templates st ON st.id = cp.template_id
       WHERE cp.client_id = $1 AND st.slug = $2
       LIMIT 1`,
      [userId, serviceTemplateSlug]
    )
    if (existingRes.rows.length > 0) {
      return NextResponse.json({
        ok: false,
        error: `Вы уже заказывали эту услугу. Проект «${existingRes.rows[0].coop_name}» уже активен.`,
        existingProjectId: existingRes.rows[0].id,
      }, { status: 409 })
    }

    // 4. Получаем шаблон услуги
    const tplRes = await pg.query(
      `SELECT id, slug, name, service_type, price_min, price_max, total_x_p,
              estimated_duration_days, payment_schedule, short_description, description
       FROM service_templates
       WHERE slug = $1 AND is_active = true
       LIMIT 1`,
      [serviceTemplateSlug]
    )
    if (tplRes.rows.length === 0) {
      return NextResponse.json({
        error: `Услуга «${serviceTemplateSlug}» не найдена или неактивна`,
      }, { status: 404 })
    }
    const tpl: ServiceTemplateInfo = tplRes.rows[0]

    // 5. Генерируем номер договора (ID — auto-increment integer, БД назначит сама)
    const contractNumber = `КП-2026-${String(userId).padStart(3, '0')}-${(Date.now()).toString(36).slice(-4).toUpperCase()}`
    const amount = tpl.price_min

    // 6. Создаём проект (без указания ID — БД назначит integer auto-increment)
    const projectInsertRes = await pg.query(
      `INSERT INTO client_projects (
        client_id, coop_name, coop_slug, template_id,
        contract_number, contract_signed_at, contract_amount,
        contract_payment_status, contract_payment_schedule,
        stage, total_x_p, percent,
        template_snapshot, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'pending', $7, 0, 2, 2, $8, NOW(), NOW())
      RETURNING id`,
      [
        userId, coopName,
        `coop-${userId}-${Date.now().toString(36).slice(-4)}`,
        tpl.id,
        contractNumber,
        amount,
        tpl.payment_schedule,
        JSON.stringify({
          totalXP: tpl.total_x_p,
          name: tpl.name,
          slug: tpl.slug,
          snapshotDate: new Date().toISOString(),
        }),
      ]
    )
    const projectId = projectInsertRes.rows[0].id

    // 7. Создаём документы проекта — копируем из шаблона
    // Сначала получаем stages шаблона
    const stagesRes = await pg.query(
      `SELECT id, _order, num, name, icon
       FROM service_templates_stages
       WHERE _parent_id = $1
       ORDER BY _order`,
      [tpl.id]
    )

    let docOrder = 0
    for (const stage of stagesRes.rows) {
      // Получаем документы этапа из шаблона
      const docsRes = await pg.query(
        `SELECT _order, code, name, xp, estimated_days, description
         FROM service_templates_stages_documents
         WHERE _parent_id = $1
         ORDER BY _order`,
        [stage.id]
      )

      for (const docTpl of docsRes.rows) {
        // Для stage 0 (Бриф) — помечаем как available (доступны к скачиванию, но XP=0)
        // Для остальных — pending
        const status = stage.num === 0 ? 'available' : 'pending'
        const readyAt = stage.num === 0 ? new Date() : null

        try {
          await pg.query(
            `INSERT INTO client_projects_documents
              (_order, _parent_id, code, name, stage, stage_name, stage_icon,
               xp, estimated_days, description, status, ready_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              docOrder,
              projectId,
              String(docTpl.code || ''),
              String(docTpl.name || ''),
              Number(stage.num) || 0,
              String(stage.name || ''),
              String(stage.icon || '📋'),
              Number(docTpl.xp) || 0,
              docTpl.estimated_days !== null ? Number(docTpl.estimated_days) : null,
              String(docTpl.description || ''),
              status,
              readyAt,
            ]
          )
        } catch (docErr: any) {
          console.error(`[order] Failed to insert doc ${docTpl.code}:`, docErr.message)
          throw docErr
        }
        docOrder++
      }
    }

    // 8. Создаём достижения (7 бейджей) — общие для всех услуг
    const achievements = [
      { code: 'first_step', name: 'Первый шаг', icon: '🎯', desc: 'Регистрация в Личном кабинете', xp: 2, unlock_condition: 'manual' },
      { code: 'brief_done', name: 'Бриф завершён', icon: '📝', desc: 'Все анкеты загружены Исполнителю', xp: 5, unlock_condition: 'stage_done' },
      { code: 'ustav_approved', name: 'Устав согласован', icon: '📜', desc: 'Финальная версия Устава согласована', xp: 5, unlock_condition: 'docs_done' },
      { code: 'fns_submitted', name: 'Подано в ФНС', icon: '📤', desc: 'Заявление Р11001 подано в ФНС', xp: 3, unlock_condition: 'docs_done' },
      { code: 'registered', name: 'ПК зарегистрирован', icon: '⭐', desc: 'Кооператив зарегистрирован в ЕГРЮЛ', xp: 10, unlock_condition: 'docs_done' },
      { code: 'all_policies', name: 'Все положения готовы', icon: '⚖️', desc: 'Все внутренние положения разработаны', xp: 2, unlock_condition: 'stage_done' },
      { code: 'all_samples', name: 'Все образцы готовы', icon: '📋', desc: 'Все образцы документов разработаны', xp: 2, unlock_condition: 'stage_done' },
    ]

    for (let i = 0; i < achievements.length; i++) {
      const a = achievements[i]
      const unlocked = a.code === 'first_step' // первый бейдж открываем сразу
      await pg.query(
        `INSERT INTO client_projects_achievements
          (_order, _parent_id, code, name, icon, description, xp, unlock_condition, unlocked, unlocked_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          i, projectId,
          a.code, a.name, a.icon, a.desc, a.xp,
          a.unlock_condition,
          unlocked,
          unlocked ? new Date().toISOString() : null,
        ]
      )
    }

    // 9. Приветственное сообщение в чате
    await pg.query(
      `INSERT INTO client_projects_chat (_order, _parent_id, author, message, sent_at)
       VALUES (0, $1, 'system', $2, NOW())`,
      [
        projectId,
        `Добро пожаловать в Личный кабинет! Ваш проект «${coopName}» запущен.\n\nУслуга: ${tpl.name}\nСтоимость: ${new Intl.NumberFormat('ru-RU').format(amount)} ₽\nДоговор: №${contractNumber}\n\nПеред вами 4 документа: договор-оферта и 3 анкеты. Скачайте анкеты, заполните их и загрузите обратно — Исполнитель получит уведомление и приступит к работе.\n\nЗа регистрацию вы получили +2 XP. Поехали!`
      ]
    )

    // 10. Уведомление
    await pg.query(
      `INSERT INTO client_projects_notifications (_order, _parent_id, type, message, sent_at, channel)
       VALUES (0, $1, 'project_started', $2, NOW(), 'admin')`,
      [
        projectId,
        `Новый заказ от пользователя #${userId}: услуга «${tpl.name}» (${amount} ₽). Проект создан, ожидает предоплаты.`,
      ]
    )

    // 11. Календарь
    const calendarEvents = [
      { event: 'Заполнение анкет клиентом', date_offset: 3, type: 'deadline' },
      { event: 'Готовность проекта документов', date_offset: 8, type: 'deadline' },
      { event: 'Согласование документов', date_offset: 12, type: 'meeting' },
      { event: 'Подача в ФНС', date_offset: 18, type: 'submission' },
      { event: 'Регистрация в ЕГРЮЛ', date_offset: 25, type: 'registration' },
    ]
    for (let i = 0; i < calendarEvents.length; i++) {
      const e = calendarEvents[i]
      // Calculate date in JavaScript to avoid SQL INTERVAL parameter issues
      const eventDate = new Date(Date.now() + e.date_offset * 24 * 60 * 60 * 1000)
      await pg.query(
        `INSERT INTO client_projects_calendar (_order, _parent_id, event, date, type, done)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [i, projectId, e.event, eventDate, e.type]
      )
    }

    // 12. Telegram-уведомление
    try {
      const { notifyNewOrder } = await import('@/lib/telegram-notify')
      await notifyNewOrder({
        clientEmail: authUser.email || '',
        clientName: authUser.name || 'Клиент',
        serviceName: tpl.name,
        amount,
        contractNumber,
        projectId,
      })
    } catch (e) {
      console.warn('[order] Telegram notify failed:', e)
    }

    // 13. Return success
    return NextResponse.json({
      ok: true,
      projectId,
      contractNumber,
      amount,
      serviceName: tpl.name,
      message: `Проект «${coopName}» создан. Договор №${contractNumber}. Стоимость: ${new Intl.NumberFormat('ru-RU').format(amount)} ₽. Перед вами 4 документа для скачивания.`,
    })
  } catch (error: any) {
    console.error('[/api/client-projects/order] Error:', error)
    return NextResponse.json({ error: 'Ошибка сервера: ' + (error.message || '') }, { status: 500 })
  }
}

/**
 * GET /api/client-projects/order
 * Возвращает список доступных услуг (service_templates) для заказа.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getVerifiedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const pg = getPool()

    // Получаем все активные публичные шаблоны
    const res = await pg.query(
      `SELECT slug, name, service_type, price_min, price_max,
              short_description, description, estimated_duration_days,
              payment_schedule, total_x_p
       FROM service_templates
       WHERE is_active = true AND is_public = true
       ORDER BY sort_order, price_min`
    )

    const services = res.rows.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      serviceType: r.service_type,
      priceMin: r.price_min,
      priceMax: r.price_max,
      priceDisplay: r.price_min === r.price_max
        ? `${new Intl.NumberFormat('ru-RU').format(r.price_min)} ₽`
        : `${new Intl.NumberFormat('ru-RU').format(r.price_min)} – ${new Intl.NumberFormat('ru-RU').format(r.price_max)} ₽`,
      shortDescription: r.short_description,
      description: r.description,
      estimatedDurationDays: r.estimated_duration_days,
      paymentSchedule: r.payment_schedule,
      totalXP: r.total_x_p,
    }))

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error('[/api/client-projects/order GET] Error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
