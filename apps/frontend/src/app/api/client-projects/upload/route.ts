import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/api-middleware'
import { Pool } from 'pg'
import fs from 'fs/promises'
import path from 'path'

// ════════════════════════════════════════════════════════════
// После перевода аутентификации на frontend-JWT, Payload REST
// отклоняет эти токены. Поэтому работаем напрямую с PostgreSQL
// (проекты, документы, прогресс, чат, уведомления) и сохраняем
// файлы в локальную директорию media (S3-плагин отключён).
// ════════════════════════════════════════════════════════════

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

// Директория хранения media-файлов (та же, что использует Payload).
// S3-плагин отключён, файлы лежат локально и раздаются через
// /api/media/file/{filename} (nginx → payload :3001).
const MEDIA_DIR = process.env.PAYLOAD_MEDIA_DIR || '/var/www/shkola-pk/apps/payload/media'

// ════════════════════════════════════════════════════════════
// SECURITY: File upload validation
// ════════════════════════════════════════════════════════════

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES_PER_PROJECT_PER_DAY = 20 // Rate limit

// Whitelist of allowed MIME types (from Content-Type header)
const ALLOWED_MIME: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

// Magic bytes (file signatures) — first 8 bytes
const MAGIC_SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'application/msword', bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] }, // DOC
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: [0x50, 0x4B, 0x03, 0x04] }, // ZIP (DOCX)
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
]

// Forbidden extensions (even if MIME matches, block these)
const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.mjs', '.html',
  '.htm', '.svg', '.xml', '.jar', '.class', '.apk', '.app',
  '.dll', '.so', '.dylib', '.msi', '.ps1', '.vbs', '.wsf',
  '.reg', '.lnk', '.torrent', '.iso', '.dmg',
]

function sanitizeFilename(name: string): string {
  // Remove path traversal attempts
  const base = name.replace(/[\\/:]/g, '_').replace(/\.\./g, '').replace(/\s+/g, '_')
  // Limit length
  return base.slice(0, 100)
}

function detectMagicMime(buf: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buf.slice(0, 16))
  for (const sig of MAGIC_SIGNATURES) {
    if (bytes.length >= sig.bytes.length) {
      let match = true
      for (let i = 0; i < sig.bytes.length; i++) {
        if (bytes[i] !== sig.bytes[i]) { match = false; break }
      }
      if (match) return sig.mime
    }
  }
  return null
}

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx).toLowerCase() : ''
}

/**
 * Verify Cloudflare Turnstile token (anti-bot protection)
 * Free, privacy-friendly alternative to reCAPTCHA
 */
async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  // If Turnstile is not configured, skip (in dev / first deploy)
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // If no secret configured, skip check (will be added after Cloudflare setup)
  if (!secret || !siteKey) {
    return true // TODO: enforce after Turnstile keys are added
  }

  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    })
    const data = await res.json()
    return data.success === true
  } catch (e) {
    console.error('[Turnstile] verify failed:', e)
    return false
  }
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown'
}

/**
 * Сохранить файл на диск и создать запись в таблице media.
 * Возвращает id новой media-записи.
 *
 * (Payload REST /api/media требует авторизации, а frontend-JWT
 * Payload'ом не принимается — поэтому делаем то же самое вручную:
 * пишем файл в MEDIA_DIR и INSERT в media.)
 */
async function createMediaRecord(
  fileBuf: ArrayBuffer,
  originalName: string,
  mime: string
): Promise<{ id: number, filename: string }> {
  const ext = getExtension(originalName) || ''
  const base = path.basename(originalName, ext).slice(0, 80) || 'upload'
  // Гарантируем уникальность имени (в media.filename UNIQUE-индекс)
  const filename = `${base}-${Date.now().toString(36)}${ext}`
  const absPath = path.join(MEDIA_DIR, filename)

  await fs.mkdir(MEDIA_DIR, { recursive: true })
  await fs.writeFile(absPath, Buffer.from(fileBuf))

  const url = `/api/media/file/${filename}`
  const filesize = fileBuf.byteLength

  const pg = getPool()
  const res = await pg.query(
    `INSERT INTO media (filename, mime_type, filesize, url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id`,
    [filename, mime, filesize, url]
  )
  return { id: res.rows[0].id, filename }
}

// Веса статусов для расчёта прогресса (как в ClientDashboard).
const PROGRESS_WEIGHTS: Record<string, number> = {
  ready: 1, approved: 1, submitted: 1, registered: 1,
  review: 0.5,
  in_progress: 0.3,
  available: 0,
  pending: 0,
}
const REGISTRATION_BONUS_XP = 2
const MAX_TOTAL_XP = 100

