import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BlockRenderer } from '@/components/BlockRenderer'
import Header from '@/components/Header'
import CursorLight from '@/components/CursorLight'

const PAYLOAD_API = process.env.PAYLOAD_API_URL
               || process.env.NEXT_PUBLIC_PAYLOAD_URL
               || 'http://localhost:3001'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://2980738.ru'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=1&limit=1`,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await fetchPage(slug)
  if (!page) return { title: 'Страница не найдена' }

  const title = (page as any).meta?.title || (page as any).title || 'Школа ПК'
  const description = (page as any).meta?.description || ''
  const ogImage = (page as any).meta?.image?.url
    ? ((page as any).meta.image.url.startsWith('http')
        ? (page as any).meta.image.url
        : `${BASE_URL}${(page as any).meta.image.url}`)
    : `${BASE_URL}/images/og-preview.webp`

  return {
    title,
    description,
    keywords: 'потребительский кооператив, кооперация, онлайн-обучение, защита активов, налоговая оптимизация, Велеслав Старков, регистрация ПК, обнуление НДС',
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${slug}`,
      type: 'website',
      locale: 'ru_RU',
      siteName: 'Школа ПК — Велеслав Старков',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/${slug}`,
      languages: {
        'ru-RU': `${BASE_URL}/${slug}`,
        'ru': `${BASE_URL}/${slug}`,
        'x-default': `${BASE_URL}/${slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const page = await fetchPage(slug)

  if (!page) notFound()

  const blocks = (page as any).blocks || (page as any).layout || []
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0

  return (
    <>
      <Header />
      <CursorLight />
      <main style={{ paddingTop: '5rem', minHeight: '60vh' }}>
        {hasBlocks ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <section style={{ padding: '4rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ''} style={{ color: '#D6C6B2', marginBottom: '1rem' }}>
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

