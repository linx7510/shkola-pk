import { MetadataRoute } from "next";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { next: { revalidate: 3600 } })
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
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/potrebitelskiy-kooperativ-konsultatsii`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/besplatno`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/pomosch-proektu`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const [postsData, termsData, servicesData] = await Promise.all([
    payloadApi("/blog-posts?where[isPublished][equals]=true&limit=100"),
    payloadApi("/glossary-terms?where[isPublished][equals]=true&limit=100"),
    payloadApi("/services?where[isPublished][equals]=true&limit=100"),
  ]);

  const blogPages = (postsData.docs || []).map((p: any) => ({
    url: `${baseUrl}/blog/${p.slug || p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const glossaryPages = (termsData.docs || []).map((t: any) => ({
    url: `${baseUrl}/glossary/${t.slug || t.id}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const servicePages = (servicesData.docs || []).map((s: any) => ({
    url: `${baseUrl}/uslugi/${s.slug || s.id}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...glossaryPages, ...servicePages];
}
