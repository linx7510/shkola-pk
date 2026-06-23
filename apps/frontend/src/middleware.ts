import { NextRequest, NextResponse } from 'next/server'

/**
 * Generate CSP nonce per request and set CSP header.
 *
 * Two CSP headers are set:
 * 1. Content-Security-Policy — enforced (blocks violations)
 *    - nonce-based (no unsafe-inline needed)
 *    - unsafe-eval kept ONLY for Yandex Metrika
 *    - report-uri /api/csp-report (collect violations)
 *
 * 2. Content-Security-Policy-Report-Only — monitoring only (does NOT block)
 *    - stricter version WITHOUT unsafe-eval
 *    - this tells us what would break if we removed unsafe-eval
 *    - reports also go to /api/csp-report
 *
 * Reference: https://nextjs.org/docs/app/guides/content-security-policy
 */

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i]
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0
    result += chars[b1 >> 2]
    result += chars[((b1 & 0x03) << 4) | (b2 >> 4)]
    result += i + 1 < bytes.length ? chars[((b2 & 0x0f) << 2) | (b3 >> 6)] : '='
    result += i + 2 < bytes.length ? chars[b3 & 0x3f] : '='
  }
  return result
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce()
  const reportUri = '/api/csp-report'

  // === 1. Enforced CSP — blocks violations, reports them ===
  const cspEnforced = [
    `default-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://yandex.ru`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' data:`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://api.deepseek.com https://mc.yandex.ru https://yandex.ru wss://mc.yandex.ru`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `worker-src 'self' blob:`,
    `report-uri ${reportUri}`,
    `report-to csp-endpoint`,
  ].join('; ')

  // === 2. Report-Only CSP — stricter, monitoring only ===
  // Same as enforced BUT without unsafe-eval
  // This tells us what would break if we removed unsafe-eval entirely
  const cspReportOnly = [
    `default-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://mc.yandex.ru https://yandex.ru`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' data:`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://api.deepseek.com https://mc.yandex.ru https://yandex.ru wss://mc.yandex.ru`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `worker-src 'self' blob:`,
    `report-uri ${reportUri}`,
    `report-to csp-endpoint`,
  ].join('; ')

  // Clone request headers and add nonce
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspEnforced)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set both CSP headers
  response.headers.set('Content-Security-Policy', cspEnforced)
  response.headers.set('Content-Security-Policy-Report-Only', cspReportOnly)

  // Reporting API endpoint group (modern browsers)
  response.headers.set('Report-To', JSON.stringify([
    {
      group: 'csp-endpoint',
      max_age: 3600,
      endpoints: [{ url: reportUri }],
    },
  ]))

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|fonts/|media/|api/csp-report).*)',
  ],
}
