import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { BlockRenderer } from "@/components/BlockRenderer";
import AIConsultant from "@/components/AIConsultant";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/components/Breadcrumbs";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://2980738.ru";

export const revalidate = 300;

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
  const page: any = await fetchPage("uslugi-dlya-potrebitelskih-kooperativov");

  const fallbackTitle = "Услуги для потребительских кооперативов | велеслав.рус";
  const fallbackDescription = "Услуги для потребительских кооперативов: аудит устава, регистрация ПК под ключ, целевые программы, бухгалтерское сопровождение, сопровождение при проверках ФНС. Опыт 10+ лет, 120+ кооперативов.";

  if (!page) {
    return {
      title: { absolute: fallbackTitle },
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: `${BASE_URL}/uslugi-dlya-potrebitelskih-kooperativov`,
        type: "website",
        locale: "ru_RU",
        siteName: "Школа ПК — Велеслав Старков",
        images: [{ url: `${BASE_URL}/images/og-preview.webp`, width: 1200, height: 630, alt: fallbackTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
        images: [{ url: `${BASE_URL}/images/og-preview.webp`, alt: fallbackTitle }],
        site: "@Veles_ST",
        creator: "@Veles_ST",
      },
      alternates: { canonical: `${BASE_URL}/uslugi-dlya-potrebitelskih-kooperativov` },
    };
  }

  const title = page.meta?.title || page.metaTitle || page.title || "Услуги для ПК";
  const description = page.meta?.description || page.metaDescription || fallbackDescription;
  const finalTitle = `${title} | велеслав.рус`;
  const ogImage = page.meta?.image?.url
    ? (page.meta.image.url.startsWith("http") ? page.meta.image.url : `${BASE_URL}${page.meta.image.url}`)
    : `${BASE_URL}/images/og-preview.webp`;

  return {
    title: { absolute: finalTitle },
    description,
    openGraph: {
      title: finalTitle,
      description,
      url: `${BASE_URL}/uslugi-dlya-potrebitelskih-kooperativov`,
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
    alternates: { canonical: `${BASE_URL}/uslugi-dlya-potrebitelskih-kooperativov` },
  };
}

export default async function UslugiPage() {
  const page: any = await fetchPage("uslugi-dlya-potrebitelskih-kooperativov");
  if (!page) notFound();

  const blocks = page.blocks || page.layout || [];
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
  const contentHtml = page.content || "";
  const hasContent = contentHtml && contentHtml.trim().length > 10;

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК" }
      ]} />
      <main style={{ paddingTop: "0", minHeight: "60vh" }}>
        {/* Блоки с услугами (включая text-блоки с фото) */}
        {hasBlocks && (
          <BlockRenderer blocks={blocks} />
        )}
        {/* 3. AI-консультант */}
        <AIConsultant />
      </main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК" }
      ], BASE_URL)) }} />
    </>
  );
}
