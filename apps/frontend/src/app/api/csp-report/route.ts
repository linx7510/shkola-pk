import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * POST /api/csp-report
 *
 * Receives CSP violation reports from browsers.
 * Browser sends: { "csp-report": { "document-uri", "violated-directive", "blocked-uri", ... } }
 *
 * Logs to /var/log/shkola-csp/csp-reports.jsonl (one JSON per line)
 * Creates log dir if missing.
 *
 * Rate-limited in-memory (max 100 reports/min) to prevent log flooding.
 */
const LOG_DIR = '/var/log/shkola-csp'
const LOG_FILE = join(LOG_DIR, 'csp-reports.jsonl')

// Simple in-memory rate limiter
const reportCounts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000 // 1 min
const MAX_REPORTS_PER_IP = 100

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = reportCounts.get(ip)
  if (!entry || entry.resetAt < now) {
    reportCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_REPORTS_PER_IP
}

// Clean up old entries every 5 minutes
let lastCleanup = Date.now()
if (lastCleanup + 300_000 < Date.now()) {
  for (const [ip, entry] of reportCounts) {
    if (entry.resetAt < Date.now()) reportCounts.delete(ip)
  }
  lastCleanup = Date.now()
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-real-ip') ||
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               'unknown'

    // Rate limit per IP to prevent log flooding
    if (isRateLimited(ip)) {
      return new NextResponse(null, { status: 429 })
    }

    const body = await request.json()
    const report = body['csp-report']

    if (!report) {
      return new NextResponse(null, { status: 400 })
    }

    // Enrich with metadata
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent: (request.headers.get('user-agent') || '').slice(0, 300),
      // CSP report fields
      documentUri: report['document-uri'] || '',
      referrer: report['referrer'] || '',
      violatedDirective: report['violated-directive'] || '',
      effectiveDirective: report['effective-directive'] || '',
      originalPolicy: report['original-policy'] || '',
      blockedUri: report['blocked-uri'] || '',
      lineNumber: report['line-number'] || 0,
      columnNumber: report['column-number'] || 0,
      sourceFile: report['source-file'] || '',
      statusCode: report['status-code'] || 0,
      scriptSample: (report['script-sample'] || '').slice(0, 200),
    }

    // Ensure log dir exists
    try {
      if (!existsSync(LOG_DIR)) {
        mkdirSync(LOG_DIR, { recursive: true })
      }
      appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n', { flag: 'a' })
    } catch (e) {
      // If we can't write to /var/log (e.g. permission), fall back to console
      console.error('[CSP report] Failed to write log:', e)
      console.log('[CSP report]', JSON.stringify(logEntry))
    }

    // Log critical violations to console (PM2 will capture)
    if (logEntry.blockedUri && !logEntry.blockedUri.startsWith('https://mc.yandex.ru')) {
      console.warn(`[CSP] ${logEntry.violatedDirective} blocked: ${logEntry.blockedUri.slice(0, 100)} (from ${ip})`)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CSP report] Error:', error)
    return new NextResponse(null, { status: 500 })
  }
}

// GET — quick stats for monitoring
export async function GET() {
  try {
    if (!existsSync(LOG_FILE)) {
      return NextResponse.json({ total: 0, message: 'No reports yet' })
    }
    const { readFileSync, statSync } = await import('fs')
    const stats = statSync(LOG_FILE)
    const content = readFileSync(LOG_FILE, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)
    const reports = lines.map(l => {
      try { return JSON.parse(l) } catch { return null }
    }).filter(Boolean)

    // Group by violated-directive
    const byDirective: Record<string, number> = {}
    const byBlockedUri: Record<string, number> = {}
    for (const r of reports) {
      const d = r.violatedDirective || 'unknown'
      byDirective[d] = (byDirective[d] || 0) + 1
      const u = (r.blockedUri || 'unknown').slice(0, 80)
      byBlockedUri[u] = (byBlockedUri[u] || 0) + 1
    }

    return NextResponse.json({
      total: reports.length,
      logSizeBytes: stats.size,
      lastModified: stats.mtime,
      byDirective,
      byBlockedUri,
      recentSample: reports.slice(-5),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
