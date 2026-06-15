import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/enroll — enroll in a course
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
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Укажите courseId" }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return NextResponse.json({ enrollment: existing, message: "Вы уже записаны" });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, progress: 0 },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
