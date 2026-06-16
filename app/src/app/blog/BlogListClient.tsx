"use client";
import { useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];
  const filtered = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts;

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "calc(var(--header-h) + 2rem)", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-px)" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="heading-sweep" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#D6C6B2", marginBottom: "1rem" }}>
            Блог Школы ПК
          </h1>
          <p style={{ color: "rgba(214,198,178,0.6)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Статьи о потребительских кооперативах, праве, защите активов и налоговой оптимизации
          </p>
        </div>

        {categories.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: 999,
                border: `1px solid ${!activeCategory ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
                background: !activeCategory ? "rgba(230,136,99,0.1)" : "transparent",
                color: !activeCategory ? "#E68863" : "rgba(214,198,178,0.6)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 999,
                  border: `1px solid ${activeCategory === cat ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
                  background: activeCategory === cat ? "rgba(230,136,99,0.1)" : "transparent",
                  color: activeCategory === cat ? "#E68863" : "rgba(214,198,178,0.6)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(214,198,178,0.4)", padding: "4rem 0" }}>
            Пока нет публикаций. Скоро здесь появятся статьи о потребительских кооперативах.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {filtered.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{
                  display: "block",
                  background: "rgba(214,198,178,0.03)",
                  border: "1px solid rgba(214,198,178,0.08)",
                  borderRadius: 12,
                  overflow: "hidden",
                  textDecoration: "none",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(230,136,99,0.3)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(214,198,178,0.08)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {post.coverImage && (
                  <div style={{ width: "100%", height: 200, background: "rgba(214,198,178,0.05)", overflow: "hidden" }}>
                    <img src={post.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "1.25rem" }}>
                  {post.category && (
                    <span style={{ fontSize: "0.75rem", color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {post.category}
                    </span>
                  )}
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#D6C6B2", margin: "0.5rem 0 0.75rem", lineHeight: 1.4 }}>
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p style={{ fontSize: "0.9rem", color: "rgba(214,198,178,0.5)", lineHeight: 1.6, margin: 0 }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "rgba(214,198,178,0.3)" }}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
