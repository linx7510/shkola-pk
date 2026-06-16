"use client";
import { useState, useEffect } from "react";

interface GlossaryTerm { id: string; term: string; slug: string; definition: string; category: string | null; isPublished: boolean; }

export default function AdminGlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ term: "", slug: "", definition: "", extendedContent: "", category: "", isPublished: true });
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/glossary?published=false", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => setTerms(data.terms || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    const url = editId ? `/api/glossary/${form.slug}` : "/api/glossary";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setEditId(null); setForm({ term: "", slug: "", definition: "", extendedContent: "", category: "", isPublished: true }); load(); }
    else { const d = await res.json(); alert(d.error || "Ошибка"); }
  };

  const deleteTerm = async (slug: string) => {
    if (!confirm("Удалить термин?")) return;
    await fetch(`/api/glossary/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    load();
  };

  const inputStyle = { width: "100%", padding: "0.5rem 0.7rem", borderRadius: 6, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)", color: "#D6C6B2", fontSize: "0.85rem" } as React.CSSProperties;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D6C6B2" }}>Глоссарий</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ term: "", slug: "", definition: "", extendedContent: "", category: "", isPublished: true }); }} className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>
          + Новый термин
        </button>
      </div>

      {showForm && (
        <div style={{ padding: "1rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8, marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <input style={inputStyle} placeholder="Термин" value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} />
            <input style={inputStyle} placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </div>
          <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Определение" value={form.definition} onChange={e => setForm(f => ({ ...f, definition: e.target.value }))} />
          <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Расширенное описание (HTML)" value={form.extendedContent} onChange={e => setForm(f => ({ ...f, extendedContent: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "center" }}>
            <input style={inputStyle} placeholder="Категория" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#D6C6B2", fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} /> Опубликовано
            </label>
          </div>
          <button onClick={save} className="btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem", alignSelf: "flex-start" }}>
            {editId ? "Обновить" : "Создать"}
          </button>
        </div>
      )}

      {loading ? <p style={{ color: "rgba(214,198,178,0.4)" }}>Загрузка...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {terms.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8 }}>
              <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 4, background: t.isPublished ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.15)", color: t.isPublished ? "#81C784" : "#FFB74D" }}>
                {t.isPublished ? "Опубл." : "Черновик"}
              </span>
              <span style={{ fontWeight: 600, color: "#D6C6B2", minWidth: 120 }}>{t.term}</span>
              <span style={{ flex: 1, color: "rgba(214,198,178,0.5)", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.definition}</span>
              <button onClick={() => deleteTerm(t.slug)} style={{ background: "none", border: "none", color: "#EF5350", cursor: "pointer", fontSize: "0.8rem" }}>Удалить</button>
            </div>
          ))}
          {terms.length === 0 && <p style={{ color: "rgba(214,198,178,0.4)" }}>Нет терминов</p>}
        </div>
      )}
    </div>
  );
}
