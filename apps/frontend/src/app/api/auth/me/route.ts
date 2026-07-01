import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization') || ''
    let token = ''
    if (authHeader.startsWith('JWT ')) token = authHeader.substring(4)
    else if (authHeader.startsWith('Bearer ')) token = authHeader.substring(7)
    
    // Also check x-auth-token header (forwarded by middleware)
    if (!token) {
      token = request.headers.get('x-auth-token') || ''
    }
    
    // Also check cookie
    if (!token) {
      token = request.cookies.get('auth_token')?.value || ''
    }
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify token via Payload API
    const res = await fetch(`${PAYLOAD_API_URL}/api/users/me`, {
      headers: { 'Authorization': `JWT ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await res.json()
    // Payload returns { user: { id, email, name, ... } }
    const u = data.user || data

    return NextResponse.json({
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar,
        bio: u.bio,
        isActive: u.isActive,
        createdAt: u.createdAt,
        enrollments: u.enrollments || [],
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
