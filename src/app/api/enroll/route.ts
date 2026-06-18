import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api-middleware'
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
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Укажите courseId' }, { status: 400 })
    }

    // Check course exists
    const course = await payloadApi(`/courses/${courseId}`)
    if (!course) {
      return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
    }

    // Check not already enrolled
    const existing = await payloadApi(`/enrollments?where[user][equals]=${user.userId}&where[course][equals]=${courseId}&limit=1`)
    if (existing.docs?.length > 0) {
      return NextResponse.json({ enrollment: existing.docs[0], message: 'Вы уже записаны' })
    }

    // Create enrollment
    const enrollment = await payloadApi('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ user: user.userId, course: courseId, progress: 0 }),
    })

    // Send enrollment email
    sendEmail({ to: user.email, ...enrollmentEmail(user.name, course.title) }).catch(console.error)

    return NextResponse.json({ enrollment: enrollment.doc }, { status: 201 })
  } catch (error) {
    console.error('Enroll error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
