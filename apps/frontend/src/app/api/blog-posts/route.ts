import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_API = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

/** GET /api/blog-posts — список статей */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const url = new URL(req.url)
  const limit = url.searchParams.get('limit') || '100'
  const sort = url.searchParams.get('sort') || '-publishedAt'
  
  const res = await fetch(`${PAYLOAD_API}/api/blog-posts?limit=${limit}&sort=${sort}`, {
    headers: authHeader ? { Authorization: authHeader } : {},
  })
  
  const data = await res.json()
  return NextResponse.json(data)
}
