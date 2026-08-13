import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'

// ─────────────────────────────────────────────────────────────────────
// После перевода аутентификации на frontend-JWT, Payload REST отклоняет
// эти токены при прямых вызовах. Поэтому читаем данные напрямую из БД
// (PostgreSQL) и маппим snake_case колонки → camelCase формат Payload,
// который ожидает ClientDashboard.
// ─────────────────────────────────────────────────────────────────────

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

// ── Маппинг snake_case (SQL) → camelCase (формат Payload REST) ──

function mapProjectRow(r: any): any {
  // templateSnapshot хранится как jsonb и уже содержит
  // { name, slug, totalXP, priceMin, priceMax }.
  const snapshot =
    r.template_snapshot ??
    (r.template_slug
      ? { name: r.template_name, slug: r.template_slug, totalXP: r.total_x_p }
      : null)

  return {
    id: r.id,
    client: r.client_id,
    coopName: r.coop_name,
    coopSlug: r.coop_slug,
    template: r.template_id ?? null,
    templateSnapshot: snapshot,
    contract: {
      number: r.contract_number ?? null,
      signedAt: r.contract_signed_at ?? null,
      amount: r.contract_amount !== null && r.contract_amount !== undefined ? Number(r.contract_amount) : 0,
      paymentStatus: r.contract_payment_status ?? null,
      paidAt: r.contract_paid_at ?? null,
      finalPaidAt: r.contract_final_paid_at ?? null,
      paymentSchedule: r.contract_payment_schedule ?? null,
    },
    stage: r.stage ?? 0,
    totalXP: r.total_x_p ?? 0,
    percent: r.percent ?? 0,
    consultationDate: r.consultation_date ?? null,
    consultationTime: r.consultation_time ?? null,
    createdAt: r.created_at ?? null,
    updatedAt: r.updated_at ?? null,
    // Массивы заполняются ниже из подтаблиц
    documents: [],
    achievements: [],
    chat: [],
    notifications: [],
    calendar: [],
  }
}

function mapDocRow(d: any): any {
  const hasFile = d.file_id !== null && d.file_id !== undefined
  return {
    id: d.id,
    code: d.code,
    name: d.name,
    stage: d.stage,
    stageName: d.stage_name,
    stageIcon: d.stage_icon,
    xp: d.xp,
    estimatedDays: d.estimated_days,
    description: d.description,
    status: d.status,
    readyAt: d.ready_at,
    approvedAt: d.approved_at,
    // ClientDashboard читает doc.file.url → возвращаем populated-объект
    file: hasFile
      ? { id: d.file_id, url: d.file_url ?? null, filename: d.file_filename ?? null }
      : null,
    comment: d.comment,
    clientComment: d.client_comment,
  }
}

function mapAchievementRow(a: any): any {
  return {
    id: a.id,
    code: a.code,
    name: a.name,
    icon: a.icon,
    description: a.description,
    xp: a.xp,
    unlockCondition: a.unlock_condition,
    unlockStage: a.unlock_stage,
    unlockXPThreshold: a.unlock_x_p_threshold,
    unlockDocCodes: a.unlock_doc_codes,
    unlocked: a.unlocked,
    unlockedAt: a.unlocked_at,
  }
}

function mapChatRow(c: any): any {
  return {
    id: c.id,
    author: c.author,
    message: c.message,
    sentAt: c.sent_at,
    attachedDocumentCode: c.attached_document_code,
  }
}

function mapNotificationRow(n: any): any {
  return {
    id: n.id,
    type: n.type,
    message: n.message,
    sentAt: n.sent_at,
    readAt: n.read_at,
    channel: n.channel,
  }
}

