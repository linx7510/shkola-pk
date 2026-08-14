import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlockRenderer } from "@/components/BlockRenderer";
import AIConsultantLazy from "@/components/AIConsultantLazy";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

export const dynamic = "force-dynamic"; // ISR отключён: нужен cookies() для video-gating

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=2&limit=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.docs?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page: any = await fetchPage("besplatno");
  if (!page) return { title: "Бесплатно | Школа ПК" };
  const title = page.meta?.title || page.title || "Бесплатные материалы — Школа ПК";
  const description = page.meta?.description || "";
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://велеслав.рус";
  return {
    title,
    description,
    keywords: "потребительский кооператив, бесплатно, мини-курс, 13 уроков, закон 3085-1, ПК vs ООО, глоссарий",
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/besplatno`,
      type: "website",
      locale: "ru_RU",
      siteName: "Школа ПК — Велеслав Старков",
    },
    alternates: {
      canonical: `${BASE_URL}/besplatno`,
    },
  };
}

export default async function BesplatnoPage() {
  const page = await fetchPage("besplatno");
  if (!page) notFound();
  const blocks = (page as any).blocks || (page as any).layout || [];
  // GATING: videoUrl только для залогиненных (ловим лидов). Незалогиненные видят CTA.
  const cookieStore = await cookies()
  const isAuthed = !!cookieStore.get("auth_token")?.value
  // GATING: удаляем videoUrl только для gated блоков (не «Открытые»)
  function stripVideoUrls(obj: any): void {
    if (!obj || typeof obj !== "object") return
    if (Array.isArray(obj)) { obj.forEach(stripVideoUrls); return }
    if ("videoUrl" in obj) obj.videoUrl = undefined
    if ("thumbnailUrl" in obj) obj.thumbnailUrl = undefined
    // Ссылки-карточки на видео тоже gated (иначе videoUrl утекает через <a href>)
    if (typeof obj.link === "string" && /vkvideo\.ru/i.test(obj.link)) obj.link = undefined
    if (typeof obj.href === "string" && /vkvideo\.ru/i.test(obj.href)) obj.href = undefined
    for (const k of Object.keys(obj)) {
      if (obj[k] && typeof obj[k] === "object") stripVideoUrls(obj[k])
    }
  }
  // Для блоков steps с заголовком «Открытые» — НЕ удаляем videoUrl
  function stripGatedVideoUrls(blocksArr: any[]): void {
    for (const block of blocksArr) {
      // Видео-введение (самопрезентация) — маркетинговое, открыто всем
      if (block.blockType === "video" && /введение/i.test(block.title || "")) {
        continue
      }
      if (block.blockType === "steps") {
        const title = (block.title || "").toLowerCase()
        if (title.includes("открыт")) {
          continue // Пропускаем — видео открыты для всех
        }
      }
      stripVideoUrls(block)
    }
  }
  if (!isAuthed && Array.isArray(blocks)) {
    stripGatedVideoUrls(blocks)
  }
  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Бесплатно" }
      ]} />
      <main style={{ paddingTop: "0", minHeight: "60vh" }}>
        {Array.isArray(blocks) && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <section style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2" }}>
              {(page as any).title}
            </h1>
          </section>
        )}
        {(page as any).content && (page as any).content.trim().length > 10 && (
          <section style={{ padding: '0 1.5rem 4rem', maxWidth: 900, margin: '0 auto' }}>
            <div className="article-content" style={{ color: '#D6C6B2', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: (page as any).content }} />
          </section>
        )}
        {/* AI-консультант — точная копия блока с главной страницы */}
        <AIConsultantLazy />
            <Footer />
    </main>
    </>
  );
}