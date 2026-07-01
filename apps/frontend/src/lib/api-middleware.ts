import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface AuthUser {
  userId: string
  email: string
  name: string
  role: string
  collection?: string
}

function getPayloadSecret(): string {
  const s = process.env.PAYLOAD_SECRET
  if (!s) throw new Error('PAYLOAD_SECRET not set')
  return s
}

/**
 * Extract JWT token from request.
 * Priority: Authorization header (for API clients) → httpOnly cookie (for browsers).
 * Supports "JWT <token>" (Payload) and "Bearer <token>" (legacy) header formats.
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    if (authHeader.startsWith('JWT ')) return authHeader.substring(4)
    if (authHeader.startsWith('Bearer ')) return authHeader.substring(7)
  }

  // 2. Try x-auth-token header (forwarded by middleware/proxy)
  const proxyToken = request.headers.get('x-auth-token')
  if (proxyToken) return proxyToken

  // 3. Try httpOnly cookie (preferred for browsers — XSS-safe)
  const cookieToken = request.cookies.get('auth_token')?.value
  if (cookieToken) return cookieToken

  return null
}

/**
 * Extract user from Payload CMS JWT token
 */
export function getUserFromRequest(request: NextRequest): AuthUser | null {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log('[auth] No token found in request')
      return null
    }

    const decoded = jwt.verify(token, getPayloadSecret()) as any
    return {
      userId: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role || 'student',
      collection: decoded.collection,
    }
  } catch (e: any) {
    console.log('[auth] JWT verify error:', e.message, '| token:', getTokenFromRequest(request)?.slice(0, 30))
    return null
  }
}

/**
 * Require admin role from request
 */
export function requireAdmin(request: NextRequest): AuthUser | null {
  const user = getUserFromRequest(request)
  if (!user) return null
  if (user.role !== 'admin' && user.role !== 'editor' && user.role !== 'manager') return null
  return user
}

/**
 * Cookie attributes for the auth_token cookie.
 * Use this when setting/clearing the cookie in API responses.
 */
export const AUTH_COOKIE_NAME = 'auth_token'
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days, matches JWT expiry

export function buildAuthCookieHeader(token: string | null): string {
  const isProduction = process.env.NODE_ENV === 'production'
  if (token) {
    return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}`
  } else {
    // Clear cookie
    return `${AUTH_COOKIE_NAME}=; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=0`
  }
}
