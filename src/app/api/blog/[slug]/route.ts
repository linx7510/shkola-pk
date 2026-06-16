import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!post.isPublished) {
      const admin = requireAdmin(request);
      if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(post);
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
    const { title, excerpt, content, coverImage, category, tags, isPublished, metaTitle, metaDescription } = body;

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const wasPublished = existing.isPublished;
    const post = await prisma.blogPost.update({
      where: { slug },
      data: {
        title, excerpt, content, coverImage, category, tags,
        isPublished, metaTitle, metaDescription,
        publishedAt: !wasPublished && isPublished ? new Date() : existing.publishedAt,
      },
    });

    await prisma.auditLog.create({
      data: { userId: admin.userId, action: 'UPDATE', entity: 'BlogPost', entityId: post.id, details: title },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.blogPost.delete({ where: { slug } });

    await prisma.auditLog.create({
      data: { userId: admin.userId, action: 'DELETE', entity: 'BlogPost', entityId: post.id, details: post.title },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
