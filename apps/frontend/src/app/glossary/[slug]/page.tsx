import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Header from "@/components/Header";
import CursorLightLazy from "@/components/CursorLightLazy";
import BlogParticles from "@/components/BlogParticles";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";
const BASE_URL = "https://велеслав.рус";

interface GlossTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category: { title?: string } | null;
}

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

/** Все опубликованные термины (кэш Next). */
async function fetchTerms(): Promise<GlossTerm[]> {
  const data = await payloadApi("/glossary-terms?where[isPublished][equals]=true&limit=200");
  return (data.docs || []).map((t: any) => ({
    id: String(t.id),
    term: t.term,
    slug: t.slug,
    definition: t.definition || "",
    category: t.category || null,
  }));
}

/** Страницы создаются только для терминов с внятным определением (тонкие остаются на /glossary). */
function hasFullDefinition(t: GlossTerm) {
  return t.definition.length >= 150;
}

export async function generateStaticParams() {
  const terms = await fetchTerms();
  return terms.filter(hasFullDefinition).map((t) => ({ slug: t.slug }));
}

function titleFor(term: string) {
  const t = `${term} — что это: глоссарий кооперации`;
  return t.length > 60 ? `${term} — глоссарий кооперации`.slice(0, 57).replace(/\s+\S*$/, "") + "…" : t;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const terms = await fetchTerms();
  const term = terms.find((t) => t.slug === slug);
  if (!term) return {};
  const desc = term.definition.replace(/\s+/g, " ").slice(0, 155).replace(/\s+\S*$/, "") + (term.definition.length > 155 ? "…" : "");
  return {
    title: { absolute: titleFor(term.term) },
    description: desc,
    alternates: { canonical: `${BASE_URL}/glossary/${term.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: term.term,
      description: desc,
      url: `${BASE_URL}/glossary/${term.slug}`,
      siteName: "велеслав.рус — Школа потребительской кооперации",
      locale: "ru_RU",
      type: "article",
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const terms = await fetchTerms();
  const term = terms.find((t) => t.slug === slug);
  if (!term || !hasFullDefinition(term)) notFound();

  const catTitle = term.category?.title || null;
  const related = terms
    .filter((t) => t.slug !== term.slug && t.category?.title === catTitle)
    .slice(0, 6);

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition.replace(/\s+/g, " ").slice(0, 300),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Глоссарий потребительской кооперации",
      url: `${BASE_URL}/glossary`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Глоссарий", item: `${BASE_URL}/glossary` },
          { "@type": "ListItem", position: 3, name: term.term, item: `${BASE_URL}/glossary/${term.slug}` },
        ],
      }) }} />
      <Header />
      <BlogParticles />
      <CursorLightLazy />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Глоссарий", href: "/glossary" },
        { label: term.term },
      ]} />
      <main style={{ minHeight: "60vh", background: "var(--color-bg)", paddingTop: "0", paddingBottom: "4rem" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "0 var(--container-px)" }}>
          {catTitle && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: 999, border: "1px solid rgba(230,136,99,0.5)", background: "rgba(230,136,99,0.1)", color: "#E68863", fontSize: "0.95rem" }}>
                {catTitle}
              </span>
            </div>
          )}
          <h1 className="heading-sweep" data-text={term.term} style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1.5rem", textAlign: "center" }}>
            {term.term}
          </h1>
          <div
            className="article-content"
            style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.08rem" }}
            dangerouslySetInnerHTML={{ __html: term.definition }}
          />

          {related.length > 0 && (
            <section style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(214,198,178,0.1)" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#E68863", marginBottom: "1rem" }}>
                Смотрите также
              </h2>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {related.map((t) => (
                  <Link
                    key={t.id}
                    href={`/glossary/${t.slug}`}
                    prefetch={false}
                    style={{
                      padding: "0.45rem 1rem", borderRadius: 999, textDecoration: "none", fontSize: "1rem",
                      border: "1px solid rgba(214,198,178,0.15)", color: "rgba(214,198,178,0.85)",
                    }}
                  >
                    {t.term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/glossary" prefetch={false} style={{ color: "#E68863", textDecoration: "none", fontSize: "1.05rem" }}>
              ← Весь глоссарий ({terms.length} терминов)
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
