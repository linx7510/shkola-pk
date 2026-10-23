"use client";
import { useState } from "react";
import Link from "next/link";

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

  // Алфавит полной базы (не фильтра) — навигация не «прыгает» при поиске
  const allLetters = [...new Set(terms.map((t) => t.term[0].toUpperCase()))].sort((a, b) => a.localeCompare(b, "ru"));
  const anchorStyle = { scrollMarginTop: "80px" } as const;

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "0", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-px)" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="heading-sweep" data-text="Глоссарий ПК" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#D6C6B2", marginBottom: "1rem" }}>
            Глоссарий ПК
          </h1>
          <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
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
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "1.05rem",
              border: `1px solid ${!activeCategory ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
              background: !activeCategory ? "rgba(230,136,99,0.1)" : "transparent",
              color: !activeCategory ? "#E68863" : "rgba(214,198,178,0.75)",
            }}>
              Все
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "1.05rem",
                border: `1px solid ${activeCategory === cat ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
                background: activeCategory === cat ? "rgba(230,136,99,0.1)" : "transparent",
                color: activeCategory === cat ? "#E68863" : "rgba(214,198,178,0.75)",
              }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Якорная навигация по алфавиту */}
        <nav aria-label="Навигация по алфавиту" style={{ display: "flex", gap: "0.35rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
          {allLetters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${encodeURIComponent(letter)}`}
              onClick={() => { setSearch(""); setActiveCategory(null); }}
              style={{
                width: "2rem", height: "2rem", display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: 8, fontSize: "1rem", textDecoration: "none",
                border: "1px solid rgba(214,198,178,0.15)", color: "rgba(214,198,178,0.75)",
              }}
            >
              {letter}
            </a>
          ))}
        </nav>

        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {Object.keys(grouped).sort((a, b) => a.localeCompare(b, "ru")).map((letter) => (
            <div key={letter} id={`letter-${letter}`} style={{ marginBottom: "2rem", ...anchorStyle }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E68863", marginBottom: "0.75rem" }}>{letter}</h2>
              {grouped[letter].map((term) => (
                <div
                  key={term.id}
                  id={`t-${term.slug}`}
                  style={{
                    background: "rgba(214,198,178,0.03)",
                    border: "1px solid rgba(214,198,178,0.08)",
                    borderRadius: 10,
                    padding: "1rem 1.25rem",
                    marginBottom: "0.5rem",
                    ...anchorStyle,
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#D6C6B2", marginBottom: "0.4rem" }}>
                    <Link href={`/glossary/${term.slug}`} prefetch={false} style={{ color: "#D6C6B2", textDecoration: "none" }}>{term.term}</Link>
                  </h3>
                  <p style={{ fontSize: "1rem", color: "rgba(214,198,178,0.75)", lineHeight: 1.6, margin: 0 }}>{term.definition}</p>
                </div>
              ))}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(214,198,178,0.65)", padding: "4rem 0" }}>
              Термины не найдены
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
