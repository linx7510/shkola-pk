import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api-middleware'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

async function payloadApi(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `JWT ${token}`
  const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })
  if (!res.ok) throw new Error(`Payload API error: ${res.status} ${await res.text()}`)
  return res.json()
}

function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  if (authHeader.startsWith('JWT ')) return authHeader.substring(4)
  if (authHeader.startsWith('Bearer ')) return authHeader.substring(7)
  return null
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = getToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const courseId = request.nextUrl.searchParams.get('courseId')

    if (courseId) {
      // Get specific course progress
      const enrollmentData = await payloadApi(
        `/enrollments?where[user][equals]=${authUser.userId}&where[course][equals]=${courseId}&depth=1&limit=1`,
        {}, token
      )
      const enrollment = enrollmentData.docs?.[0]

      if (!enrollment) {
        return NextResponse.json({ error: 'Вы не записаны на этот курс' }, { status: 404 })
      }

      // Get course with modules and lessons
      const course = await payloadApi(`/courses/${courseId}?depth=2`, {}, token)

      // Get lesson progress
      const progressData = await payloadApi(
        `/lesson-progress?where[user][equals]=${authUser.userId}&limit=100`,
        {}, token
      )

      // Calculate progress
      const courseLessons: any[] = []
      if (course.modules) {
        for (const mod of course.modules) {
          if (mod.lessons) {
            courseLessons.push(...mod.lessons)
          }
        }
      }

      const completedIds = new Set(
        (progressData.docs || [])
          .filter((p: any) => courseLessons.some((l: any) => l.id === (typeof p.lesson === 'object' ? p.lesson.id : p.lesson)) && p.completed)
          .map((p: any) => typeof p.lesson === 'object' ? p.lesson.id : p.lesson)
      )

      const totalLessons = courseLessons.length
      const completedLessons = completedIds.size
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      return NextResponse.json({
        enrollment,
        lessonProgress: progressData.docs || [],
        stats: { totalLessons, completedLessons, progressPercent },
      })
    }

    // Get all enrollments
    const enrollmentsData = await payloadApi(
      `/enrollments?where[user][equals]=${authUser.userId}&depth=1&limit=100`,
      {}, token
    )

    const allProgress = await payloadApi(
      `/lesson-progress?where[user][equals]=${authUser.userId}&limit=500`,
      {}, token
    )

    const result = (enrollmentsData.docs || []).map((enrollment: any) => {
      const courseId = typeof enrollment.course === 'object' ? enrollment.course.id : enrollment.course
      const courseLessons: string[] = []

      // We can't easily get nested modules/lessons without depth=2
      // For simplicity, return basic enrollment data
      return {
        ...enrollment,
        stats: {
          totalLessons: 0,
          completedLessons: 0,
          progressPercent: enrollment.progress || 0,
        },
      }
    })

    return NextResponse.json({ enrollments: result })
  } catch (error) {
    console.error('Progress GET error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const token = getToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, completed } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'Укажите lessonId' }, { status: 400 })
    }

    // Verify lesson exists
    const lesson = await payloadApi(`/lessons/${lessonId}?depth=2`, {}, token)
    if (!lesson) {
      return NextResponse.json({ error: 'Урок не найден' }, { status: 404 })
    }

    // Get module and course
    const moduleId = typeof lesson.module === 'object' ? lesson.module.id : lesson.module
    const moduleData = await payloadApi(`/modules/${moduleId}`, {}, token)
    const courseId = typeof moduleData.course === 'object' ? moduleData.course.id : moduleData.course

    // Check enrollment
    const enrollmentData = await payloadApi(
      `/enrollments?where[user][equals]=${authUser.userId}&where[course][equals]=${courseId}&limit=1`,
      {}, token
    )
    const enrollment = enrollmentData.docs?.[0]

    if (!enrollment) {
      return NextResponse.json({ error: 'Вы не записаны на этот курс' }, { status: 403 })
    }

    // Check if progress already exists
    const existingProgress = await payloadApi(
      `/lesson-progress?where[user][equals]=${authUser.userId}&where[lesson][equals]=${lessonId}&limit=1`,
      {}, token
    )

    const isCompleted = completed !== false
    const progressData = {
      user: authUser.userId,
      lesson: lessonId,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
    }

    let progress
    if (existingProgress.docs?.length > 0) {
      // Update existing
      progress = await payloadApi(`/lesson-progress/${existingProgress.docs[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify(progressData),
      }, token)
    } else {
      // Create new
      progress = await payloadApi('/lesson-progress', {
        method: 'POST',
        body: JSON.stringify(progressData),
      }, token)
    }

    // Recalculate course progress
    const courseData = await payloadApi(`/courses/${courseId}?depth=2`, {}, token)
    const courseLessons: any[] = []
    if (courseData.modules) {
      for (const mod of courseData.modules) {
        if (mod.lessons) courseLessons.push(...mod.lessons)
      }
    }

    const allProgress = await payloadApi(
      `/lesson-progress?where[user][equals]=${authUser.userId}&limit=500`,
      {}, token
    )

    const courseLessonIds = new Set(courseLessons.map((l: any) => l.id))
    const completedCount = (allProgress.docs || []).filter(
      (p: any) => courseLessonIds.has(typeof p.lesson === 'object' ? p.lesson.id : p.lesson) && p.completed
    ).length

    const progressPercent = courseLessons.length > 0
      ? Math.round((completedCount / courseLessons.length) * 100)
      : 0

    // Update enrollment progress
    await payloadApi(`/enrollments/${enrollment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ progress: progressPercent }),
    }, token)

    return NextResponse.json({ progress: progress.doc || progress })
  } catch (error) {
    console.error('Progress POST error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
