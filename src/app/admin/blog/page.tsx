"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPost { id: string; title: string; slug: string; isPublished: boolean; category: string | null; createdAt: string; }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/blog?published=false&limit=100", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const togglePublish = async (slug: string, isPublished: boolean) => {
    await fetch(`/api/blog/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    load();
  };

  const deletePost = async (slug: string) => {
    if (!confirm("Удалить статью?")) return;
    await fetch(`/api/blog/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D6C6B2" }}>Блог</h1>
        <Link href="/admin/blog/new" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>
          + Новая статья
        </Link>
      </div>

      {loading ? <p style={{ color: "rgba(214,198,178,0.4)" }}>Загрузка...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {posts.map(post => (
            <div key={post.id} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "0.75rem 1rem", background: "rgba(214,198,178,0.03)",
              border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8,
            }}>
              <span style={{
                fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 4,
                background: post.isPublished ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.15)",
                color: post.isPublished ? "#81C784" : "#FFB74D",
              }}>
                {post.isPublished ? "Опубликована" : "Черновик"}
              </span>
              <span style={{ flex: 1, color: "#D6C6B2", fontSize: "0.9rem" }}>{post.title}</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(214,198,178,0.3)" }}>{post.category}</span>
              <Link href={`/admin/blog/${post.id}/edit`} style={{ fontSize: "0.8rem", color: "#E68863", textDecoration: "none" }}>
                Редактировать
              </Link>
              <button onClick={() => togglePublish(post.slug, post.isPublished)} style={{ background: "none", border: "none", color: "rgba(214,198,178,0.5)", cursor: "pointer", fontSize: "0.8rem" }}>
                {post.isPublished ? "Скрыть" : "Опубликовать"}
              </button>
              <button onClick={() => deletePost(post.slug)} style={{ background: "none", border: "none", color: "#EF5350", cursor: "pointer", fontSize: "0.8rem" }}>
                Удалить
              </button>
            </div>
          ))}
          {posts.length === 0 && <p style={{ color: "rgba(214,198,178,0.4)" }}>Нет статей</p>}
        </div>
      )}
    </div>
  );
}
