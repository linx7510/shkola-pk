import { notFound } from "next/navigation"
import { BlockRenderer } from "@/components/BlockRenderer"
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KooperativPodKlyuchLanding from "@/components/KooperativPodKlyuchLanding"
import AuditUstavaLanding from "@/components/AuditUstavaLanding"
import Breadcrumbs from "@/components/Breadcrumbs"
import { breadcrumbJsonLd } from "@/components/Breadcrumbs"

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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await fetchPage(`uslugi-dlya-potrebitelskih-kooperativov/${slug}`)
  if (!page) return { title: "Страница не найдена" }
  
  // meta_title и meta_description есть в БД, но Payload API их не возвращает
  // (нет полей в схеме Pages). Используем title + кастомный description.
  const title = (page as any).title || "Школа ПК"
  const fullSlug = `uslugi-dlya-potrebitelskih-kooperativov/${slug}`
  const isCpp = slug === "celevie-potrebitelskie-programmy"
  const description = isCpp
    ? "Разработка целевых потребительских программ (ЦПП): защита от проверок ФНС, переквалификации и доначислений. 4 тарифа: от 5 000 до 65 000 ₽. Практика с 2015 года, 120+ кооперативов."
    : (page as any).meta?.description || "Услуга для потребительских кооперативов от Школы ПК"
  
  const BASE_URL = "https://велеслав.рус"
  const finalTitle = isCpp
    ? "Целевые потребительские программы (ЦПП) для ПК — разработка под проверку ФНС"
    : `${title} | велеслав.рус`
  // Тематическая og:image для ЦПП
  const ogImage = isCpp
    ? `${BASE_URL}/api/media/file/cpp-cover.webp`
    : `${BASE_URL}/images/og-preview.webp`

  return {
    title: { absolute: finalTitle },
    description,
    openGraph: {
      title: finalTitle,
      description,
      url: `${BASE_URL}/uslugi-dlya-potrebitelskih-kooperativov/${slug}`,
      type: "website",
      locale: "ru_RU",
      siteName: "Школа ПК — Велеслав Старков",
      images: [{ url: ogImage, width: 1200, height: 630, alt: finalTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: [{ url: ogImage, alt: finalTitle }],
      site: "@Veles_ST",
      creator: "@Veles_ST",
    },
    alternates: {
      canonical: `${BASE_URL}/uslugi-dlya-potrebitelskih-kooperativov/${slug}`,
    },
  }
}

export default async function UslugiPodSlugPage({ params }: Props) {
  const { slug } = await params
  const fullSlug = `uslugi-dlya-potrebitelskih-kooperativov/${slug}`
  const page = await fetchPage(fullSlug)
  if (!page) notFound()

  // Special landing page for kooperativ-pod-klyuch
  if (slug === "kooperativ-pod-klyuch") {
    // Article schema for kooperativ-pod-klyuch (SEO 2026)
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Кооператив под ключ — законная регистрация потребительского кооператива за 25 дней",
      "description": "16 Положений + 100+ рабочих документов. Устав редакции 27-5, Целевые программы. 0% НДС, 0% налог на прибыль. 120+ ПК создано с 2015 года. Ни один не ликвидирован ФНС.",
      "author": {
        "@type": "Person",
        "name": "Велеслав Старков",
        "jobTitle": "Председатель Правления Потребительского кооператива",
        "url": "https://велеслав.рус/about-us"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Школа ПК — Первая онлайн Школа Потребительской кооперации",
        "url": "https://велеслав.рус",
        "logo": {
          "@type": "ImageObject",
          "url": "https://велеслав.рус/images/og-preview.webp"
        }
      },
      "datePublished": "2026-01-15",
      "dateModified": "2026-06-26",
      "image": "https://велеслав.рус/images/og-preview.webp",
      "url": "https://велеслав.рус/uslugi-dlya-potrebitelskih-kooperativov/kooperativ-pod-klyuch",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://велеслав.рус/uslugi-dlya-potrebitelskih-kooperativov/kooperativ-pod-klyuch"
      }
    }
    
    return (
      <>
        <Header />
        <style>{`.uslugi-scope{max-width:1280px;margin:0 auto;width:100%}
.uslugi-scope img{max-width:350px;height:auto}
@media(max-width:1320px){.uslugi-scope{padding:0 1rem}}
`}</style>
        <div className="uslugi-scope">
        <KooperativPodKlyuchLanding />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      </>
    )
  }


  // Special landing page for audit-ustava
  if (slug === "audit-ustava-potrebitelskogo-kooperativa") {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Аудит устава потребительского кооператива — 60+ проверок, 0 рисков",
      "description": "Проверка Устава и Положений ПК по 60+ критериям. Отчёт с ошибками, рисками и готовыми формулировками. От 25 000 ₽, 5–7 дней. 120+ аудитов с 2015 года.",
      "author": {
        "@type": "Person",
        "name": "Велеслав Старков",
        "jobTitle": "Председатель Правления Потребительского кооператива",
        "url": "https://велеслав.рус/about-us"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Школа ПК — Первая онлайн Школа Потребительской кооперации",
        "url": "https://велеслав.рус",
        "logo": { "@type": "ImageObject", "url": "https://велеслав.рус/images/og-preview.webp" }
      },
      "datePublished": "2026-01-15",
      "dateModified": "2026-06-26",
      "image": "https://велеслав.рус/images/og-preview.webp",
      "url": "https://велеслав.рус/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa",
      "mainEntityOfPage": { "@type": "WebPage", "@id": "https://велеслав.рус/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa" }
    }
    return (
      <>
        <Header />
        <style>{`.uslugi-scope{max-width:1280px;margin:0 auto;width:100%}
.uslugi-scope img{max-width:350px;height:auto}
@media(max-width:1320px){.uslugi-scope{padding:0 1rem}}
`}</style>
        <div className="uslugi-scope">
        <AuditUstavaLanding />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      </>
    )
  }

  // Default rendering for other service pages
  const blocks = (page as any).blocks || (page as any).layout || []
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0
  const pageContent = (page as any).content
  const hasContent = typeof pageContent === "string" && pageContent.length > 0
  // headCode — JSON-LD микроразметка (Service schema и др.) для SEO
  const headCode = (page as any).headCode || ''

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК", href: "/uslugi-dlya-potrebitelskih-kooperativov" },
        { label: (page as any).title || "" }
      ]} />
      <main style={{ paddingTop: "0", minHeight: "60vh" }}>
        <style>{`.uslugi-scope{max-width:1280px;margin:0 auto;width:100%}
.uslugi-scope img{max-width:350px;height:auto}
.uslugi-scope .article-content img{max-width:350px;height:auto;border-radius:10px}
@media(max-width:1320px){.uslugi-scope{padding:0 1rem}}
`}</style>
        <div className="uslugi-scope">
        {hasBlocks ? (
          <BlockRenderer blocks={blocks} />
        ) : hasContent ? (
          <section style={{ padding: "0 1.5rem 4rem", maxWidth: 1280, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2", marginBottom: "1.5rem", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800 }}>
              {(page as any).title}
            </h1>
            <div className="article-content" style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.05rem" }} dangerouslySetInnerHTML={{ __html: pageContent }} />
          </section>
        ) : (
          <section style={{ padding: "0 1.5rem 4rem", maxWidth: 800, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2" }}>{(page as any).title}</h1>
          </section>
        )}
        </div>
            <Footer />
    </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК", href: "/uslugi-dlya-potrebitelskih-kooperativov" },
        { label: (page as any).title || "" }
      ], "https://велеслав.рус")) }} />
      {/* headCode — Service schema и другая микроразметка из Payload */}
      {headCode && <div dangerouslySetInnerHTML={{ __html: headCode }} />}
    </>
  )
}