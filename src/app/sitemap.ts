import { MetadataRoute } from "next";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { cache: 'no-store' })
    if (!res.ok) return { docs: [] }
    return res.json()
  } catch {
    return { docs: [] }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://2980738.ru";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  const [coursesData, postsData, termsData] = await Promise.all([
    payloadApi("/courses?where[isPublished][equals]=true&limit=100&select=slug,updatedAt"),
    payloadApi("/blog-posts?where[isPublished][equals]=true&limit=100&select=slug,updatedAt"),
    payloadApi("/glossary-terms?where[isPublished][equals]=true&limit=100&select=slug,updatedAt"),
  ]);

  const coursePages = (coursesData.docs || []).map((c: any) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogPages = (postsData.docs || []).map((p: any) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const glossaryPages = (termsData.docs || []).map((t: any) => ({
    url: `${baseUrl}/glossary/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...coursePages, ...blogPages, ...glossaryPages];
}

