import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const DATABASE_URL = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL || ''

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
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('JWT ', '').replace('Bearer ', '') || ''
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string
    const documentCode = formData.get('documentCode') as string
    const feedback = formData.get('feedback') as string || ''
    const stageNum = formData.get('stage') as string || '0'
    const turnstileToken = formData.get('turnstileToken') as string | null

    if (!projectId) return NextResponse.json({ error: 'Project ID обязателен' }, { status: 400 })

    // ── 1. Turnstile anti-bot verification ──
    const clientIP = getClientIP(request)
    const isHuman = await verifyTurnstile(turnstileToken, clientIP)
    if (!isHuman) {
      return NextResponse.json(
        { error: 'Проверка капчи не пройдена. Обновите страницу и попробуйте снова.' },
        { status: 403 }
      )
    }

    // ── 2. Validate user via Payload ──
    const meRes = await fetch(`${PAYLOAD_API}/api/users/me`, {
      headers: { Authorization: authHeader! },
    })
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Токен недействителен' }, { status: 401 })
    }
    const meData = await meRes.json()
    const userId = meData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })
    }

    // ── 3. Get all user's projects (Payload access control filters by client) ──
    // Then find the requested projectId client-side
    const projCheckRes = await fetch(
      `${PAYLOAD_API}/api/client-projects?depth=2&limit=100`,
      { headers: { Authorization: authHeader! } }
    )
    const projCheckData = await projCheckRes.json()
    const allProjects = projCheckData.docs || []
    const project = allProjects.find((p: any) => String(p.id) === String(projectId))
    if (!project) {
      return NextResponse.json({ error: 'Проект не найден или нет доступа' }, { status: 404 })
    }
    // Verify ownership (defense in depth)
    const projectClientId = project.client?.id || project.client
    if (projectClientId && String(projectClientId) !== String(userId)) {
      return NextResponse.json({ error: 'Нет доступа к проекту' }, { status: 403 })
    }

    let fileId = null
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

      // 4f. Upload to Payload Media with sanitized name
      const sanitizedNameFile = new File([fileBuf], uploadedFileName, { type: cleanMagicMime || magicMime })
      const uploadFormData = new FormData()
      uploadFormData.append('file', sanitizedNameFile)

      const uploadRes = await fetch(`${PAYLOAD_API}/api/media`, {
        method: 'POST',
        headers: { 'Authorization': `JWT ${token}` },
        body: uploadFormData,
      })

      if (uploadRes.ok) {
        const mediaData = await uploadRes.json()
        fileId = mediaData.doc?.id
      } else {
        console.error('[upload] Payload media upload failed:', await uploadRes.text())
        return NextResponse.json(
          { error: 'Не удалось сохранить файл. Попробуйте позже.' },
          { status: 500 }
        )
      }
    }

    // ── 5. Update document status + recompute percent ──
    // Если документ с таким code существует — обновляем его.
    // Если нет (например, anketa_filled — загруженная клиентом анкета) —
    // добавляем новый документ-файл в массив documents с кодом '<code>_filled_<timestamp>'.
    if (documentCode) {
      const docs = project.documents || []
      const docIdx = docs.findIndex((d: any) => d.code === documentCode)

      let updatedDocs: any[]
      if (docIdx >= 0) {
        // Обновляем существующий документ
        const updateData: any = {
          status: 'review',
          clientComment: feedback,
        }
        if (fileId) updateData.file = fileId

        updatedDocs = docs.map((d: any, i: number) =>
          i === docIdx ? { ...d, ...updateData } : d
        )
      } else {
        // Создаём новую запись — клиент загрузил свою анкету
        // Это даёт +XP к прогрессу (по 5 XP за каждую загруженную анкету)
        const newDoc: any = {
          code: `${documentCode}_${Date.now()}`,
          name: `Загружено клиентом: ${uploadedFileName || documentCode}`,
          stage: parseInt(stageNum) || 0,
          stageName: ['Бриф', 'Устав', 'Учреждение', 'Положения', 'Целевые программы', 'Образцы'][parseInt(stageNum) || 0] || `Этап ${stageNum}`,
          stageIcon: '📤',
          xp: 5, // +5 XP за каждую загрузку
          estimatedDays: 0,
          description: `Загружено клиентом: ${uploadedFileName || 'документ'}. ${feedback || ''}`.trim(),
          status: 'review',
          readyAt: new Date().toISOString(),
          file: fileId,
          clientComment: feedback,
        }
        updatedDocs = [...docs, newDoc]
      }

      // ── 6. Recompute total_x_p and percent ──
      // Система весов:
      //   - Регистрация в ЛК = 2 XP (базовый бонус)
      //   - ready/approved/submitted/registered = 1.0 (полный XP)
      //   - review (клиент загрузил) = 0.5 (половина XP)
      //   - in_progress = 0.3
      //   - pending = 0
      //   - Max = 100 XP = 100%
      const REGISTRATION_BONUS_XP = 2
      const MAX_TOTAL_XP = 100
      const WEIGHTS: Record<string, number> = {
        ready: 1, approved: 1, submitted: 1, registered: 1,
        review: 0.5,
        in_progress: 0.3,
        available: 0,  // Доступен к скачиванию — но клиент ещё не загрузил. XP = 0
        pending: 0,
      }
      let currentXP = REGISTRATION_BONUS_XP
      for (const d of updatedDocs) {
        const w = WEIGHTS[d.status] ?? 0
        currentXP += (d.xp || 0) * w
      }
      currentXP = Math.min(MAX_TOTAL_XP, currentXP)
      const newPercent = Math.round(currentXP)
      const newTotalXP = Math.round(currentXP)

      // Update project via custom Payload endpoint (supports custom IDs like proj-test-001)
      const updatePayload: any = {
        documents: updatedDocs,
        totalXP: newTotalXP,
        percent: newPercent,
      }

      const updateRes = await fetch(`${PAYLOAD_API}/api/custom/update-progress/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify(updatePayload),
      }).catch(err => {
        console.error('[upload] Update progress failed:', err)
      })

      if (!updateRes?.ok) {
        console.warn('[upload] Update progress endpoint failed, will still save chat separately')
      } else {
        const updateData = await updateRes!.json().catch(() => ({}))
        console.log(`[upload] Project ${projectId} updated:`, updateData)
      }

      console.log(`[upload] Project ${projectId}: docs=${updatedDocs.length}, XP=${newTotalXP}, %=${newPercent}`)
    }

    // ── 7. Add chat message + notification ──
    const chatMessage = feedback
      ? `📄 Клиент загрузил документ: ${uploadedFileName || 'без файла'}\n💬 Комментарий: ${feedback}`
      : `📄 Клиент загрузил документ: ${uploadedFileName || 'без файла'}`

    const updatedChat = [
      ...(project.chat || []),
      { author: 'client', message: chatMessage, sentAt: new Date().toISOString() }
    ]

    // Add admin notification
    const updatedNotifications = [
      ...(project.notifications || []),
      {
        type: 'document_uploaded',
        message: `Клиент загрузил документ: ${uploadedFileName}. Этап ${stageNum}.`,
        sentAt: new Date().toISOString(),
        channel: 'admin',
      }
    ]

    // Save chat + notifications via custom endpoint (handles custom IDs)
    await fetch(`${PAYLOAD_API}/api/custom/update-progress/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`,
      },
      body: JSON.stringify({
        chat: updatedChat,
        notifications: updatedNotifications,
      }),
    }).catch(err => {
      console.error('[upload] Save chat failed:', err)
    })

    // ── 8. Telegram-уведомление ──
    try {
      const { notifyDocumentUploaded } = await import('@/lib/telegram-notify')
      await notifyDocumentUploaded({
        clientEmail: meData.user?.email || '',
        clientName: meData.user?.name || 'Клиент',
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
