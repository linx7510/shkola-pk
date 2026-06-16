import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const publishedOnly = searchParams.get('published') !== 'false';

    const where: any = {};
    if (publishedOnly) where.isPublished = true;
    if (category) where.category = category;

    const items = await prisma.faqItem.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { question, answer, category, order, isPublished } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const item = await prisma.faqItem.create({
      data: { question, answer, category, order: order || 0, isPublished: isPublished !== false },
    });

    await prisma.auditLog.create({
      data: { userId: admin.userId, action: 'CREATE', entity: 'FaqItem', entityId: item.id, details: question.substring(0, 80) },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
