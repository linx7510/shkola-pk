import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sk-pk-2026-veleslav-starkov-jwt-key-secure';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest): JwtPayload | null {
  const user = getUserFromRequest(request);
  return user;
}

export function requireAdmin(request: NextRequest): JwtPayload | null {
  const user = getUserFromRequest(request);
  if (!user) return null;
  if (user.role !== 'ADMIN') return null;
  return user;
}

export function createAuditLog(userId: string | null, action: string, entity: string, entityId?: string, details?: string, ip?: string) {
  // Import and create audit log - will be called from API routes
  return { userId, action, entity, entityId, details, ip };
}
