import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-middleware';

// GET /api/admin/courses — all courses (including unpublished)
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: 'asc' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Admin courses GET error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST /api/admin/courses — create course
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, shortDesc, icon, image, order, isPublished, modules } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Название и описание обязательны' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        shortDesc,
        icon,
        image,
        order: order || 0,
        isPublished: isPublished || false,
        modules: modules ? {
          create: modules.map((m: any, mi: number) => ({
            title: m.title,
            description: m.description,
            order: m.order || mi + 1,
            lessons: m.lessons ? {
              create: m.lessons.map((l: any, li: number) => ({
                title: l.title,
                content: l.content,
                videoUrl: l.videoUrl,
                duration: l.duration || 0,
                order: l.order || li + 1,
                isFree: l.isFree || false,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        modules: { include: { lessons: true }, orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Admin courses POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания курса' }, { status: 500 });
  }
}
