"use client"
import { useState } from "react"

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqBlockData {
  title?: string
  items: FaqItem[]
}

export function FaqBlock({ data }: { data: FaqBlockData }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
      {data.title && (
        <h2 style={{ fontSize: "2rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
          {data.title}
        </h2>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.items.map((item, i) => (
          <div key={i} style={{
            background: "rgba(214,198,178,0.04)",
            border: "1px solid rgba(214,198,178,0.12)",
            borderRadius: 10, overflow: "hidden",
          }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%", padding: "1rem 1.25rem",
                background: "transparent", border: "none",
                color: "#E7DCCF", fontSize: "1rem", fontWeight: 600,
                textAlign: "left", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              {item.question}
              <span style={{ color: "#C96E4D", fontSize: "1.4rem" }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.85)", fontSize: "0.92rem", lineHeight: 1.7 }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
