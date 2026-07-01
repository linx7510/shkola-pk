import { notFound } from "next/navigation";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import { Metadata } from "next";

import Header from "@/components/Header";
const CursorLight = dynamic(() => import("@/components/CursorLight"));
const BlogParticles = dynamic(() => import("@/components/BlogParticles"));
import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/components/Breadcrumbs";
import dynamic from "next/dynamic";


const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Convert Payload Lexical JSON to HTML string
 */
function lexicalToHtml(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  
  const root = content.root;
  if (!root?.children) return '';

  function nodeToHtml(node: any): string {
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      if (node.underline) text = `<u>${text}</u>`;
      if (node.code) text = `<code>${text}</code>`;
      return text;
    }

    if (node.type === 'paragraph') {
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<p>${children}</p>`;
    }

    if (node.type === 'heading') {
      const tag = node.tag || 'h2';
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<${tag}>${children}</${tag}>`;
    }

    if (node.type === 'list') {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<${tag}>${children}</${tag}>`;
    }

    if (node.type === 'listitem') {
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<li>${children}</li>`;
    }

    if (node.type === 'link') {
      const href = node.fields?.url || '#';
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }

    if (node.type === 'quote') {
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<blockquote>${children}</blockquote>`;
    }

    if (node.type === 'linebreak') {
      return '<br/>';
    }

    // Fallback: render children if present
    if (node.children) {
      return (node.children as any[]).map(nodeToHtml).join('');
    }

    return '';
  }

  return root.children.map(nodeToHtml).join('');
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await payloadApi(`/blog-posts?where[slug][equals]=${slug}&limit=1`)
  const post = data?.docs?.[0]
  if (!post) return { title: "Статья не найдена" };
  return {
    title: post.meta?.title || post.title ? `${post.title} | Школа ПК` : "Статья | Школа ПК",
    description: post.meta?.description || post.excerpt || "",
    other: (post as any)?.headCode ? { 'custom-head': (post as any).headCode } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const data = await payloadApi(`/blog-posts?where[slug][equals]=${slug}&limit=1`)
  const post = data?.docs?.[0]
  if (!post || !post.isPublished) notFound();

  let contentHtml = lexicalToHtml(post.content);

  // Replace {{img:N}} placeholders with styled <img> tags from post.images array
  const images = (post as any).images || [];
  if (images.length > 0) {
    contentHtml = contentHtml.replace(/{{img:(\d+)}}/g, (match: string, num: string) => {
      const idx = parseInt(num, 10) - 1;
      const img = images[idx];
      if (!img || !img.image) return match;
      const imgUrl = typeof img.image === 'object' ? img.image.url : img.image;
      if (!imgUrl) return match;
      const w = img.width ? `width:${img.width}px;` : '';
      const alt = img.alt || '';
      const align = img.align || 'none';
      const margin = img.margin || '0 1.5rem 1rem 0';
      let style = '';
      let wrapperStyle = '';
      if (align === 'left') {
        style = `float:left;${w}margin:${margin};border-radius:8px;`;
      } else if (align === 'right') {
        style = `float:right;${w}margin:${margin};border-radius:8px;`;
      } else if (align === 'center') {
        wrapperStyle = `text-align:center;margin:1.5rem 0;`;
        style = `${w}max-width:100%;border-radius:8px;`;
      } else {
        style = `${w}display:block;margin:1.5rem auto;border-radius:8px;`;
      }
      const imgTag = `<img src="${imgUrl}" alt="${alt.replace(/"/g, '&quot;')}" style="${style}" />`;
      const captionHtml = img.caption ? `<figcaption style="font-size:1.05rem;color:rgba(214,198,178,0.8);margin-top:0.5rem;text-align:center;">${img.caption}</figcaption>` : '';
      if (align === 'center' || align === 'none') {
        return `<figure style="${wrapperStyle}">${imgTag}${captionHtml}</figure>`;
      }
      return `<figure style="margin:0;${align === 'left' ? 'float:left;' : 'float:right;'}">${imgTag}${captionHtml}</figure>`;
    });
  }

  return (
    <>
      <Header />
        <CursorLight />
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Блог", href: "/blog" },
          { label: (post as any).title || "" }
        ]} />
        <BlogParticles />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "0", paddingBottom: "4rem" }}>
        <article style={{ maxWidth: 1400, margin: "0 auto", padding: "0 var(--container-px)" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "rgba(214,198,178,0.8)",
              fontSize: "1.05rem",
              textDecoration: "none",
              marginBottom: "2rem",
            }}
          >
            &larr; Все статьи
          </Link>

          {post.category && (
            <div style={{ fontSize: "1rem", color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              {post.category}
            </div>
          )}

          <h1 className="heading-sweep" data-text={post.title || ''} style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#D6C6B2", lineHeight: 1.3, marginBottom: "1rem" }}>
            {post.title}
          </h1>

          <div style={{ fontSize: "1.05rem", color: "rgba(214,198,178,0.65)", marginBottom: "2rem" }}>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          {/* Cover image убран — дублирует фото из статьи */}

          {contentHtml && (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}

          {post.tags && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "2rem" }}>
              {post.tags.split(",").map((tag: string, i: number) => (
                <span
                  key={i}
                  style={{
                    fontSize: "1rem",
                    padding: "0.3rem 0.7rem",
                    borderRadius: 999,
                    border: "1px solid rgba(214,198,178,0.1)",
                    color: "rgba(214,198,178,0.65)",
                  }}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Lead capture */}
          <div style={{ marginTop: "3rem", padding: "2rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 12 }}>
            <h3 className="heading-sweep" data-text="Хотите узнать больше?" style={{ fontSize: "1.2rem", fontWeight: 600, color: "#D6C6B2", marginBottom: "0.5rem" }}>
              Хотите узнать больше?
            </h3>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", marginBottom: "1rem" }}>
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

        {/* AI-консультант — точная копия блока с главной страницы */}
      </main>
    </>
  );
}
