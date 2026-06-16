import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { sendEmail, enrollmentEmail } from '@/lib/email';

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

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return NextResponse.json({ enrollment: existing, message: "Вы уже записаны" });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, progress: 0 },
    });

    // Send enrollment email
    const enrollUser = await prisma.user.findUnique({ where: { id: userId } });
    if (enrollUser) {
      sendEmail({ to: enrollUser.email, ...enrollmentEmail(enrollUser.name, course.title) }).catch(console.error);
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
