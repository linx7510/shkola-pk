import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/api-middleware';
import { sendEmail, enrollmentEmail, paymentSuccessEmail } from '@/lib/email';

// POST /api/payment/complete-test — complete test payment
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Укажите orderId' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, course: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (order.userId !== user.userId) {
      return NextResponse.json({ error: 'Это не ваш заказ' }, { status: 403 });
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Заказ уже оплачен' });
    }

    // Complete order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        paymentMethod: 'test',
        yookassaStatus: 'succeeded',
      },
    });

    // Create enrollment
    if (order.courseId) {
      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: { userId: order.userId, courseId: order.courseId, progress: 0 },
        });

        // Send emails
        const enrollmentData = enrollmentEmail(order.user.name, order.course!.title);
        sendEmail({ to: order.user.email, ...enrollmentData }).catch(console.error);

        const paymentData = paymentSuccessEmail(order.user.name, order.course!.title, order.amount);
        sendEmail({ to: order.user.email, ...paymentData }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test payment complete error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
