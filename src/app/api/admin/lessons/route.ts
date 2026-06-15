import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, unauthorized, forbidden } from '@/lib/api-middleware';

// POST /api/admin/lessons — create lesson in a module
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return admin === null ? unauthorized() : forbidden();

  try {
    const body = await request.json();
    const { moduleId, title, content, videoUrl, duration, order, isFree } = body;

    if (!moduleId || !title) {
      return NextResponse.json({ error: 'moduleId и название обязательны' }, { status: 400 });
    }

    const moduleExists = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!moduleExists) {
      return NextResponse.json({ error: 'Модуль не найден' }, { status: 404 });
    }

    // Get the current max order in this module
    const maxOrder = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content: content || null,
        videoUrl: videoUrl || null,
        duration: duration || 0,
        order: order || (maxOrder ? maxOrder.order + 1 : 1),
        isFree: isFree || false,
        moduleId,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error('Admin lesson POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания урока' }, { status: 500 });
  }
}

// PUT /api/admin/lessons — update lesson
export async function PUT(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return admin === null ? unauthorized() : forbidden();

  try {
    const body = await request.json();
    const { lessonId, ...updates } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId обязателен' }, { status: 400 });
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updates,
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Admin lesson PUT error:', error);
    return NextResponse.json({ error: 'Ошибка обновления урока' }, { status: 500 });
  }
}

// DELETE /api/admin/lessons — delete lesson
export async function DELETE(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return admin === null ? unauthorized() : forbidden();

  try {
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId обязателен' }, { status: 400 });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin lesson DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка удаления урока' }, { status: 500 });
  }
}
