import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

/** GET /api/blog-posts — список статей */
/** GET /api/blog-posts/[id] — одна статья */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  const { id } = await params
  const authHeader = req.headers.get('authorization')
  
  const url = id
    ? `${PAYLOAD_API}/api/blog-posts/${id}`
    : `${PAYLOAD_API}/api/blog-posts?limit=100&sort=-publishedAt`
  
  const res = await fetch(url, {
    headers: authHeader ? { Authorization: authHeader } : {},
  })
  
  const data = await res.json()
  return NextResponse.json(data)
}

/** PATCH /api/blog-posts/[id] — обновить статью */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  const { id } = await params
  const authHeader = req.headers.get('authorization')
  const body = await req.json()
  
  const res = await fetch(`${PAYLOAD_API}/api/blog-posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
  })
  
  const data = await res.json()
  return NextResponse.json(data)
}
