import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Header from "@/components/Header";
import CursorLightLazy from "@/components/CursorLightLazy";
import BlogParticles from "@/components/BlogParticles";
import Footer from "@/components/Footer";
import AIConsultantLazy from "@/components/AIConsultantLazy";
import { fetchAllPosts, BLOG_CLUSTERS, type BlogCluster } from "../../blog-shared";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = "https://велеслав.рус";

function clusterBySlug(slug: string): BlogCluster | undefined {
  return BLOG_CLUSTERS.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  return BLOG_CLUSTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cluster = clusterBySlug(slug);
  if (!cluster) return {};
  const title = `${cluster.title} — статьи | Школа ПК`;
  return {
    title: { absolute: title.length > 60 ? title.slice(0, 57).replace(/\s+\S*$/, "") + "…" : title },
    description: cluster.description,
    alternates: { canonical: `${BASE_URL}/blog/tema/${cluster.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: cluster.title,
      description: cluster.description,
      url: `${BASE_URL}/blog/tema/${cluster.slug}`,
      siteName: "велеслав.рус — Школа потребительской кооперации",
      locale: "ru_RU",
      type: "website",
    },
  };
}

export default async function BlogTopicPage({ params }: Props) {
  const { slug } = await params;
  const cluster = clusterBySlug(slug);
  if (!cluster) notFound();

  const posts = await fetchAllPosts();
  const mainPost = posts.find((p) => p.slug === cluster.main) || null;
  const memberPosts = cluster.members
    .map((m) => posts.find((p) => p.slug === m))
    .filter(Boolean);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Блог", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: cluster.title, item: `${BASE_URL}/blog/tema/${cluster.slug}` },
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
        { label: cluster.title },
      ]} />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "0", paddingBottom: "4rem" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-px)" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1 className="heading-sweep" data-text={`${cluster.title}: статьи`} style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem" }}>
              {cluster.title}: статьи
            </h1>
            <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.1rem", maxWidth: 640, margin: "0 auto" }}>
              {cluster.description}
            </p>
          </div>

          {/* Главная статья кластера — акцентная карточка */}
          {mainPost && (
            <Link href={`/blog/${mainPost.slug}`} prefetch={false} className="blog-featured__card" style={{ marginBottom: "2rem" }}>
              <div className="blog-featured__img-wrap">
                {mainPost.coverImage ? (
                  <img
                    src={typeof mainPost.coverImage === "object" ? mainPost.coverImage.url : mainPost.coverImage}
                    alt={mainPost.title}
                    width={typeof mainPost.coverImage === "object" ? mainPost.coverImage.width : undefined}
                    height={typeof mainPost.coverImage === "object" ? mainPost.coverImage.height : undefined}
                    fetchPriority="high"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "rgba(201,110,77,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>⭐</div>
                )}
              </div>
              <div className="blog-featured__content">
                <span style={{ fontSize: "1rem", color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  Главная статья темы
                </span>
                <h2 className="blog-featured__title heading-sweep" data-text={mainPost.title}>{mainPost.title}</h2>
                {mainPost.excerpt && <p className="blog-featured__excerpt">{mainPost.excerpt}</p>}
                <span className="blog-featured__link">Читать обзор темы →</span>
              </div>
            </Link>
          )}

          {/* Сателлиты кластера */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
            {memberPosts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} prefetch={false} className="blog-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="blog-card__img-wrap">
                  {post.coverImage ? (
                    <img
                      src={typeof post.coverImage === "object" ? post.coverImage.url : post.coverImage}
                      alt={post.title}
                      width={typeof post.coverImage === "object" ? post.coverImage.width : undefined}
                      height={typeof post.coverImage === "object" ? post.coverImage.height : undefined}
                      loading="lazy" decoding="async"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "rgba(201,110,77,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📄</div>
                  )}
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#E7DCCF", margin: "0 0 0.75rem", lineHeight: 1.4 }}>{post.title}</h2>
                  {post.excerpt && <p style={{ fontSize: "1rem", color: "rgba(214,198,178,0.8)", lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>}
                  <div style={{ marginTop: "0.75rem", fontSize: "1rem", color: "rgba(214,198,178,0.8)" }}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Другие темы */}
          <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
            <div style={{ color: "rgba(214,198,178,0.6)", fontSize: "1rem", marginBottom: "0.75rem" }}>Другие темы блога:</div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              {BLOG_CLUSTERS.filter((c) => c.slug !== cluster.slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/tema/${c.slug}`}
                  prefetch={false}
                  style={{ padding: "0.45rem 1rem", borderRadius: 999, textDecoration: "none", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.15)", color: "rgba(214,198,178,0.85)" }}
                >
                  {c.title}
                </Link>
              ))}
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/blog" prefetch={false} style={{ color: "#E68863", textDecoration: "none", fontSize: "1.05rem" }}>
                ← Все статьи блога
              </Link>
            </div>
          </div>
        </div>
      </main>
      <AIConsultantLazy />
      <Footer />
    </>
  );
}
