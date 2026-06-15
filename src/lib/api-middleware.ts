import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from './auth';

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
}

export function forbidden(message = 'Доступ запрещён') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requireAdmin(request: NextRequest): JwtPayload | null {
  const user = getUserFromRequest(request);
  if (!user) return null;
  if (user.role !== 'ADMIN') return null;
  return user;
}
