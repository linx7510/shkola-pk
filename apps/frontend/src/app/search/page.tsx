import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogParticles from "@/components/BlogParticles";
import CursorLightLazy from "@/components/CursorLightLazy";

export const dynamic = "force-dynamic"; // результаты зависят от ?q=

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

// не показывать в выдаче: черновики под noindex и технические страницы
const HIDDEN_PAGE_SLUGS = new Set([
  "home",
  "kejsy",
  "uslugi-dlya-potrebitelskih-kooperativov/affilirovannoe-ooo-pod-klyuch",
]);

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { cache: "no-store" });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

export const metadata: Metadata = {
  title: { absolute: "Поиск по сайту | Школа ПК" },
  description: "Поиск по страницам, статьям блога и глоссарию потребительской кооперации.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim().slice(0, 100);

  let pages: any[] = [];
  let posts: any[] = [];
  let terms: any[] = [];
  if (q.length >= 2) {
    const enc = encodeURIComponent(`%${q}%`);
    const [pagesData, postsData, termsData] = await Promise.all([
      // страницы сайта: по заголовку и тексту страницы
      payloadApi(`/pages?where[isPublished][equals]=true&where[or][0][title][like]=${enc}&where[or][1][content][like]=${enc}&limit=10`),
      payloadApi(`/blog-posts?where[isPublished][equals]=true&where[or][0][title][like]=${enc}&where[or][1][excerpt][like]=${enc}&sort=-publishedAt&limit=20`),
      payloadApi(`/glossary-terms?where[isPublished][equals]=true&where[or][0][term][like]=${enc}&where[or][1][definition][like]=${enc}&limit=20`),
    ]);
    pages = (pagesData?.docs || []).filter((p: any) => !HIDDEN_PAGE_SLUGS.has(p.slug));
    posts = postsData?.docs || [];
    terms = termsData?.docs || [];
  }

  const total = pages.length + posts.length + terms.length;
  const inputStyle = {
    width: "100%",
    maxWidth: 520,
    padding: "0.8rem 1.1rem",
    borderRadius: 10,
    border: "1px solid rgba(214,198,178,0.2)",
    background: "rgba(214,198,178,0.05)",
    color: "#D6C6B2",
    fontSize: "1.05rem",
    outline: "none",
  } as const;

  const cardStyle = {
    display: "block",
    padding: "0.9rem 1.1rem",
    borderRadius: 10,
    border: "1px solid rgba(214,198,178,0.12)",
    background: "rgba(214,198,178,0.03)",
    textDecoration: "none",
  } as const;

  return (
    <>
      <Header />
      <BlogParticles />
      <CursorLightLazy />
      <main style={{ minHeight: "70vh", background: "var(--color-bg)", paddingTop: "7rem", paddingBottom: "4rem", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 var(--container-px)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 className="heading-sweep" data-text="Поиск по сайту" style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1.25rem" }}>
              Поиск по сайту
            </h1>
            <form action="/search" method="get" style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
              <input type="text" name="q" defaultValue={q} placeholder="Например: НДС, паевой взнос, устав…" style={inputStyle} />
              <button type="submit" style={{ padding: "0.8rem 1.5rem", borderRadius: 10, border: "1px solid rgba(230,136,99,0.5)", background: "rgba(230,136,99,0.15)", color: "#E68863", fontSize: "1.05rem", cursor: "pointer" }}>
                Найти
              </button>
            </form>
            {q.length >= 2 && (
              <p style={{ marginTop: "1.25rem", color: "rgba(214,198,178,0.65)", fontSize: "1rem" }}>
                {total > 0 ? `Найдено: ${total}` : `По запросу «${q}» ничего не найдено`}
              </p>
            )}
            {q.length === 1 && (
              <p style={{ marginTop: "1.25rem", color: "rgba(214,198,178,0.65)", fontSize: "1rem" }}>
                Введите минимум 2 символа
              </p>
            )}
          </div>

          {/* 1. Страницы сайта */}
          {pages.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E68863", marginBottom: "0.9rem" }}>
                Страницы сайта ({pages.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {pages.map((p: any) => (
                  <Link key={p.id} href={`/${p.slug}`} prefetch={false} style={cardStyle}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "#D6C6B2" }}>{p.title}</span>
                    <span style={{ display: "block", fontSize: "0.85rem", color: "rgba(214,198,178,0.45)", marginTop: "0.3rem" }}>
                      велеслав.рус/{p.slug}
                    </span>
                    {p.meta?.description && (
                      <span style={{ display: "block", fontSize: "0.95rem", color: "rgba(214,198,178,0.7)", marginTop: "0.3rem", lineHeight: 1.5 }}>
                        {String(p.meta.description).slice(0, 160)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 2. Статьи блога */}
          {posts.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E68863", marginBottom: "0.9rem" }}>
                Статьи блога ({posts.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {posts.map((p: any) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} prefetch={false} style={cardStyle}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "#D6C6B2" }}>{p.title}</span>
                    {p.excerpt && (
                      <span style={{ display: "block", fontSize: "0.95rem", color: "rgba(214,198,178,0.7)", marginTop: "0.3rem", lineHeight: 1.5 }}>
                        {String(p.excerpt).slice(0, 180)}
                      </span>
                    )}
                    <span style={{ display: "block", fontSize: "0.85rem", color: "rgba(214,198,178,0.45)", marginTop: "0.4rem" }}>
                      {new Date(p.publishedAt || p.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 3. Термины глоссария */}
          {terms.length > 0 && (
            <section style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E68863", marginBottom: "0.9rem" }}>
                Термины глоссария ({terms.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {terms.map((t: any) => (
                  <Link key={t.id} href={`/glossary/${t.slug}`} prefetch={false} style={cardStyle}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "#D6C6B2" }}>{t.term}</span>
                    <span style={{ display: "block", fontSize: "0.95rem", color: "rgba(214,198,178,0.7)", marginTop: "0.3rem", lineHeight: 1.5 }}>
                      {String(t.definition || "").replace(/<[^>]+>/g, "").slice(0, 160)}…
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {q.length >= 2 && total === 0 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <p style={{ color: "rgba(214,198,178,0.7)", marginBottom: "1.25rem" }}>
                Попробуйте спросить у ИИ-консультанта — он знает весь сайт:
              </p>
              <Link href="/ai-konsultant" prefetch={false} style={{ color: "#E68863", textDecoration: "none", fontSize: "1.05rem" }}>
                ИИ-консультант по потребительским кооперативам →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
