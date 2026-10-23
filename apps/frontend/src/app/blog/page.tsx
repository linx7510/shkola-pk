import { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs"
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Header from "@/components/Header";
import CursorLightLazy from "@/components/CursorLightLazy"
import BlogParticles from "@/components/BlogParticles"
import Footer from "@/components/Footer";
import BlogListClient from "./BlogListClient";
import AIConsultantLazy from "@/components/AIConsultantLazy";
import { PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION, PAGE_SIZE, fetchAllPosts } from "./blog-shared";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  keywords: [
    "блог о потребительской кооперации",
    "статьи о потребительских кооперативах",
    "налоги потребительского кооператива",
    "обнуление НДС кооператив",
    "закон 3085-1 разбор",
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
    images: [{ url: "https://велеслав.рус/images/og-preview.webp", width: 1200, height: 630, alt: "Блог Школы потребительской кооперации" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Veles_ST",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["https://велеслав.рус/images/og-preview.webp"],
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  // приёмка P0-3: ?page=N отдаёт вторую страницу — постоянный редирект на серверный маршрут
  const sp = await searchParams;
  const pn = parseInt(String(sp?.page ?? ""), 10);
  if (Number.isInteger(pn) && pn > 1) {
    permanentRedirect(`/blog/page/${pn}`);
  }
  const posts = await fetchAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const pagePosts = posts.slice(0, PAGE_SIZE);

  // JSON-LD: Blog + ItemList — блог как полноценный хаб для поисковиков
  const blogJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Блог Школы потребительской кооперации",
    url: PAGE_URL,
    description: PAGE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: "Школа потребительской кооперации",
      url: "https://велеслав.рус",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://велеслав.рус/blog/${p.slug}`,
      datePublished: p.publishedAt,
    })),
  };
  const itemListJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Статьи блога о потребительской кооперации",
    numberOfItems: posts.length,
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://велеслав.рус/blog/${p.slug}`,
      name: p.title,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: "https://велеслав.рус/" }, { "@type": "ListItem", position: 2, name: "Блог", item: PAGE_URL }],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Header />
      <BlogParticles />
      <CursorLightLazy />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Блог" }
      ]} />
      <BlogListClient posts={pagePosts} allPosts={posts} currentPage={1} totalPages={totalPages} />
      <AIConsultantLazy />
          <Footer />
    </>
  );
}