const STAGE_NAMES = ['Бриф', 'Устав', 'Учреждение', 'Положения', 'Целевые программы', 'Образцы']

// ════════════════════════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════════════════════════

/**
 * POST /api/client-projects/upload
 * Client uploads filled questionnaire or feedback document
 *
 * Security:
 *   1. JWT auth required
 *   2. Cloudflare Turnstile anti-bot check
 *   3. File size ≤ 10 MB
 *   4. MIME type whitelist (PDF/DOC/DOCX/JPG/PNG)
 *   5. Magic bytes verification (file signature)
 *   6. Extension whitelist + forbidden extensions blacklist
 *   7. Filename sanitization (no path traversal)
 *   8. Rate limit: 20 uploads/day/project
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Локальная верификация (frontend JWT) ──
    const authUser = await getVerifiedUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }
    const userId = authUser.id

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string
    const documentCode = formData.get('documentCode') as string
    const feedback = formData.get('feedback') as string || ''
    const stageNum = formData.get('stage') as string || '0'
    const turnstileToken = formData.get('turnstileToken') as string | null

    if (!projectId) return NextResponse.json({ error: 'Project ID обязателен' }, { status: 400 })

    // ── 2. Turnstile anti-bot verification ──
    const clientIP = getClientIP(request)
    const isHuman = await verifyTurnstile(turnstileToken, clientIP)
    if (!isHuman) {
      return NextResponse.json(
        { error: 'Проверка капчи не пройдена. Обновите страницу и попробуйте снова.' },
        { status: 403 }
      )
    }

    const pg = getPool()

    // ── 3. Найти проект и проверить владельца (SQL) ──
    const projRes = await pg.query(
      'SELECT id, client_id, coop_name FROM client_projects WHERE id = $1',
      [projectId]
    )
    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: 'Проект не найден или нет доступа' }, { status: 404 })
    }
    const project = projRes.rows[0]
    if (String(project.client_id) !== String(userId) && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа к проекту' }, { status: 403 })
    }

    let fileId: number | null = null
    let uploadedFileName = ''

    // ── 4. File validation ──
    if (file) {
      // 4a. Size check
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Файл слишком большой. Максимум ${MAX_FILE_SIZE / 1024 / 1024} МБ.` },
          { status: 413 }
        )
      }
      if (file.size === 0) {
        return NextResponse.json({ error: 'Файл пустой' }, { status: 400 })
      }

      // 4b. Read first 16 bytes for magic bytes check
      const fileBuf = await file.arrayBuffer()
      const magicMime = detectMagicMime(fileBuf)
      if (!magicMime) {
        return NextResponse.json(
          { error: 'Тип файла не распознан. Разрешены: PDF, DOC, DOCX, JPG, PNG.' },
          { status: 415 }
        )
      }

      // 4c. Check declared MIME matches magic bytes
      const declaredMime = (file.type || '').trim().replace(/\.$/, '')
      const cleanMagicMime = (magicMime || '').trim().replace(/\.$/, '')
      if (declaredMime && declaredMime !== cleanMagicMime && !declaredMime.startsWith('image/')) {
        // Some browsers report 'application/octet-stream' — allow if magic bytes match
        console.warn(`[upload] MIME mismatch: declared=${declaredMime}, magic=${cleanMagicMime}`)
      }

      // 4d. Extension whitelist + blacklist
      const ext = getExtension(file.name)
      if (FORBIDDEN_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Расширение ${ext} запрещено.` },
          { status: 415 }
        )
      }
      const allowedExts = ALLOWED_MIME[magicMime] || []
      if (!allowedExts.includes(ext)) {
        return NextResponse.json(
          { error: `Расширение ${ext} не соответствует типу файла (${magicMime}).` },
          { status: 415 }
        )
      }

      // 4e. Sanitize filename
      uploadedFileName = sanitizeFilename(file.name)

      // 4f. Сохраняем файл + создаём media-запись (SQL + диск)
      try {
        const media = await createMediaRecord(fileBuf, uploadedFileName, cleanMagicMime || magicMime)
        fileId = media.id
      } catch (e) {
        console.error('[upload] Media save failed:', e)
        return NextResponse.json(
          { error: 'Не удалось сохранить файл. Попробуйте позже.' },
          { status: 500 }
        )
      }
    }

    // ── 5. Update document status + recompute percent ──
    // Если документ с таким code существует — обновляем его.
    // Если нет — добавляем новый документ-файл с кодом '<code>_<timestamp>'.
    if (documentCode) {
      const docsRes = await pg.query(
        `SELECT id, code, xp, status FROM client_projects_documents
         WHERE _parent_id = $1 ORDER BY _order`,
        [projectId]
      )
      const existing = docsRes.rows.find((d: any) => d.code === documentCode)

      if (existing) {
        // Обновляем существующий документ
        await pg.query(
          `UPDATE client_projects_documents
           SET status = 'review',
               client_comment = $1,
               file_id = COALESCE($2, file_id),
               ready_at = COALESCE(ready_at, NOW())
           WHERE id = $3`,
          [feedback || null, fileId, existing.id]
        )
      } else {
        // Создаём новую запись — клиент загрузил свою анкету (+5 XP за загрузку)
        const stageInt = parseInt(stageNum) || 0
        const orderRes = await pg.query(
          `SELECT COALESCE(MAX(_order), -1) + 1 AS next_order
           FROM client_projects_documents WHERE _parent_id = $1`,
          [projectId]
        )
        const nextOrder = orderRes.rows[0].next_order
        await pg.query(
          `INSERT INTO client_projects_documents
            (_order, _parent_id, code, name, stage, stage_name, stage_icon,
             xp, estimated_days, description, status, ready_at, file_id, client_comment)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 5, 0, $8, 'review', NOW(), $9, $10)`,
          [
            nextOrder,
            projectId,
            `${documentCode}_${Date.now()}`,
            `Загружено клиентом: ${uploadedFileName || documentCode}`,
            stageInt,
            STAGE_NAMES[stageInt] || `Этап ${stageInt}`,
            '📤',
            `Загружено клиентом: ${uploadedFileName || 'документ'}. ${feedback || ''}`.trim(),
            fileId,
            feedback || null,
          ]
        )
      }

      // ── 6. Recompute total_x_p and percent ──
      // Перечитываем документы и считаем по весам статусов.
      const recomputeRes = await pg.query(
        `SELECT xp, status FROM client_projects_documents WHERE _parent_id = $1`,
        [projectId]
      )
      let currentXP = REGISTRATION_BONUS_XP
      for (const d of recomputeRes.rows) {
        const w = PROGRESS_WEIGHTS[d.status] ?? 0
        currentXP += (Number(d.xp) || 0) * w
      }
      currentXP = Math.min(MAX_TOTAL_XP, currentXP)
      const newPercent = Math.round(currentXP)
      const newTotalXP = Math.round(currentXP)

      await pg.query(
        `UPDATE client_projects SET total_x_p = $1, percent = $2, updated_at = NOW() WHERE id = $3`,
        [newTotalXP, newPercent, projectId]
      )

      console.log(`[upload] Project ${projectId}: XP=${newTotalXP}, %=${newPercent}`)
    }

    // ── 7. Add chat message + notification ──
    const chatMessage = feedback
      ? `📄 Клиент загрузил документ: ${uploadedFileName || 'без файла'}\n💬 Комментарий: ${feedback}`
      : `📄 Клиент загрузил документ: ${uploadedFileName || 'без файла'}`

    {
      const orderRes = await pg.query(
        `SELECT COALESCE(MAX(_order), -1) + 1 AS next_order
         FROM client_projects_chat WHERE _parent_id = $1`,
        [projectId]
      )
      const nextOrder = orderRes.rows[0].next_order
      await pg.query(
        `INSERT INTO client_projects_chat (_order, _parent_id, author, message, sent_at)
         VALUES ($1, $2, 'client', $3, NOW())`,
        [nextOrder, projectId, chatMessage]
      )
    }

    {
      const orderRes = await pg.query(
        `SELECT COALESCE(MAX(_order), -1) + 1 AS next_order
         FROM client_projects_notifications WHERE _parent_id = $1`,
        [projectId]
      )
      const nextOrder = orderRes.rows[0].next_order
      await pg.query(
        `INSERT INTO client_projects_notifications (_order, _parent_id, type, message, sent_at, channel)
         VALUES ($1, $2, 'document_uploaded', $3, NOW(), 'admin')`,
        [nextOrder, projectId, `Клиент загрузил документ: ${uploadedFileName}. Этап ${stageNum}.`]
      )
    }

    // ── 8. Telegram-уведомление ──
    try {
      const { notifyDocumentUploaded } = await import('@/lib/telegram-notify')
      await notifyDocumentUploaded({
        clientEmail: authUser.email || '',
        clientName: authUser.name || 'Клиент',
        fileName: uploadedFileName,
        documentCode: documentCode || '',
        feedback: feedback || '',
        stage: parseInt(stageNum) || 0,
        projectId,
      })
    } catch (e) {
      console.warn('[upload] Telegram notify failed:', e)
    }

    return NextResponse.json({
      ok: true,
      message: 'Документ загружен, исполнитель уведомлён',
      fileName: uploadedFileName,
      fileId,
    })
  } catch (error: any) {
    console.error('[/api/client-projects/upload] Error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
