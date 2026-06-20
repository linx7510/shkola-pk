"use client";
import { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export default function FaqListClient({ items }: { items: FaqItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[];
  const filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items;

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "calc(var(--header-h) + 2rem)", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-px)" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="heading-sweep" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#D6C6B2", marginBottom: "1rem" }}>
            Часто задаваемые вопросы
          </h1>
          <p style={{ color: "rgba(214,198,178,0.6)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Ответы на популярные вопросы о потребительских кооперативах
          </p>
        </div>

        {categories.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "0.85rem",
              border: `1px solid ${!activeCategory ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
              background: !activeCategory ? "rgba(230,136,99,0.1)" : "transparent",
              color: !activeCategory ? "#E68863" : "rgba(214,198,178,0.6)",
            }}>
              Все
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "0.85rem",
                border: `1px solid ${activeCategory === cat ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
                background: activeCategory === cat ? "rgba(230,136,99,0.1)" : "transparent",
                color: activeCategory === cat ? "#E68863" : "rgba(214,198,178,0.6)",
              }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(214,198,178,0.03)",
                border: "1px solid rgba(214,198,178,0.08)",
                borderRadius: 10,
                marginBottom: "0.5rem",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                style={{
                  width: "100%",
                  padding: "1rem 1.25rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#D6C6B2",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <span>{item.question}</span>
                <span style={{ fontSize: "1.2rem", transition: "transform 0.2s", transform: openId === item.id ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
              </button>
              {openId === item.id && (
                <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.65)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(214,198,178,0.4)", padding: "4rem 0" }}>
              Вопросы не найдены
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
