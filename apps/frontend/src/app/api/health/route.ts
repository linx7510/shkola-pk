import { NextResponse } from 'next/server'

type CheckStatus = 'ok' | string

export async function GET() {
  const start = Date.now()
  
  const checks: Record<string, CheckStatus> = {
    frontend: 'ok',
    payload: 'unknown',
    database: 'unknown',
  }

  // Проверка Payload CMS
  try {
    const payloadUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${payloadUrl}/api/access`, { signal: controller.signal })
    clearTimeout(timeout)
    checks.payload = res.ok ? 'ok' : `error_${res.status}`
  } catch (e) {
    checks.payload = 'unreachable'
  }

  // Проверка БД (через Payload — если Payload OK, значит и БД OK)
  checks.database = checks.payload === 'ok' ? 'ok' : 'unknown'

  // Время ответа
  const responseTime = `${Date.now() - start}ms`

  // HTTP 503 если что-то не работает
  const allOk = Object.values(checks).every(v => v === 'ok' || v === 'unknown')
  
  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks,
    responseTime,
  }, { status: allOk ? 200 : 503 })
}
