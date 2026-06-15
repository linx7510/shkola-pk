import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, unauthorized, forbidden } from '@/lib/api-middleware';

// POST /api/admin/courses/[id]/modules — add module with lessons
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return admin === null ? unauthorized() : forbidden();

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, order, lessons } = body;

    if (!title) {
      return NextResponse.json({ error: 'Название модуля обязательно' }, { status: 400 });
    }

    const module_ = await prisma.module.create({
      data: {
        title,
        description,
        order: order || 0,
        courseId: id,
        lessons: lessons ? {
          create: lessons.map((l: any, i: number) => ({
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl,
            duration: l.duration || 0,
            order: l.order || i + 1,
            isFree: l.isFree || false,
          })),
        } : undefined,
      },
      include: { lessons: true },
    });

    return NextResponse.json({ module: module_ }, { status: 201 });
  } catch (error) {
    console.error('Admin module POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания модуля' }, { status: 500 });
  }
}
