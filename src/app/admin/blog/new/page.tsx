"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", coverImage: "", category: "",
    tags: "", isPublished: false, metaTitle: "", metaDescription: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/blog?published=false&limit=100`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(r => r.json())
        .then(data => {
          const post = (data.posts || []).find((p: any) => p.id === params.id);
          if (post) {
            setForm({
              title: post.title || "", slug: post.slug || "", excerpt: post.excerpt || "",
              content: post.content || "", coverImage: post.coverImage || "",
              category: post.category || "", tags: post.tags || "",
              isPublished: post.isPublished || false, metaTitle: post.metaTitle || "",
              metaDescription: post.metaDescription || "",
            });
          }
        });
    }
  }, [isEdit, params?.id]);

  const generateSlug = () => {
    const slug = form.title.toLowerCase()
      .replace(/[а-яё]/g, (c) => {
        const map: Record<string, string> = {
          'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
          'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
          'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
          'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
        };
        return map[c] || c;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setForm(f => ({ ...f, slug }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = isEdit ? `/api/blog/${form.slug}` : "/api/blog";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/admin/blog");
      else { const d = await res.json(); alert(d.error || "Ошибка"); }
    } catch { alert("Ошибка сохранения"); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8,
    border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)",
    color: "#D6C6B2", fontSize: "0.9rem",
  } as React.CSSProperties;

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D6C6B2", marginBottom: "1.5rem" }}>
        {isEdit ? "Редактировать статью" : "Новая статья"}
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Заголовок</label>
          <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onBlur={generateSlug} />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Slug (URL)</label>
          <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Анонс</label>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Содержание (HTML)</label>
          <textarea style={{ ...inputStyle, minHeight: 300, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Категория</label>
            <input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Образование, Право..." />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Теги (через запятую)</label>
            <input style={inputStyle} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", marginBottom: "0.3rem", display: "block" }}>Обложка (URL)</label>
          <input style={inputStyle} value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} />
        </div>

        <div style={{ padding: "1rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8 }}>
          <h3 style={{ color: "#D6C6B2", fontSize: "0.9rem", marginBottom: "0.75rem" }}>SEO</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input style={inputStyle} value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} placeholder="Meta Title" />
            <textarea style={{ ...inputStyle, minHeight: 50 }} value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} placeholder="Meta Description" />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#D6C6B2", fontSize: "0.9rem", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
            Опубликовать
          </label>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
            {saving ? "Сохранение..." : isEdit ? "Обновить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}
