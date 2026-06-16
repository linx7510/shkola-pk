import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, unauthorized, forbidden } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return admin === null ? unauthorized() : forbidden();

  try {
    const [users, courses, enrollments, lessons, modules, orders] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.lesson.count(),
      prisma.module.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, icon: true } },
      },
    });

    const courseStats = await prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        icon: true,
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      stats: { users, courses, enrollments, lessons, modules, orders },
      recentUsers,
      recentEnrollments,
      courseStats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
