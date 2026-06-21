"use client";
import { useState } from "react";

interface GlossaryTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category: string | null;
}

export default function GlossaryListClient({ terms }: { terms: GlossaryTerm[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(terms.map((t) => t.category).filter(Boolean))] as string[];
  const filtered = terms.filter((t) => {
    const matchSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = filtered.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "calc(var(--header-h) + 2rem)", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-px)" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="heading-sweep" data-text="Глоссарий ПК" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#D6C6B2", marginBottom: "1rem" }}>
            Глоссарий ПК
          </h1>
          <p style={{ color: "rgba(214,198,178,0.6)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Ключевые термины и понятия потребительской кооперации
          </p>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          <input
            type="text"
            placeholder="Поиск терминов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              border: "1px solid rgba(214,198,178,0.12)",
              background: "rgba(214,198,178,0.04)",
              color: "#D6C6B2",
              fontSize: "1rem",
              outline: "none",
            }}
          />
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
          {Object.keys(grouped).sort().map((letter) => (
            <div key={letter} style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E68863", marginBottom: "0.75rem" }}>{letter}</h2>
              {grouped[letter].map((term) => (
                <div
                  key={term.id}
                  style={{
                    background: "rgba(214,198,178,0.03)",
                    border: "1px solid rgba(214,198,178,0.08)",
                    borderRadius: 10,
                    padding: "1rem 1.25rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#D6C6B2", marginBottom: "0.4rem" }}>{term.term}</h3>
                  <p style={{ fontSize: "0.9rem", color: "rgba(214,198,178,0.6)", lineHeight: 1.6, margin: 0 }}>{term.definition}</p>
                </div>
              ))}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(214,198,178,0.4)", padding: "4rem 0" }}>
              Термины не найдены
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
