"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function BlogEditor({ params }: { params: Promise<{ id: string }> }) {
  const [postId, setPostId] = useState("");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => setPostId(p.id));
  }, [params]);

  useEffect(() => {
    if (!postId) return;
    fetch("/api/blog-posts/" + postId)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
          return;
        }
        setPost(data);
        setTimeout(() => {
          if (editorRef.current && data.content) {
            editorRef.current.innerHTML = data.content;
          }
        }, 100);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!post || !editorRef.current) return;
    setSaving(true);
    setSaved(false);
    // Token is now in httpOnly cookie; for admin API calls we fetch it via /api/auth/me
    const meRes = await fetch("/api/auth/me");
    const meData = meRes.ok ? await meRes.json() : null;
    const token = meData?.user ? "from-cookie" : "";  // cookie will be sent automatically
    const html = editorRef.current.innerHTML;
    try {
      const res = await fetch("/api/blog-posts/" + postId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // auth_token cookie sent automatically
        },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: html,
          isPublished: post.isPublished,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D6C6B2", fontSize: "1.2rem" }}>Загрузка редактора...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#E68863", fontSize: "1.2rem" }}>Статья не найдена</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D0C0A", color: "#D6C6B2" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,12,10,0.95)", borderBottom: "1px solid rgba(214,198,178,0.12)", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/admin/blog-editor" style={{ color: "rgba(214,198,178,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>← Все статьи</a>
          <span style={{ color: "#E7DCCF", fontWeight: 600, fontSize: "0.95rem" }}>{showPreview ? "Предпросмотр" : "Редактор"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {saved && <span style={{ color: "#6DB89A", fontSize: "0.85rem" }}>✓ Сохранено</span>}
          <button onClick={() => setShowPreview(!showPreview)} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(214,198,178,0.08)", border: "1px solid rgba(214,198,178,0.15)", color: "#D6C6B2", cursor: "pointer", fontSize: "0.85rem" }}>{showPreview ? "✏️ Редактировать" : "👁 Предпросмотр"}</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", borderRadius: 8, background: saving ? "rgba(201,110,77,0.4)" : "#C96E4D", border: "none", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.9rem", fontWeight: 600 }}>{saving ? "Сохранение..." : "💾 Сохранить"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.4rem" }}>Заголовок</label>
          <input type="text" value={post.title || ""} onChange={(e) => setPost({ ...post, title: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "1.3rem", fontWeight: 700, outline: "none" }} />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.4rem" }}>Анонс</label>
          <textarea value={post.excerpt || ""} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} rows={2} style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#D6C6B2", fontSize: "0.95rem", outline: "none", resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" checked={post.isPublished || false} onChange={(e) => setPost({ ...post, isPublished: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#C96E4D" }} />
          <label style={{ color: "#D6C6B2", fontSize: "0.9rem", cursor: "pointer" }}>Статья опубликована</label>
        </div>
      </div>

      {!showPreview && (
        <>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem", position: "sticky", top: 56, zIndex: 50 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", padding: "0.5rem", background: "rgba(214,198,178,0.06)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 10, marginBottom: "0.5rem" }}>
              <ToolBtn onClick={() => exec("bold")} title="Жирный"><b>B</b></ToolBtn>
              <ToolBtn onClick={() => exec("italic")} title="Курсив"><i>I</i></ToolBtn>
              <ToolBtn onClick={() => exec("underline")} title="Подчёркнутый"><u>U</u></ToolBtn>
              <div style={{ width: 1, background: "rgba(214,198,178,0.15)", margin: "0 0.25rem" }} />
              <ToolBtn onClick={() => exec("formatBlock", "<h2>")} title="Заголовок H2">H2</ToolBtn>
              <ToolBtn onClick={() => exec("formatBlock", "<h3>")} title="Подзаголовок H3">H3</ToolBtn>
              <ToolBtn onClick={() => exec("formatBlock", "<p>")} title="Обычный текст">¶</ToolBtn>
              <div style={{ width: 1, background: "rgba(214,198,178,0.15)", margin: "0 0.25rem" }} />
              <ToolBtn onClick={() => exec("insertUnorderedList")} title="Маркированный список">• Список</ToolBtn>
              <ToolBtn onClick={() => exec("insertOrderedList")} title="Нумерованный список">1. Список</ToolBtn>
              <div style={{ width: 1, background: "rgba(214,198,178,0.15)", margin: "0 0.25rem" }} />
              <ToolBtn onClick={() => exec("formatBlock", "<blockquote>")} title="Цитата">❝ Цитата</ToolBtn>
              <ToolBtn onClick={() => { const u = prompt("URL ссылки:", "https://"); if (u) exec("createLink", u); }} title="Ссылка">🔗</ToolBtn>
              <ToolBtn onClick={() => { const u = prompt("URL изображения:", "https://"); if (u) exec("insertImage", u); }} title="Изображение">🖼</ToolBtn>
              <div style={{ width: 1, background: "rgba(214,198,178,0.15)", margin: "0 0.25rem" }} />
              <ToolBtn onClick={() => exec("undo")} title="Отменить">↶</ToolBtn>
              <ToolBtn onClick={() => exec("redo")} title="Повторить">↷</ToolBtn>
              <ToolBtn onClick={() => exec("removeFormat")} title="Очистить">✕</ToolBtn>
            </div>
          </div>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
            <div ref={editorRef} contentEditable suppressContentEditableWarning style={{ minHeight: 500, padding: "2rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 12, outline: "none", color: "#D6C6B2", fontSize: "1rem", lineHeight: 1.8, fontFamily: "Inter, system-ui, sans-serif" }} data-editor="content" />
          </div>
        </>
      )}

      {showPreview && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem" }}>{post.title}</h1>
          {post.excerpt && <p style={{ fontSize: "1.1rem", color: "rgba(214,198,178,0.7)", marginBottom: "2rem", fontStyle: "italic" }}>{post.excerpt}</p>}
          <div style={{ color: "#D6C6B2", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || post.content || "" }} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: '[data-editor="content"] h2{font-size:1.5rem;font-weight:700;color:#E7DCCF;margin:2rem 0 1rem;padding-bottom:0.5rem;border-bottom:2px solid rgba(230,136,99,0.3)}[data-editor="content"] h3{font-size:1.2rem;font-weight:600;color:#E68863;margin:1.5rem 0 0.75rem}[data-editor="content"] p{margin:0 0 1rem}[data-editor="content"] ul,[data-editor="content"] ol{margin:0 0 1rem 1.5rem}[data-editor="content"] li{margin-bottom:0.5rem}[data-editor="content"] blockquote{border-left:3px solid rgba(230,136,99,0.4);padding:0.5rem 0 0.5rem 1.5rem;margin:1.5rem 0;color:rgba(214,198,178,0.8);font-style:italic;background:rgba(230,136,99,0.05);border-radius:0 8px 8px 0}[data-editor="content"] a{color:#E68863;text-decoration:underline}[data-editor="content"] img{max-width:100%;border-radius:12px;margin:1rem 0}[data-editor="content"]:focus{border-color:rgba(230,136,99,0.3)!important}[data-editor="content"]:empty:before{content:"Начните печатать...";color:rgba(214,198,178,0.3)}' }} />
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return <button onClick={onClick} title={title} style={{ padding: "0.4rem 0.7rem", borderRadius: 6, background: "rgba(214,198,178,0.05)", border: "1px solid transparent", color: "#D6C6B2", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, minWidth: 36, textAlign: "center" }}>{children}</button>;
}
