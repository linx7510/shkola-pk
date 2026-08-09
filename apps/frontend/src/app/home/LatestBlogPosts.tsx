"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

/**
 * Последние 3 статьи блога — client-side only.
 * Загружается через useEffect после hydration, не блокирует SSR.
 * Пока данные не загружены — ничего не рендерит (loading: () => null в dynamic).
 */
export function LatestBlogPosts() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/blog-posts?where[isPublished][equals]=true&sort=-publishedAt&depth=1&limit=3`)
      .then(r => r.json())
      .then(data => setPosts(data.docs || []))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"1.5rem"}}>
      {posts.map((post, i) => (
        <Reveal key={post.id} delay={i + 1}>
          <Link href={`/blog/${post.slug} prefetch={false}`} style={{display:"block", background:"rgba(214,198,178,0.03)", border:"1px solid rgba(214,198,178,0.08)", borderRadius:14, overflow:"hidden", textDecoration:"none", color:"inherit", transition:"all 0.3s"}} onMouseEnter={e => {e.currentTarget.style.borderColor="rgba(230,136,99,0.3)"; e.currentTarget.style.transform="translateY(-3px)"}} onMouseLeave={e => {e.currentTarget.style.borderColor="rgba(214,198,178,0.08)"; e.currentTarget.style.transform="translateY(0)"}}>
            {post.coverImage && (
              <div style={{width:"100%", aspectRatio:"1/1", maxWidth:"300px", maxHeight:"300px", overflow:"hidden", background:"rgba(214,198,178,0.05)"}}>
                <img src={typeof post.coverImage === "object" ? post.coverImage.url : post.coverImage} alt={post.title} style={{width:"100%", height:"100%", objectFit:"cover"}} loading="lazy" width={300} height={300} />
              </div>
            )}
            <div style={{padding:"1.25rem"}}>
              <h3 style={{fontSize:"1.05rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0.5rem", lineHeight:1.4}}>{post.title}</h3>
              {post.excerpt && <p style={{fontSize:"0.88rem", color:"rgba(214,198,178,0.92)", lineHeight:1.6}}>{post.excerpt.slice(0, 120)}...</p>}
              <div style={{marginTop:"0.75rem", fontSize:"0.8rem", color:"#E68863"}}>Читать →</div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
