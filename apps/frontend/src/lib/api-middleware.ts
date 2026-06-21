import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'sk-pk-2026-payload-secret-key-secure'

interface AuthUser {
  userId: string
  email: string
  name: string
  role: string
  collection?: string
}

/**
 * Extract user from Payload CMS JWT token
 * Payload uses "JWT <token>" format in Authorization header
 */
export function getUserFromRequest(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    // Support both "JWT <token>" (Payload) and "Bearer <token>" (legacy)
    let token: string | null = null
    if (authHeader.startsWith('JWT ')) {
      token = authHeader.substring(4)
    } else if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    if (!token) return null

    const decoded = jwt.verify(token, PAYLOAD_SECRET) as any
    return {
      userId: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role || 'student',
      collection: decoded.collection,
    }
  } catch {
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
