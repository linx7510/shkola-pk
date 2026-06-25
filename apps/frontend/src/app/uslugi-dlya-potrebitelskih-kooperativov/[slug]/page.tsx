import { notFound } from "next/navigation"
import { BlockRenderer } from "@/components/BlockRenderer"
import Header from "@/components/Header"

const PAYLOAD_API = process.env.PAYLOAD_API_URL || "http://localhost:3001"

export const revalidate = 300

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

export default async function UslugiPodSlugPage({ params }: Props) {
  const { slug } = await params
  const fullSlug = `uslugi-dlya-potrebitelskih-kooperativov/${slug}`
  const page = await fetchPage(fullSlug)
  if (!page) notFound()

  const blocks = (page as any).blocks || (page as any).layout || []
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0
  const pageContent = (page as any).content
  const hasContent = typeof pageContent === "string" && pageContent.length > 0

  return (
    <>
      <Header />
      <main style={{ paddingTop: "5rem", minHeight: "60vh" }}>
        {hasBlocks ? (
          <BlockRenderer blocks={blocks} />
        ) : hasContent ? (
          <section style={{ padding: "4rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2", marginBottom: "1.5rem", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800 }}>
              {(page as any).title}
            </h1>
            <div className="article-content" style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.05rem" }} dangerouslySetInnerHTML={{ __html: pageContent }} />
          </section>
        ) : (
          <section style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2" }}>{(page as any).title}</h1>
          </section>
        )}
      </main>
    </>
  )
}
