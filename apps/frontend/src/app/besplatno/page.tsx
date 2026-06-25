import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { BlockRenderer } from "@/components/BlockRenderer";
import AIConsultant
import Breadcrumbs from "@/components/Breadcrumbs" from "@/components/AIConsultant";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

export const revalidate = 300; // ISR: revalidate every 5 minutes

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=2&limit=1`,
      { next: { revalidate: 300 } }
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
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://2980738.ru";
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
  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Бесплатно" }
      ]} />
      <main style={{ paddingTop: "5rem", minHeight: "60vh" }}>
        {Array.isArray(blocks) && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <section style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
            <h1 className="heading-sweep" data-text={(page as any).title || ""} style={{ color: "#D6C6B2" }}>
              {(page as any).title}
            </h1>
          </section>
        )}
        {/* AI-консультант — точная копия блока с главной страницы */}
        <AIConsultant />
      </main>
    </>
  );
}
