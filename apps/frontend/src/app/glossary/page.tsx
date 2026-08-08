import { Metadata } from "next";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Breadcrumbs from "@/components/Breadcrumbs"
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlossaryListClient from "./GlossaryListClient";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

const PAGE_URL = "https://велеслав.рус/glossary";
const PAGE_TITLE = "Глоссарий — ключевые термины потребительской кооперации";
const PAGE_DESCRIPTION = "102 термина потребительской кооперации с определениями: общие понятия, правовые термины, финансовые термины, управление ПК. Поиск по алфавиту и категориям.";
const PAGE_IMAGE = "https://велеслав.рус/images/og-preview.webp";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "глоссарий кооперации",
    "термины потребительского кооператива",
    "словарь кооперативных терминов",
    "паевой взнос определение",
    "кооперативные выплаты определение",
    "субсидиарная ответственность термин",
    "устав ПК понятие",
    "целевая программа кооператив определение",
    "Закон 3085-1 терминология",
    "правовые термины кооперации",
    "финансовые термины кооперации",
    "управление ПК термины",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "велеслав.рус — Школа потребительской кооперации",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: PAGE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Глоссарий — ключевые термины потребительской кооперации",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Veles_ST",
    creator: "@Veles_ST",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: PAGE_IMAGE,
        alt: "Глоссарий — ключевые термины потребительской кооперации",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

const CATEGORY_NAMES: Record<string, string> = {
  "10": "Общие понятия",
  "11": "Правовые термины",
  "12": "Финансовые термины",
  "13": "Управление ПК",
};

export default async function GlossaryPage() {
  const data = await payloadApi("/glossary-terms?where[isPublished][equals]=true&sort=order&limit=500");
  const terms = (data.docs || []).map((t: any) => {
    let cat: string | null = null;
    if (t.category) {
      if (typeof t.category === 'object') {
        cat = t.category.title || t.category.name || (t.category.id ? String(t.category.id) : null);
      } else {
        cat = CATEGORY_NAMES[String(t.category)] || String(t.category);
      }
    }
    return {
      id: String(t.id),
      term: t.term,
      slug: t.slug,
      definition: t.definition || '',
      category: cat,
    };
  });

  // Build DefinedTermSet JSON-LD for SEO
  const glossarySchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Глоссарий потребительской кооперации",
    description: "Ключевые термины и понятия потребительской кооперации: общие понятия, правовые термины, финансовые термины, управление ПК.",
    url: PAGE_URL,
    hasDefinedTerm: terms.map((t: any) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
    })),
  };

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://велеслав.рус" },
      { "@type": "ListItem", position: 2, name: "Глоссарий", item: PAGE_URL },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Глоссарий" }
      ]} />
      <GlossaryListClient terms={terms} />
          <Footer />
    </>
  );
}