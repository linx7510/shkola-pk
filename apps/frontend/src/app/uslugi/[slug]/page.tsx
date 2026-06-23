import { notFound } from "next/navigation"
import { BlockRenderer } from "@/components/BlockRenderer"
import Header from "@/components/Header"

const PAYLOAD_API = process.env.PAYLOAD_API_URL || "http://localhost:3001"

export const revalidate = 300 // ISR: revalidate every 5 minutes

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=2&limit=1`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.docs?.[0] ?? null
  } catch { return null }
}

interface Props { params: Promise<{ slug: string }> }

export default async function UslugiSlugPage({ params }: Props) {
  const { slug } = await params
  // Construct full slug: uslugi/audit-ustava-pk
  const fullSlug = `uslugi/${slug}`
  const page = await fetchPage(fullSlug)
  if (!page) notFound()

  const blocks = (page as any).blocks || (page as any).layout || []
  return (
    <>
      <Header />
      <main style={{ paddingTop: "5rem", minHeight: "60vh" }}>
        {Array.isArray(blocks) && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <section style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ''} style={{ color: "#D6C6B2" }}>{(page as any).title}</h1>
          </section>
        )}
        {/* AI-консультант — точная копия блока с главной страницы */}
      </main>
    </>
  )
}
