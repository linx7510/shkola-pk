import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorized } from '@/lib/api-middleware';
import { createPayment } from '@/lib/payment';
import { sendEmail, enrollmentEmail } from '@/lib/email';

// POST /api/payment/create — create payment order
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const { courseId, amount, description } = body;

    if (!courseId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Укажите courseId и сумму' }, { status: 400 });
    }

    // Check course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Курс не найден' }, { status: 404 });
    }

    // Check not already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Вы уже записаны на этот курс' }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        courseId,
        amount,
        description: description || `Оплата курса: ${course.title}`,
        status: 'PENDING',
      },
    });

    // Create payment
    try {
      const payment = await createPayment({
        amount,
        description: description || `Оплата курса: ${course.title}`,
        orderId: order.id,
        metadata: {
          userId: user.userId,
          courseId,
        },
      });

      // Save payment ID
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: payment.id },
      });

      return NextResponse.json({
        orderId: order.id,
        paymentId: payment.id,
        confirmationUrl: payment.confirmationUrl,
      });
    } catch (paymentError: any) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
