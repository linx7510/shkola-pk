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

    const terms = await prisma.glossaryTerm.findMany({
      where,
      orderBy: [{ order: 'asc' }, { term: 'asc' }],
    });

    return NextResponse.json({ terms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { term, slug, definition, extendedContent, category, order, isPublished, metaTitle, metaDescription } = body;

    if (!term || !slug || !definition) {
      return NextResponse.json({ error: 'Term, slug and definition are required' }, { status: 400 });
    }

    const existing = await prisma.glossaryTerm.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

    const created = await prisma.glossaryTerm.create({
      data: { term, slug, definition, extendedContent, category, order: order || 0, isPublished: isPublished !== false, metaTitle, metaDescription },
    });

    await prisma.auditLog.create({
      data: { userId: admin.userId, action: 'CREATE', entity: 'GlossaryTerm', entityId: created.id, details: term },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
