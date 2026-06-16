import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, source } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    let userId: string | null = null;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) userId = user.id;

    const authUser = (() => {
      try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return null;
        const jwt = require('jsonwebtoken');
        return jwt.verify(authHeader.substring(7), process.env.JWT_SECRET || 'sk-pk-2026-veleslav-starkov-jwt-key-secure') as any;
      } catch { return null; }
    })();
    if (authUser) userId = authUser.userId;

    const lead = await prisma.lead.create({
      data: { name, email, phone, message, source: source || 'contact-form', userId },
    });

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