function mapCalendarRow(c: any): any {
  return {
    id: c.id,
    event: c.event,
    date: c.date,
    type: c.type,
    done: c.done,
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getVerifiedUser(req)
    if (!authUser) {
      return NextResponse.json({ docs: [], totalDocs: 0, error: 'Не авторизован' }, { status: 200 })
    }
    const userId = authUser.id
    const pg = getPool()

    // ── 1. Проекты клиента (с шаблоном услуги) ──
    const projectsRes = await pg.query(
      `SELECT cp.*, st.slug AS template_slug, st.name AS template_name
       FROM client_projects cp
       LEFT JOIN service_templates st ON cp.template_id = st.id
       WHERE cp.client_id = $1
       ORDER BY cp.created_at DESC`,
      [userId]
    )

    const docs: any[] = projectsRes.rows.map(mapProjectRow)
    const projectIds: number[] = projectsRes.rows.map((r: any) => r.id)

    // ── 2. Подтаблицы массивов (документы, бейджи, чат, уведомления, календарь) ──
    if (projectIds.length > 0) {
      const [docsRes, achRes, chatRes, notifRes, calRes] = await Promise.all([
        pg.query(
          `SELECT d.*, m.url AS file_url, m.filename AS file_filename
           FROM client_projects_documents d
           LEFT JOIN media m ON d.file_id = m.id
           WHERE d._parent_id = ANY($1::int[])
           ORDER BY d._parent_id, d._order`,
          [projectIds]
        ),
        pg.query(
          `SELECT * FROM client_projects_achievements
           WHERE _parent_id = ANY($1::int[])
           ORDER BY _parent_id, _order`,
          [projectIds]
        ),
        pg.query(
          `SELECT * FROM client_projects_chat
           WHERE _parent_id = ANY($1::int[])
           ORDER BY _parent_id, _order`,
          [projectIds]
        ),
        pg.query(
          `SELECT * FROM client_projects_notifications
           WHERE _parent_id = ANY($1::int[])
           ORDER BY _parent_id, _order`,
          [projectIds]
        ),
        pg.query(
          `SELECT * FROM client_projects_calendar
           WHERE _parent_id = ANY($1::int[])
           ORDER BY _parent_id, _order`,
          [projectIds]
        ),
      ])

      const byId = new Map<number, any>(docs.map((d: any) => [d.id, d]))
      for (const d of docsRes.rows) {
        const parent = byId.get(d._parent_id)
        if (parent) parent.documents.push(mapDocRow(d))
      }
      for (const a of achRes.rows) {
        const parent = byId.get(a._parent_id)
        if (parent) parent.achievements.push(mapAchievementRow(a))
      }
      for (const c of chatRes.rows) {
        const parent = byId.get(c._parent_id)
        if (parent) parent.chat.push(mapChatRow(c))
      }
      for (const n of notifRes.rows) {
        const parent = byId.get(n._parent_id)
        if (parent) parent.notifications.push(mapNotificationRow(n))
      }
      for (const c of calRes.rows) {
        const parent = byId.get(c._parent_id)
        if (parent) parent.calendar.push(mapCalendarRow(c))
      }
    }

    // ── 3. Синхронизация консультаций ──
    // (а) обновляем дату/время у существующих консультационных проектов,
    // (б) создаём проекты для бронирований без ClientProject.
    try {
      const userEmail = authUser.email || ''

      const bookingsRes = await pg.query(
        `SELECT id, client_name, service_type, date, time, status, amount
         FROM consultation_bookings
         WHERE (user_id = $1 OR client_email = $2) AND status NOT IN ('cancelled')
         ORDER BY date DESC`,
        [userId, userEmail]
      )

      if (bookingsRes.rows.length > 0) {
        // (а) Синхронизировать дату/время существующих консультационных проектов
        for (const doc of docs) {
          const slug = doc.templateSnapshot?.slug
          if (typeof slug === 'string' && slug.startsWith('consultation-')) {
            const booking = bookingsRes.rows.find((b: any) => b.service_type === slug)
            if (booking) {
              doc.consultationDate = booking.date
              doc.consultationTime = booking.time
              // Строковый stage нужен для корректного расчёта процента в ClientDashboard
              doc.stage = booking.status === 'completed' ? 'completed' : 'in_progress'
              try {
                await pg.query(
                  `UPDATE client_projects
                   SET consultation_date = $1, consultation_time = $2, updated_at = NOW()
                   WHERE id = $3`,
                  [booking.date, booking.time || null, doc.id]
                )
              } catch (e) {
                console.warn('[me] Failed to update consultation date/time:', e)
              }
            }
          }
        }

        // (б) Создать проекты для консультаций без ClientProject
        const existingSlugs = new Set(
          docs
            .map((d: any) => d.templateSnapshot?.slug || '')
            .filter((s: any) => typeof s === 'string' && s.startsWith('consultation-'))
        )

        for (const booking of bookingsRes.rows) {
          if (existingSlugs.has(booking.service_type)) continue
          const isPaid = booking.service_type === 'consultation-paid'
          const serviceName = isPaid
            ? 'Индивидуальная консультация (1 час)'
            : 'Бесплатная консультация (30 мин)'
          const amount = Number(booking.amount) || 0

          try {
            const insRes = await pg.query(
              `INSERT INTO client_projects (
                  client_id, coop_name, coop_slug, template_id, template_snapshot,
                  contract_number, contract_signed_at, contract_amount,
                  contract_payment_status, contract_payment_schedule,
                  stage, total_x_p, percent,
                  consultation_date, consultation_time,
                  created_at, updated_at
                ) VALUES ($1, $2, $3, NULL, $4, $5, NOW(), $6, $7, $8, 0, 0, 0, $9, $10, NOW(), NOW())
                RETURNING id`,
              [
                userId,
                serviceName,
                `consultation-${userId}-${booking.id}`,
                JSON.stringify({
                  name: serviceName,
                  slug: booking.service_type,
                  totalXP: 100,
                  priceMin: amount,
                  priceMax: amount,
                }),
                'КП-CONS-' + booking.id,
                amount,
                amount > 0 ? 'pending' : 'paid',
                '100_prepaid',
                booking.date,
                booking.time || null,
              ]
            )
            const newId = insRes.rows[0].id

            const newDoc: any = {
              id: newId,
              client: userId,
              coopName: serviceName,
              coopSlug: `consultation-${userId}-${booking.id}`,
              template: null,
              templateSnapshot: {
                name: serviceName,
                slug: booking.service_type,
                totalXP: 100,
                priceMin: amount,
                priceMax: amount,
              },
              contract: {
                number: 'КП-CONS-' + booking.id,
                signedAt: new Date().toISOString(),
                amount,
                paymentStatus: amount > 0 ? 'pending' : 'paid',
                paidAt: null,
                finalPaidAt: null,
                paymentSchedule: '100_prepaid',
              },
              stage: booking.status === 'completed' ? 'completed' : 'in_progress',
              totalXP: 100,
              percent: booking.status === 'completed' ? 100 : 50,
              consultationDate: booking.date,
              consultationTime: booking.time,
              createdAt: new Date(),
              updatedAt: new Date(),
              documents: [],
              achievements: [],
              chat: [],
              notifications: [],
              calendar: [],
            }
            docs.unshift(newDoc)
          } catch (e) {
            console.warn('[me] Failed to create project for booking:', e)
          }
          existingSlugs.add(booking.service_type)
        }
      }
    } catch (e) {
      console.warn('[me] Failed to sync consultation bookings:', e)
    }

    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (error) {
    console.error('[/api/client-projects/me] Error:', error)
    return NextResponse.json({ docs: [], totalDocs: 0, error: 'Внутренняя ошибка сервера' }, { status: 200 })
  }
}
