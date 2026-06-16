import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const term = await prisma.glossaryTerm.findUnique({ where: { slug } });
    if (!term) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!term.isPublished) {
      const admin = requireAdmin(request);
      if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(term);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const body = await request.json();

    const existing = await prisma.glossaryTerm.findUnique({ where: { slug } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.glossaryTerm.update({ where: { slug }, data: body });

    await prisma.auditLog.create({
      data: { userId: admin.userId, action: 'UPDATE', entity: 'GlossaryTerm', entityId: updated.id, details: body.term || existing.term },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const term = await prisma.glossaryTerm.findUnique({ where: { slug } });
    if (!term) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.glossaryTerm.delete({ where: { slug } });

    await prisma.auditLog.create({
      data: { userId: admin.userId, action: 'DELETE', entity: 'GlossaryTerm', entityId: term.id, details: term.term },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
