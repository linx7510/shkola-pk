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
  // Принудительно Unicode (велеслав.рус), не Punycode (xn--80adbka9ab1c.xn--p1acf)
  // canonical и og:url в HTML используют Unicode — sitemap должен совпадать
  const baseUrl = "https://велеслав.рус";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/kooperativ-pod-klyuch`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/celevie-potrebitelskie-programmy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/sozdanie-polnogo-komplekta-polozheniy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/potrebitelskiy-kooperativ-konsultatsii`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/besplatno`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/politika-konfidentsialnosti`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/pomosch-proektu`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const [postsData, termsData, servicesData, uslugiPagesData] = await Promise.all([
    payloadApi("/blog-posts?where[isPublished][equals]=true&limit=100"),
    payloadApi("/glossary-terms?where[isPublished][equals]=true&limit=100"),
    payloadApi("/services?where[isPublished][equals]=true&limit=100"),
    payloadApi("/pages?where[slug][like]=uslugi-dlya-potrebitelskih-kooperativov%25&where[isPublished][equals]=true&limit=100"),
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

  const uslugiPages = (uslugiPagesData.docs || [])
    .filter((p: any) => typeof p.slug === "string" && p.slug.startsWith("uslugi-dlya-potrebitelskih-kooperativov/"))
    .map((p: any) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Дедупликация по url (статические + динамические)
  const seen = new Set<string>();
  const all = [...staticPages, ...blogPages, ...glossaryPages, ...servicePages, ...uslugiPages].filter((e: any) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });

  return all;
}
