import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Статья не найдена" };
  return {
    title: post.metaTitle || `${post.title} | Школа ПК`,
    description: post.metaDescription || post.excerpt || "",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "calc(var(--header-h) + 2rem)", paddingBottom: "4rem" }}>
        <article style={{ maxWidth: 780, margin: "0 auto", padding: "0 var(--container-px)" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "rgba(214,198,178,0.5)",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginBottom: "2rem",
            }}
          >
            &larr; Все статьи
          </Link>

          {post.category && (
            <div style={{ fontSize: "0.8rem", color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              {post.category}
            </div>
          )}

          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#D6C6B2", lineHeight: 1.3, marginBottom: "1rem" }}>
            {post.title}
          </h1>

          <div style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.4)", marginBottom: "2rem" }}>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          {post.coverImage && (
            <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
              <img src={post.coverImage} alt="" style={{ width: "100%", display: "block" }} />
            </div>
          )}

          <div
            style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.05rem", lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "2rem" }}>
              {post.tags.split(",").map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.3rem 0.7rem",
                    borderRadius: 999,
                    border: "1px solid rgba(214,198,178,0.1)",
                    color: "rgba(214,198,178,0.4)",
                  }}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Lead capture */}
          <div style={{ marginTop: "3rem", padding: "2rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 12 }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#D6C6B2", marginBottom: "0.5rem" }}>
              Хотите узнать больше?
            </h3>
            <p style={{ color: "rgba(214,198,178,0.5)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Запишитесь на консультацию или бесплатный пробный урок
            </p>
            <Link
              href="/#contacts"
              className="btn-primary"
              style={{ display: "inline-block", padding: "0.7rem 1.5rem" }}
            >
              Записаться
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
