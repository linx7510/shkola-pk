"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlogEditorList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch posts — API works without auth for published posts
    fetch('/api/blog-posts?limit=100&sort=-publishedAt')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.docs || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить статьи');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0C0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#D6C6B2', fontSize: '1.2rem' }}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0C0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#E68863', fontSize: '1.2rem' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0C0A', color: '#D6C6B2' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,12,10,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(214,198,178,0.12)',
        padding: '0.75rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#E7DCCF' }}>
          📝 Редактор статей блога
        </h1>
        <a href='/admin' style={{ color: 'rgba(214,198,178,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← В админку
        </a>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ color: 'rgba(214,198,178,0.75)', fontSize: '0.9rem' }}>
            Всего статей: {posts.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={'/admin/blog-editor/' + post.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: 'rgba(214,198,178,0.04)',
                border: '1px solid rgba(214,198,178,0.1)',
                borderRadius: 10,
                textDecoration: 'none', color: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(214,198,178,0.08)';
                e.currentTarget.style.borderColor = 'rgba(230,136,99,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(214,198,178,0.04)';
                e.currentTarget.style.borderColor = 'rgba(214,198,178,0.1)';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1rem', fontWeight: 600, color: '#E7DCCF',
                  marginBottom: '0.25rem',
                }}>
                  {post.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.8)' }}>
                  /blog/{post.slug}
                  {post.isPublished ? ' · ✅ Опубликована' : ' · 📝 Черновик'}
                  {post.publishedAt && ' · ' + new Date(post.publishedAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div style={{ color: '#E68863', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Редактировать →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
