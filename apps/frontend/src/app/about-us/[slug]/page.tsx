import { notFound } from "next/navigation"
import { Metadata } from "next"
import { BlockRenderer } from "@/components/BlockRenderer"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumbs from "@/components/Breadcrumbs"
import { breadcrumbJsonLd } from "@/components/Breadcrumbs"

const PAYLOAD_API = process.env.PAYLOAD_API_URL || "http://localhost:3001"
const BASE_URL = "https://велеслав.рус"
const SECTION = "about-us"

export const dynamic = "force-dynamic"

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API}/api/pages?where%5Bslug%5D%5Bequals%5D=${encodeURIComponent(slug)}&where%5BisPublished%5D%5Bequals%5D=true&depth=2&limit=1`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.docs?.[0] ?? null
  } catch { return null }
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const fullSlug = `${SECTION}/${slug}`
  const page = await fetchPage(fullSlug)
  if (!page) return { title: "Страница не найдена" }

  // SEO: под страницу мероприятий — целевые ключи «встречи кооператоров», «вопрос — ответ по кооперации»
  const isEvents = slug === "meropriyatiya"
  const title = isEvents
    ? "Наши мероприятия — встречи кооператоров и бизнес-сессии | велеслав.рус"
    : `${(page as any).title} | велеслав.рус`
  const description = isEvents
    ? "Встречи с кооператорами по всей России: деловые завтраки, бизнес-сессии и «вопрос — ответ» по потребительской кооперации. Ответим лично на ваши вопросы. Ближайшая встреча — Москва, 12 октября 2026."
    : ((page as any).meta?.description
      || "Деловые завтраки и бизнес-сессии Школы ПК в городах России: модель С500, обнуление НДС, целевые потребительские программы, живые ответы на вопросы. Ближайшая встреча — Москва, 12 октября 2026.")

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${BASE_URL}/${fullSlug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${fullSlug}`,
      type: "website",
      locale: "ru_RU",
      siteName: "Школа ПК — Велеслав Старков",
      images: [{ url: `${BASE_URL}/images/og-preview.webp`, width: 1200, height: 630, alt: title }],
    },
  }
}

export default async function AboutSubPage({ params }: Props) {
  const { slug } = await params
  const fullSlug = `${SECTION}/${slug}`
  const page = await fetchPage(fullSlug)
  if (!page) notFound()
  const isEvents = slug === "meropriyatiya"

  const blocks = (page as any).blocks || (page as any).layout || []
  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "О нас", href: "/about-us" },
    { label: (page as any).title || "" },
  ]

  // SEO: микроразметка мероприятия и FAQ (страница «Наши мероприятия»)
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Личные встречи с Велеславом Старковым — Москва, 12–13 октября",
    startDate: "2026-10-12",
    endDate: "2026-10-13",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: "Два дня личных встреч в Москве: индивидуальные и групповые консультации, деловые завтраки, встречи в вашем офисе, мозговые штурмы. Концепция и роли, управление, налоги и обнуление исходящего НДС, вертикальная интеграция, группа компаний. Ответим лично на ваши вопросы по кооперации.",
    image: `${BASE_URL}/images/og-preview.webp`,
    url: `${BASE_URL}/${fullSlug}`,
    location: {
      "@type": "Place",
      name: "Москва (адрес — при записи)",
      address: { "@type": "PostalAddress", addressLocality: "Москва", addressCountry: "RU" },
    },
    organizer: {
      "@type": "Organization",
      name: "Школа ПК — Первая онлайн Школа Потребительской Кооперации",
      url: BASE_URL,
    },
  }
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Кто может прийти на встречу кооператоров?",
        acceptedAnswer: { "@type": "Answer", text: "Руководители и пайщики потребительских кооперативов, предприниматели и производители, а также те, кто только планирует создать кооператив и хочет разобраться в модели лично." },
      },
      {
        "@type": "Question",
        name: "Нужно ли записываться на мероприятие заранее?",
        acceptedAnswer: { "@type": "Answer", text: "Да: количество мест ограничено размером зала. Напишите на boss@2980738.ru или позвоните по номеру 8 902 472-07-38 — подтвердим участие и пришлём адрес и время." },
      },
      {
        "@type": "Question",
        name: "Можно ли привести партнёра или компаньона?",
        acceptedAnswer: { "@type": "Answer", text: "Можно — и даже нужно: решения по кооперативу лучше принимать вместе. Укажите количество участников при записи, чтобы мы зарезервировали места." },
      },
      {
        "@type": "Question",
        name: "Я в другом городе — как попасть на мероприятие?",
        acceptedAnswer: { "@type": "Answer", text: "Напишите свой город: если соберётся группа от 5 человек, организуем встречу у вас. А пока подключайтесь к онлайн-форматам — знания те же, формат дистанционный." },
      },
      {
        "@type": "Question",
        name: "Можно ли задать свои вопросы по кооперации?",
        acceptedAnswer: { "@type": "Answer", text: "Да, каждая встреча заканчивается сессией «вопрос — ответ»: отвечаем лично на ваши вопросы по кооперации — от налогов и устава до построения целевых потребительских программ." },
      },
    ],
  }

  return (
    <>
      <Header />
      <Breadcrumbs items={crumbs} />
      <main style={{ paddingTop: 0, minHeight: "60vh" }}>
        {isEvents && (
          <section style={{ textAlign: "center", padding: "1.6rem 1rem 0.6rem" }}>
            <div style={{
              fontSize: "clamp(2.4rem, 6.5vw, 4.6rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#E68863",
              textShadow: "0 0 46px rgba(230,136,99,0.35)",
            }}>
              12 и 13 октября 2026
            </div>
            <div style={{
              fontSize: "clamp(1.05rem, 2vw, 1.4rem)",
              fontWeight: 600,
              color: "#D6C6B2",
              marginTop: "0.45rem",
            }}>
              Москва · личные встречи с Велеславом Старковым
            </div>
          </section>
        )}
        <style>{`.about-scope{max-width:1280px;margin:0 auto;width:100%}
.about-scope img{max-width:350px;height:auto}
@media(max-width:1320px){.about-scope{padding:0 1rem}}
`}</style>
        <div className="about-scope">
          <BlockRenderer blocks={blocks} />
        </div>
        <Footer />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, BASE_URL)) }} />
      {slug === "meropriyatiya" && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
      )}
    </>
  )
}
