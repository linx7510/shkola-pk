import { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Header from "@/components/Header";
import CursorLightLazy from "@/components/CursorLightLazy";
import BlogParticles from "@/components/BlogParticles";
import Footer from "@/components/Footer";
import BlogListClient from "../../BlogListClient";
import AIConsultantLazy from "@/components/AIConsultantLazy";
import { PAGE_SIZE, fetchAllPosts } from "../../blog-shared";

interface Props {
  params: Promise<{ page: string }>;
}

const BASE_URL = "https://велеслав.рус";

export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  // страницы 2..N (страница 1 живёт в /blog)
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const n = parseInt(page, 10);
  if (!Number.isInteger(n) || n < 2) return {};
  return {
    title: { absolute: `Статьи, страница ${n} | Школа ПК` },
    description: "Все статьи блога о потребительских кооперативах: налоги и НДС, право, защита активов, регистрация и ведение ПК.",
    alternates: { canonical: `${BASE_URL}/blog/page/${n}` },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPageNumbered({ params }: Props) {
  const { page } = await params;
  const n = parseInt(page, 10);
  if (!Number.isInteger(n) || n < 2) notFound();

  const posts = await fetchAllPosts();
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  if (n > totalPages) notFound();

  const pagePosts = posts.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Блог", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: `Страница ${n}`, item: `${BASE_URL}/blog/page/${n}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />
      <BlogParticles />
      <CursorLightLazy />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Блог", href: "/blog" },
        { label: `Страница ${n}` },
      ]} />
      <BlogListClient posts={pagePosts} allPosts={posts} currentPage={n} totalPages={totalPages} />
      <AIConsultantLazy />
      <Footer />
    </>
  );
}
