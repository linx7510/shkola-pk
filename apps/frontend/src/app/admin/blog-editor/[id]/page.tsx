"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * WYSIWYG-редактор статей блога.
 * URL: /admin/blog-editor/[id]
 *
 * Визуальный редактор с toolbar (как в Word):
 * - Жирный, курсив, подчёркнутый
 * - Заголовки H2, H3
 * - Списки (маркированный, нумерованный)
 * - Цитата
 * - Ссылка
 * - Предпросмотр
 *
 * Не требует знания HTML. Контент сохраняется как HTML-строка в Payload CMS.
 */

const PAYLOAD_API = process.env.NEXT_PUBLIC_PAYLOAD_URL || "https://2980738.ru";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
  publishedAt: string;
  meta?: { title?: string; description?: string };
}

export default function BlogEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [postId, setPostId] = useState<string>("");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => setPostId(p.id));
  }, [params]);

  // Загрузка статьи
  useEffect(() => {
    if (!postId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`/api/blog-posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPost(data);
          // Устанавливаем контент в редактор
          setTimeout(() => {
            if (editorRef.current && data.content) {
              editorRef.current.innerHTML = data.content;
            }
          }, 100);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить статью");
        setLoading(false);
      });
  }, [postId, router]);

  // Команды форматирования
  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const insertHTML = useCallback((html: string) => {
    document.execCommand("insertHTML", false, html);
    editorRef.current?.focus();
  }, []);

  // Сохранение
  const handleSave = async () => {
    if (!post || !editorRef.current) return;
    setSaving(true);
    setSaved(false);
    const token = localStorage.getItem("token");
    const content = editorRef.current.innerHTML;

    try {
      const res = await fetch(`/api/blog-posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: content,
          isPublished: post.isPublished,
          meta: post.meta,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Ошибка сохранения");
      }
    } catch {
      setError("Ошибка сети при сохранении");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D6C6B2", fontSize: "1.2rem" }}>Загрузка редактора...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <div style={{ color: "#E68863", fontSize: "1.2rem" }}>{error}</div>
        <a href="/admin/blog-editor" style={{ color: "#E68863", textDecoration: "none" }}>← К списку статей</a>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0C0A", color: "#D6C6B2" }}>
      {/* Топбар */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,12,10,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(214,198,178,0.12)",
        padding: "0.75rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/admin/blog-editor" style={{ color: "rgba(214,198,178,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>← Все статьи</a>
          <span style={{ color: "#E7DCCF", fontWeight: 600, fontSize: "0.95rem" }}>
            {showPreview ? "Предпросмотр" : "Редактор"} · {post.title.slice(0, 40)}{post.title.length > 40 ? "..." : ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {saved && <span style={{ color: "#6DB89A", fontSize: "0.85rem" }}>✓ Сохранено</span>}
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8,
              background: "rgba(214,198,178,0.08)", border: "1px solid rgba(214,198,178,0.15)",
              color: "#D6C6B2", cursor: "pointer", fontSize: "0.85rem",
            }}
          >
            {showPreview ? "✏️ Редактировать" : "👁 Предпросмотр"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.5rem 1.5rem", borderRadius: 8,
              background: saving ? "rgba(201,110,77,0.4)" : "#C96E4D",
              border: "none", color: "#fff", cursor: saving ? "not-allowed" : "pointer",
              fontSize: "0.9rem", fontWeight: 600,
            }}
          >
            {saving ? "Сохранение..." : "💾 Сохранить"}
          </button>
        </div>
      </div>

      {/* Поля метаданных */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Заголовок */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Заголовок</label>
          <input
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            style={{
              width: "100%", padding: "0.75rem 1rem",
              background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)",
              borderRadius: 10, color: "#E7DCCF", fontSize: "1.3rem", fontWeight: 700,
              outline: "none",
            }}
          />
        </div>

        {/* Анонс */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Анонс (краткое описание)</label>
          <textarea
            value={post.excerpt || ""}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            rows={2}
            style={{
              width: "100%", padding: "0.75rem 1rem",
              background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)",
              borderRadius: 10, color: "#D6C6B2", fontSize: "0.95rem",
              outline: "none", resize: "vertical",
            }}
          />
        </div>

        {/* Опубликован */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={post.isPublished || false}
            onChange={(e) => setPost({ ...post, isPublished: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: "#C96E4D" }}
          />
          <label style={{ color: "#D6C6B2", fontSize: "0.9rem", cursor: "pointer" }}>Статья опубликована</label>
        </div>
      </div>

      {/* WYSIWYG редактор */}
      {!showPreview && (
        <>
          {/* Toolbar */}
          <div style={{
            maxWidth: 900, margin: "0 auto", padding: "0 1.5rem",
            position: "sticky", top: 56, zIndex: 50,
          }}>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "0.3rem",
              padding: "0.5rem", background: "rgba(214,198,178,0.06)",
              border: "1px solid rgba(214,198,178,0.12)", borderRadius: 10,
              marginBottom: "0.5rem",
            }}>
              <ToolButton onClick={() => exec("bold")} title="Жирный (Ctrl+B)">
                <b>B</b>
              </ToolButton>
              <ToolButton onClick={() => exec("italic")} title="Курсив (Ctrl+I)">
                <i>I</i>
              </ToolButton>
              <ToolButton onClick={() => exec("underline")} title="Подчёркнутый (Ctrl+U)">
                <u>U</u>
          </ToolButton>
              <Divider />
              <ToolButton onClick={() => exec("formatBlock", "<h2>")} title="Заголовок H2">
                H2
              </ToolButton>
              <ToolButton onClick={() => exec("formatBlock", "<h3>")} title="Подзаголовок H3">
                H3
              </ToolButton>
              <ToolButton onClick={() => exec("formatBlock", "<p>")} title="Обычный текст">
                ¶
              </ToolButton>
              <Divider />
              <ToolButton onClick={() => exec("insertUnorderedList")} title="Маркированный список">
                • Список
              </ToolButton>
              <ToolButton onClick={() => exec("insertOrderedList")} title="Нумерованный список">
                1. Список
              </ToolButton>
              <Divider />
              <ToolButton onClick={() => exec("formatBlock", "<blockquote>")} title="Цитата">
                ❝ Цитата
              </ToolButton>
              <ToolButton
                onClick={() => {
                  const url = prompt("Введите URL ссылки:", "https://");
                  if (url) exec("createLink", url);
                }}
                title="Вставить ссылку"
              >
                🔗
              </ToolButton>
              <ToolButton
                onClick={() => {
                  const url = prompt("Введите URL изображения:", "https://");
                  if (url) exec("insertImage", url);
                }}
                title="Вставить изображение"
              >
                🖼
              </ToolButton>
              <Divider />
              <ToolButton onClick={() => exec("undo")} title="Отменить (Ctrl+Z)">
                ↶
              </ToolButton>
              <ToolButton onClick={() => exec("redo")} title="Повторить">
                ↷
              </ToolButton>
              <ToolButton onClick={() => exec("removeFormat")} title="Очистить форматирование">
                ✕
              </ToolButton>
            </div>
          </div>

          {/* Редактируемая область */}
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => { /* контент сохраняется в DOM */ }}
              style={{
                minHeight: 500,
                padding: "2rem",
                background: "rgba(214,198,178,0.04)",
                border: "1px solid rgba(214,198,178,0.12)",
                borderRadius: 12,
                outline: "none",
                color: "#D6C6B2",
                fontSize: "1rem",
                lineHeight: 1.8,
                fontFamily: "Inter, system-ui, sans-serif",
              }}
              // Стили для контента внутри редактора
              data-editor="content"
            />
          </div>
        </>
      )}

      {/* Предпросмотр */}
      {showPreview && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem" }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ fontSize: "1.1rem", color: "rgba(214,198,178,0.7)", marginBottom: "2rem", fontStyle: "italic" }}>
              {post.excerpt}
            </p>
          )}
          <div
            style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1rem" }}
            dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || post.content || "" }}
          />
        </div>
      )}

      {/* Стили для контента внутри contentEditable */}
      <style dangerouslySetInnerHTML={{ __html: `
        [data-editor="content"] h2 {
          font-size: 1.5rem; font-weight: 700; color: #E7DCCF;
          margin: 2rem 0 1rem; padding-bottom: 0.5rem;
          border-bottom: 2px solid rgba(230,136,99,0.3);
        }
        [data-editor="content"] h3 {
          font-size: 1.2rem; font-weight: 600; color: #E68863;
          margin: 1.5rem 0 0.75rem;
        }
        [data-editor="content"] p {
          margin: 0 0 1rem;
        }
        [data-editor="content"] ul, [data-editor="content"] ol {
          margin: 0 0 1rem 1.5rem;
        }
        [data-editor="content"] li {
          margin-bottom: 0.5rem;
        }
        [data-editor="content"] blockquote {
          border-left: 3px solid rgba(230,136,99,0.4);
          padding: 0.5rem 0 0.5rem 1.5rem;
          margin: 1.5rem 0;
          color: rgba(214,198,178,0.8);
          font-style: italic;
          background: rgba(230,136,99,0.05);
          border-radius: 0 8px 8px 0;
        }
        [data-editor="content"] a {
          color: #E68863; text-decoration: underline;
        }
        [data-editor="content"] img {
          max-width: 100%; border-radius: 12px; margin: 1rem 0;
        }
        [data-editor="content"]:focus {
          border-color: rgba(230,136,99,0.3) !important;
        }
        [data-editor="content"]:empty:before {
          content: "Начните печатать текст статьи...";
          color: rgba(214,198,178,0.3);
        }
      `}} />
    </div>
  );
}

// Кнопка тулбара
function ToolButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "0.4rem 0.7rem", borderRadius: 6,
        background: "rgba(214,198,178,0.05)", border: "1px solid transparent",
        color: "#D6C6B2", cursor: "pointer", fontSize: "0.85rem",
        fontWeight: 600, minWidth: 36, textAlign: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(230,136,99,0.15)";
        e.currentTarget.style.borderColor = "rgba(230,136,99,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(214,198,178,0.05)";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, background: "rgba(214,198,178,0.15)", margin: "0 0.25rem" }} />;
}
