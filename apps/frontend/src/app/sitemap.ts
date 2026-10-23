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
    { url: `${baseUrl}/about-us/meropriyatiya`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/kooperativ-pod-klyuch`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/celevie-potrebitelskie-programmy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/uslugi-dlya-potrebitelskih-kooperativov/sozdanie-polnogo-komplekta-polozheniy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/potrebitelskiy-kooperativ-konsultatsii`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/ai-konsultant`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/mini-kniga`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/besplatno`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/politika-konfidentsialnosti`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/pomosch-proektu`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  // Chernoviki: skryt ot poiskovikov do utverzhdeniya
  const NOINDEX_DRAFTS = new Set(['uslugi-dlya-potrebitelskih-kooperativov/affilirovannoe-ooo-pod-klyuch', 'kejsy']);

  const [postsData, servicesData, uslugiPagesData, termsData] = await Promise.all([
    payloadApi("/blog-posts-light"),
    payloadApi("/services?where[isPublished][equals]=true&limit=100"),
    payloadApi("/pages?where[slug][like]=uslugi-dlya-potrebitelskih-kooperativov%25&where[isPublished][equals]=true&limit=100"),
    payloadApi("/glossary-terms?where[isPublished][equals]=true&limit=200"),
  ]);

  // хабы-темы блога (кластеризация, утверждена 24.10 — состав в blog-shared BLOG_CLUSTERS)
  const blogTopicPages = ["nds", "zapusk", "pravo", "nalogi", "novichkam"].map((t) => ({
    url: `${baseUrl}/blog/tema/${t}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // страницы терминов глоссария — только с полным определением (как в glossary/[slug])
  const glossaryPages = (termsData.docs || [])
    .filter((t: any) => (t.definition || "").length >= 150)
    .map((t: any) => ({
      url: `${baseUrl}/glossary/${t.slug}`,
      lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));

  const blogPages = (postsData.docs || []).map((p: any) => {
    const cover = p.coverImage;
    const coverUrl = cover ? (typeof cover === "object" ? cover.url : cover) : null;
    return {
      url: `${baseUrl}/blog/${p.slug || p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      // image sitemap: обложка статьи для поиска по картинкам
      ...(coverUrl ? { images: [coverUrl.startsWith("http") ? coverUrl : `${baseUrl}${coverUrl}`] } : {}),
    };
  });

  // страницы пагинации блога (24 поста на страницу — как в blog/page.tsx)
  const blogPaginationPages = (() => {
    const totalPages = Math.ceil((postsData.docs || []).length / 24);
    const pages: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = [];
    for (let i = 2; i <= totalPages; i++) {
      pages.push({ url: `${baseUrl}/blog/page/${i}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 });
    }
    return pages;
  })();

  const servicePages = (servicesData.docs || []).map((s: any) => ({
    url: `${baseUrl}/uslugi/${s.slug || s.id}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const uslugiPages = (uslugiPagesData.docs || []).filter((p: any) => !NOINDEX_DRAFTS.has(p.slug))
    .filter((p: any) => typeof p.slug === "string" && p.slug.startsWith("uslugi-dlya-potrebitelskih-kooperativov/"))
    .map((p: any) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Дедупликация по url (статические + динамические)
  const seen = new Set<string>();
  const all = [...staticPages, ...blogPages, ...blogPaginationPages, ...blogTopicPages, ...servicePages, ...uslugiPages, ...glossaryPages].filter((e: any) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });

  return all;
}
