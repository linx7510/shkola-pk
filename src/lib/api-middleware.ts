import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
}

