"use client";
import { useState, useEffect } from "react";

interface FaqItem { id: string; question: string; answer: string; category: string | null; isPublished: boolean; order: number; }

export default function AdminFaqsPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "", order: 0, isPublished: true });
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/faqs?published=false", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    const url = editId ? `/api/faqs/${editId}` : "/api/faqs";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setEditId(null); setForm({ question: "", answer: "", category: "", order: 0, isPublished: true }); load(); }
    else { const d = await res.json(); alert(d.error || "Ошибка"); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Удалить вопрос?")) return;
    await fetch(`/api/faqs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    load();
  };

  const inputStyle = { width: "100%", padding: "0.5rem 0.7rem", borderRadius: 6, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)", color: "#D6C6B2", fontSize: "0.85rem" } as React.CSSProperties;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D6C6B2" }}>FAQ</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ question: "", answer: "", category: "", order: 0, isPublished: true }); }} className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>
          + Новый вопрос
        </button>
      </div>

      {showForm && (
        <div style={{ padding: "1rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8, marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input style={inputStyle} placeholder="Вопрос" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
          <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Ответ" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "center" }}>
            <input style={inputStyle} placeholder="Категория" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <input style={{ ...inputStyle, width: 60 }} type="number" placeholder="Порядок" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
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
          {items.map(item => (
            <div key={item.id} style={{ padding: "0.75rem 1rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 4, background: item.isPublished ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.15)", color: item.isPublished ? "#81C784" : "#FFB74D" }}>
                  {item.isPublished ? "Опубл." : "Черновик"}
                </span>
                <span style={{ fontWeight: 600, color: "#D6C6B2", flex: 1 }}>{item.question}</span>
                <button onClick={() => { setEditId(item.id); setShowForm(true); setForm({ question: item.question, answer: item.answer, category: item.category || "", order: item.order, isPublished: item.isPublished }); }} style={{ background: "none", border: "none", color: "#E68863", cursor: "pointer", fontSize: "0.8rem" }}>Ред.</button>
                <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", color: "#EF5350", cursor: "pointer", fontSize: "0.8rem" }}>Удалить</button>
              </div>
              <p style={{ color: "rgba(214,198,178,0.4)", fontSize: "0.85rem", margin: 0 }}>{item.answer.substring(0, 120)}...</p>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: "rgba(214,198,178,0.4)" }}>Нет вопросов</p>}
        </div>
      )}
    </div>
  );
}
