import type { Metadata } from 'next'

const PAYLOAD_API = process.env.PAYLOAD_API_URL
               || process.env.NEXT_PUBLIC_PAYLOAD_URL
               || 'http://localhost:3001'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(
      `${PAYLOAD_API}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=0&limit=1`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    const page = data.docs?.[0]
    if (!page) return { title: 'Страница не найдена' }

    const title = page.title || 'Школа ПК'
    const description = page.meta?.description || ''
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2980738.ru'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/${slug}`,
        type: 'website',
      },
      alternates: { canonical: `${baseUrl}/${slug}` },
    }
  } catch {
    return { title: 'Школа ПК' }
  }
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
