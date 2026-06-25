import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs"
import Header from "@/components/Header";
import BlogListClient from "./BlogListClient";
import AIConsultant from "@/components/AIConsultant";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { cache: 'no-store' });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

export const metadata: Metadata = {
  title: "Блог | Школа ПК",
  description: "Статьи о потребительских кооперативах, праве, защите активов и налоговой оптимизации",
};

export default async function BlogPage() {
  const data = await payloadApi("/blog-posts?where[isPublished][equals]=true&sort=-publishedAt&depth=1&limit=100");
  const posts = (data.docs || []).map((p: any) => ({
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || null,
    coverImage: p.coverImage || null,
    category: p.category || null,
    tags: p.tags || null,
    publishedAt: p.publishedAt || p.createdAt,
    createdAt: p.createdAt,
  }));

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Блог" }
      ]} />
      <BlogListClient posts={posts} />
      <AIConsultant />
    </>
  );
}
