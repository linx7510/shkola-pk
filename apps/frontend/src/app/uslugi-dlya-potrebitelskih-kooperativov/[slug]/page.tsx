import { notFound } from "next/navigation"
import { BlockRenderer } from "@/components/BlockRenderer"
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KooperativPodKlyuchLanding from "@/components/KooperativPodKlyuchLanding"
import AuditUstavaLanding from "@/components/AuditUstavaLanding"
import Reveal from "@/components/Reveal"
import CursorLightLazy from "@/components/CursorLightLazy"
import BlogParticles from "@/components/BlogParticles"
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

// Черновики: скрыть от поисковиков до утверждения
const NOINDEX_SLUGS = new Set(['affilirovannoe-ooo-pod-klyuch']);

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await fetchPage(`uslugi-dlya-potrebitelskih-kooperativov/${slug}`)
  if (!page) return { title: "Страница не найдена" }
  
  // meta-поля объявлены в коллекции Pages (22.10.2026) и приходят из БД
  const title = (page as any).meta?.title || (page as any).title || "Школа ПК"
  const fullSlug = `uslugi-dlya-potrebitelskih-kooperativov/${slug}`
  const isCpp = slug === "celevie-potrebitelskie-programmy"
  const isBuh = slug === "buhgalterskoe-obsluzhivanie"
  const description = (page as any).meta?.description
    || (page as any).hero?.description
    || "Услуга для потребительских кооперативов от Школы ПК"
  
  const BASE_URL = "https://велеслав.рус"
  // title строкой — layout-шаблон добавит "| Школа ПК" (meta_title в БД без суффиксов)
  const finalTitle = title  // Тематическая og:image для ЦПП
  const ogImage = isCpp
    ? `${BASE_URL}/api/media/file/cpp-cover.webp`
    : `${BASE_URL}/images/og-preview.webp`

  if (NOINDEX_SLUGS.has(slug)) {
    return { title: finalTitle, description, robots: { index: false, follow: false } }
  }

  return {
    title: finalTitle,
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

  // Server-рендер Service + Offer для страниц услуг. Для kpk/audit дублирует клиентскую
  // вставку лендингов (useEffect невидим роботам) — серверная версия главная.
  const SERVICE_OFFERS: Record<string, { low: number; high: number; name: string }> = {
    "celevie-potrebitelskie-programmy": { low: 5000, high: 65000, name: "Разработка целевых потребительских программ" },
    "sozdanie-polnogo-komplekta-polozheniy": { low: 16000, high: 65000, name: "Комплект Положений для потребительского кооператива" },
    "sozdanie-sajta-dlya-kooperativov": { low: 50000, high: 390000, name: "Создание сайта для потребительского кооператива" },
    "kooperativ-pod-klyuch": { low: 90000, high: 125000, name: "Кооператив под ключ — регистрация потребительского кооператива" },
    "audit-ustava-potrebitelskogo-kooperativa": { low: 15000, high: 25000, name: "Аудит устава потребительского кооператива" },
  }
  const serviceOffer = SERVICE_OFFERS[slug]
  const serviceSchema = serviceOffer ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceOffer.name,
    serviceType: "Услуги для потребительских кооперативов",
    areaServed: "RU",
    provider: { "@type": "Organization", name: "Школа потребительской кооперации", url: "https://велеслав.рус" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: serviceOffer.low,
      highPrice: serviceOffer.high,
      availability: "https://schema.org/InStock",
      url: `https://велеслав.рус/uslugi-dlya-potrebitelskih-kooperativov/${slug}`,
    },
  } : null


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
        <BlogParticles />
        <CursorLightLazy />
        <style>{`.uslugi-scope{max-width:1280px;margin:0 auto;width:100%}
.uslugi-scope img{max-width:350px;height:auto}
@media(max-width:1320px){.uslugi-scope{padding:0 1rem}}
`}</style>
        <div className="uslugi-scope">
        <KooperativPodKlyuchLanding />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК", href: "/uslugi-dlya-potrebitelskih-kooperativov" },
        { label: (page as any).title || "" }
      ], "https://велеслав.рус")) }} />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />}
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
        <BlogParticles />
        <CursorLightLazy />
        <style>{`.uslugi-scope{max-width:1280px;margin:0 auto;width:100%}
.uslugi-scope img{max-width:350px;height:auto}
@media(max-width:1320px){.uslugi-scope{padding:0 1rem}}
`}</style>
        <div className="uslugi-scope">
        <AuditUstavaLanding />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК", href: "/uslugi-dlya-potrebitelskih-kooperativov" },
        { label: (page as any).title || "" }
      ], "https://велеслав.рус")) }} />
        </div>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />}
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
        <BlogParticles />
        <CursorLightLazy />
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
            <Reveal>
              <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2", marginBottom: "1.5rem", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800 }}>
                {(page as any).title}
              </h1>
            </Reveal>
            <Reveal delay={1}>
              <div className="article-content" style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.05rem" }} dangerouslySetInnerHTML={{ __html: pageContent }} />
            </Reveal>
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
      {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />}
    </>
  )
}