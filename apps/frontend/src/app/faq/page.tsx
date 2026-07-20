import { Metadata } from "next";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Breadcrumbs from "@/components/Breadcrumbs"
import Header from "@/components/Header";
import FaqListClient from "./FaqListClient";

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

const PAGE_URL = "https://2980738.ru/faq";
const PAGE_TITLE = "FAQ — Частые вопросы о потребительских кооперативах";
const PAGE_DESCRIPTION = "162 ответа на вопросы о потребительских кооперативах: налоги, устав, регистрация, субсидиарная ответственность, целевые программы, проверки ФНС и мошенничество.";
const PAGE_IMAGE = "https://2980738.ru/images/og-preview.webp";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "FAQ потребительский кооператив",
    "частые вопросы кооперация",
    "вопросы о ПК",
    "налоги потребительского кооператива",
    "устав ПК вопросы",
    "регистрация кооператива FAQ",
    "субсидиарная ответственность пайщика",
    "целевая программа кооператив",
    "Закон 3085-1 вопросы",
    "обнуление НДС FAQ",
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
        alt: "FAQ — Частые вопросы о потребительских кооперативах",
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
        alt: "FAQ — Частые вопросы о потребительских кооперативах",
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

function extractTextFromLexical(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (content.root?.children) {
    return content.root.children
      .map((child: any) => {
        if (child.children) {
          return child.children.map((c: any) => c.text || '').join('');
        }
        return child.text || '';
      })
      .join('\n');
  }
  return '';
}

const CATEGORY_NAMES: Record<string, string> = {
  "6": "Регистрация ПК",
  "7": "Устав",
  "8": "Взносы",
  "9": "Общее",
};

export default async function FaqPage() {
  const data = await payloadApi("/faq-items?sort=order&limit=500");
  const items = (data.docs || []).map((item: any) => {
    let cat: string | null = null;
    if (item.category) {
      if (typeof item.category === 'object') {
        cat = item.category.title || item.category.name || (item.category.id ? String(item.category.id) : null);
      } else {
        cat = CATEGORY_NAMES[String(item.category)] || String(item.category);
      }
    }
    return {
      id: String(item.id),
      question: item.question,
      answer: extractTextFromLexical(item.answer),
      category: cat,
    };
  });

  // Build FAQPage JSON-LD for SEO (Google rich snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item: any) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://2980738.ru" },
      { "@type": "ListItem", position: 2, name: "FAQ", item: PAGE_URL },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "FAQ" }
      ]} />
      <FaqListClient items={items} />
    </>
  );
}
