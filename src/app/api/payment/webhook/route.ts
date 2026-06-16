import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkPaymentStatus } from '@/lib/payment';
import { sendEmail, enrollmentEmail, paymentSuccessEmail } from '@/lib/email';

// POST /api/payment/webhook — YooKassa webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, object } = body;

    console.log(`💳 Webhook: ${event}, payment: ${object?.id}`);

    if (event === 'payment.succeeded' || event === 'payment.waiting_for_capture') {
      const paymentId = object?.id;
      if (!paymentId) {
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Find order by paymentId
      const order = await prisma.order.findUnique({
        where: { paymentId },
        include: { user: true, course: true },
      });

      if (!order) {
        console.error(`Order not found for payment: ${paymentId}`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Check payment status
      const status = await checkPaymentStatus(paymentId);

      if (status.paid || status.status === 'succeeded') {
        // Update order
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            yookassaStatus: status.status,
            paymentMethod: object?.payment_method?.type || 'unknown',
          },
        });

        // Create enrollment if not exists
        if (order.courseId) {
          const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: { userId: order.userId, courseId: order.courseId },
            },
          });

          if (!existingEnrollment) {
            await prisma.enrollment.create({
              data: {
                userId: order.userId,
                courseId: order.courseId,
                progress: 0,
              },
            });

            // Send enrollment email
            const emailData = enrollmentEmail(order.user.name, order.course!.title);
            await sendEmail({ to: order.user.email, ...emailData });
          }

          // Send payment success email
          const paymentEmail = paymentSuccessEmail(
            order.user.name,
            order.course!.title,
            order.amount
          );
          await sendEmail({ to: order.user.email, ...paymentEmail });
        }

        console.log(`✅ Payment completed: order ${order.id}`);
      }
    }

    if (event === 'payment.canceled') {
      const paymentId = object?.id;
      if (paymentId) {
        await prisma.order.updateMany({
          where: { paymentId },
          data: { status: 'FAILED', yookassaStatus: 'canceled' },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
