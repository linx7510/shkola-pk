import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/payment'
import { sendEmail, enrollmentEmail, paymentSuccessEmail } from '@/lib/email'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

async function payloadApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) throw new Error(`Payload API error: ${res.status}`)
  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, object } = body

    console.log(`Webhook: ${event}, payment: ${object?.id}`)

    if (event === 'payment.succeeded' || event === 'payment.waiting_for_capture') {
      const paymentId = object?.id
      if (!paymentId) {
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
      }

      // Find order by paymentId via Payload API
      const ordersData = await payloadApi(`/orders?where[paymentId][equals]=${paymentId}&limit=1&depth=1`)
      const order = ordersData.docs?.[0]

      if (!order) {
        console.error(`Order not found for payment: ${paymentId}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const status = await checkPaymentStatus(paymentId)

      if (status.paid || status.status === 'succeeded') {
        // Update order status via Payload API
        await payloadApi(`/orders/${order.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'paid',
            yookassaStatus: status.status,
            paymentMethod: object?.payment_method?.type || 'unknown',
          }),
        })

        // Create enrollment if not exists
        if (order.course) {
          const courseId = typeof order.course === 'object' ? order.course.id : order.course
          const userId = typeof order.user === 'object' ? order.user.id : order.user

          const existing = await payloadApi(`/enrollments?where[user][equals]=${userId}&where[course][equals]=${courseId}&limit=1`)
          if (existing.docs?.length === 0) {
            await payloadApi('/enrollments', {
              method: 'POST',
              body: JSON.stringify({ user: userId, course: courseId, progress: 0 }),
            })

            // Send enrollment email
            const courseData = await payloadApi(`/courses/${courseId}`)
            const userData = await payloadApi(`/users/${userId}`)
            if (userData?.email && courseData?.title) {
              sendEmail({ to: userData.email, ...enrollmentEmail(userData.name, courseData.title) }).catch(console.error)
            }
          }

          // Send payment success email
          const userData = await payloadApi(`/users/${typeof order.user === 'object' ? order.user.id : order.user}`)
          const courseData = await payloadApi(`/courses/${courseId}`)
          if (userData?.email && courseData?.title) {
            const paymentEmail = paymentSuccessEmail(userData.name, courseData.title, order.amount)
            sendEmail({ to: userData.email, ...paymentEmail }).catch(console.error)
          }
        }

        console.log(`Payment completed: order ${order.id}`)
      }
    }

    if (event === 'payment.canceled') {
      const paymentId = object?.id
      if (paymentId) {
        const ordersData = await payloadApi(`/orders?where[paymentId][equals]=${paymentId}&limit=1`)
        for (const order of ordersData.docs || []) {
          await payloadApi(`/orders/${order.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'cancelled', yookassaStatus: 'canceled' }),
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
