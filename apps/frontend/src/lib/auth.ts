/**
 * Auth utilities for Payload CMS integration
 * Payload CMS handles password hashing and JWT signing
 */
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'sk-pk-2026-payload-secret-key-secure'

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}
