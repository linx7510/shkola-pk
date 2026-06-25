import { NextRequest, NextResponse } from 'next/server'
import { buildAuthCookieHeader } from '@/lib/api-middleware'

export async function POST(request: NextRequest) {
  // Clear the auth cookie
  return NextResponse.json(
    { success: true, message: 'Вы вышли из системы' },
    {
      status: 200,
      headers: {
        'Set-Cookie': buildAuthCookieHeader(null),
      }
    }
  )
}
