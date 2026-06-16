import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, getUserFromRequest } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, source, courseSlug } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Try to link to existing user
    let userId: string | null = null;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) userId = user.id;

    // Also check if user is logged in
    const authUser = getUserFromRequest(request);
    if (authUser) userId = authUser.userId;

    const lead = await prisma.lead.create({
      data: { name, email, phone, message, source, courseSlug, userId },
    });

    await prisma.auditLog.create({
      data: { userId, action: 'LEAD_CREATED', entity: 'Lead', entityId: lead.id, details: `${name} <${email}>` },
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
