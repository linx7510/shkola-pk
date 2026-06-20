import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api-middleware'
import { createPayment } from '@/lib/payment'
import { sendEmail, enrollmentEmail } from '@/lib/email'

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
    const user = getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { courseId, amount, description } = body

    if (!courseId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Укажите courseId и сумму' }, { status: 400 })
    }

    // Check course exists via Payload API
    const courseData = await payloadApi(`/courses/${courseId}`)
    if (!courseData) {
      return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
    }

    // Check not already enrolled via Payload API
    const enrollments = await payloadApi(`/enrollments?where[user][equals]=${user.userId}&where[course][equals]=${courseId}&limit=1`)
    if (enrollments.docs?.length > 0) {
      return NextResponse.json({ error: 'Вы уже записаны на этот курс' }, { status: 400 })
    }

    // Create order via Payload API
    const orderData = await payloadApi('/orders', {
      method: 'POST',
      body: JSON.stringify({
        user: user.userId,
        course: courseId,
        amount,
        description: description || `Оплата курса: ${courseData.title}`,
        status: 'pending',
      }),
    })

    const orderId = orderData.doc.id

    // Create YooKassa payment
    try {
      const payment = await createPayment({
        amount,
        description: description || `Оплата курса: ${courseData.title}`,
        orderId,
        metadata: { userId: user.userId, courseId },
      })

      // Save payment ID via Payload API
      await payloadApi(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentId: payment.id }),
      })

      return NextResponse.json({
        orderId,
        paymentId: payment.id,
        confirmationUrl: payment.confirmationUrl,
      })
    } catch (paymentError: any) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
    }
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
