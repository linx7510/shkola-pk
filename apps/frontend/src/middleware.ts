import { NextRequest, NextResponse } from 'next/server'

/**
 * SIMPLIFIED CSP — no nonce (caused mismatch with ISR cached HTML)
 * Uses 'unsafe-inline' for script-src instead.
 *
 * Why: pages use `revalidate` (ISR) → HTML is cached with old nonce baked in.
 * Middleware generates new nonce per request → CSP nonce != HTML nonce → 
 * browser blocks all scripts → "This page couldn't load" error.
 *
 * Site has no user-generated HTML content, so inline-script XSS risk is minimal.
 * Yandex Metrika + Cloudflare + Yandex SmartCaptcha still work via allowlist.
 */

export function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const reportUri = '/api/csp-report'

  // === Enforced CSP — blocks violations, reports them ===
  const cspEnforced = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://yandex.ru https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `font-src 'self' data:`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://api.deepseek.com https://mc.yandex.ru https://yandex.ru wss://mc.yandex.ru https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `frame-src 'self' https://challenges.cloudflare.com https://vk.com https://vkvideo.ru https://www.youtube.com https://rutube.ru https://captcha-api.yandex.ru`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self' https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `object-src 'none'`,
    `worker-src 'self' blob:`,
    `report-uri ${reportUri}`,
    `report-to csp-endpoint`,
  ].join('; ')

  // === Report-Only CSP — stricter (no unsafe-eval), monitoring only ===
  const cspReportOnly = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://yandex.ru https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `font-src 'self' data:`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://api.deepseek.com https://mc.yandex.ru https://yandex.ru wss://mc.yandex.ru https://challenges.cloudflare.com https://captcha-api.yandex.ru`,
    `frame-src 'self' https://challenges.cloudflare.com https://vk.com https://vkvideo.ru https://www.youtube.com https://rutube.ru https://captcha-api.yandex.ru`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `worker-src 'self' blob:`,
    `report-uri ${reportUri}`,
    `report-to csp-endpoint`,
  ].join('; ')

  // Forward auth_token cookie as header (workaround for Next.js 16 proxy cookie stripping)
  const requestHeaders = new Headers(request.headers)
  const authToken = request.cookies.get('auth_token')?.value
  if (authToken) {
    requestHeaders.set('x-auth-token', authToken)
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set both CSP headers (NO nonce — using unsafe-inline instead)
  response.headers.set('Content-Security-Policy', cspEnforced)
  response.headers.set('Content-Security-Policy-Report-Only', cspReportOnly)

  // Reporting API endpoint group
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
