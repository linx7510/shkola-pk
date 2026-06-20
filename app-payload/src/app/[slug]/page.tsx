import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/BlockRenderer'
import Header from '@/components/Header'

const PAYLOAD_API = process.env.PAYLOAD_API_URL
               || process.env.NEXT_PUBLIC_PAYLOAD_URL
               || 'http://localhost:3001'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=2&limit=1`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.docs?.[0] ?? null
  } catch {
    return null
  }
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const page = await fetchPage(slug)

  if (!page) notFound()

  // Поддержка обоих полей: blocks (новое поле в Pages.ts) и layout (старое)
  const blocks = (page as any).blocks || (page as any).layout || []
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0

  return (
    <>
      <Header />
      <main style={{ paddingTop: '5rem', minHeight: '60vh' }}>
        {hasBlocks ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <section style={{ padding: '4rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ color: '#D6C6B2', marginBottom: '1rem' }}>
              {(page as any).title}
            </h1>
            <p style={{ color: 'rgba(214,198,178,0.3)', marginTop: '2rem', fontSize: '0.9rem' }}>
              Страница пока не наполнена. Добавьте блоки в панели управления.
            </p>
          </section>
        )}
      </main>
    </>
  )
}
