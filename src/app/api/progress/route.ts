import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/progress?courseId=xxx — get progress for a course
// GET /api/progress — get all progress for the user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userId = Buffer.from(token.split(".")[0], "base64").toString();
    
    if (!userId) {
      return NextResponse.json({ error: "Невалидный токен" }, { status: 401 });
    }

    const courseId = request.nextUrl.searchParams.get("courseId");

    if (courseId) {
      // Get enrollment + lesson progress for specific course
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Вы не записаны на этот курс" }, { status: 404 });
      }

      const lessonProgress = await prisma.lessonProgress.findMany({
        where: { userId },
        include: { lesson: { include: { module: true } } },
      });

      const courseLessonIds = enrollment.course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id)
      );
      const completedIds = lessonProgress
        .filter((lp) => courseLessonIds.includes(lp.lessonId) && lp.completed)
        .map((lp) => lp.lessonId);

      const totalLessons = courseLessonIds.length;
      const completedLessons = completedIds.length;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return NextResponse.json({
        enrollment,
        lessonProgress: lessonProgress.filter((lp) =>
          courseLessonIds.includes(lp.lessonId)
        ),
        stats: {
          totalLessons,
          completedLessons,
          progressPercent,
        },
      });
    }

    // Get all enrollments with progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const allProgress = await prisma.lessonProgress.findMany({
      where: { userId },
    });

    const result = enrollments.map((enrollment) => {
      const courseLessonIds = enrollment.course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id)
      );
      const completedIds = allProgress
        .filter((lp) => courseLessonIds.includes(lp.lessonId) && lp.completed)
        .map((lp) => lp.lessonId);

      const totalLessons = courseLessonIds.length;
      const completedLessons = completedIds.length;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...enrollment,
        stats: { totalLessons, completedLessons, progressPercent },
      };
    });

    return NextResponse.json({ enrollments: result });
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/progress — mark lesson as completed
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userId = Buffer.from(token.split(".")[0], "base64").toString();

    if (!userId) {
      return NextResponse.json({ error: "Невалидный токен" }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, completed } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "Укажите lessonId" }, { status: 400 });
    }

    // Verify the lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: lesson.module.course.id },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Вы не записаны на этот курс" },
        { status: 403 }
      );
    }

    // Upsert progress
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completed: completed !== false,
        completedAt: completed !== false ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        completed: completed !== false,
        completedAt: completed !== false ? new Date() : null,
      },
    });

    // Recalculate course progress
    const course = await prisma.course.findUnique({
      where: { id: lesson.module.course.id },
      include: { modules: { include: { lessons: true } } },
    });

    if (course) {
      const totalLessons = course.modules.flatMap((m) => m.lessons).length;
      const allProgress = await prisma.lessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: course.modules.flatMap((m) => m.lessons.map((l) => l.id)) },
          completed: true,
        },
      });

      const progressPercent = Math.round((allProgress.length / totalLessons) * 100);

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { progress: progressPercent },
      });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
