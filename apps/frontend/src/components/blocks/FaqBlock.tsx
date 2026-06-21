"use client"
import Reveal from "@/components/Reveal"
import { useState } from "react"

export interface FaqItem {
  question: string
  answer: any  // Can be string OR Lexical JSON object
}

export interface FaqBlockData {
  title?: string
  items: FaqItem[]
}

// Helper to extract plain text from Lexical JSON
function lexicalToText(node: any): string {
  if (!node) return ""
  if (typeof node === "string") return node
  if (node.text) return node.text
  if (node.root) return lexicalToText(node.root)
  if (node.children && Array.isArray(node.children)) {
    return node.children.map((c: any) => lexicalToText(c)).join(" ")
  }
  return ""
}

export function FaqBlock({ data }: { data: FaqBlockData }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
      {data.title && (
        <Reveal>
          <h2
            className="section-title heading-sweep"
            data-text={data.title}
            style={{
              fontSize: "2rem",
              color: "#E7DCCF",
              textAlign: "center",
              marginBottom: "2rem",
              fontWeight: 700,
            }}
          >
            {data.title}
          </h2>
        </Reveal>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {(data.items || []).map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(214,198,178,0.04)",
              border: "1px solid rgba(214,198,178,0.12)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                padding: "1rem 1.25rem",
                background: "transparent",
                border: "none",
                color: "#E7DCCF",
                fontSize: "1rem",
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {item.question}
              <span style={{ color: "#C96E4D", fontSize: "1.4rem" }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div
                style={{
                  padding: "0 1.25rem 1rem",
                  color: "rgba(214,198,178,0.85)",
                  fontSize: "0.92rem",
                  lineHeight: 1.7,
                }}
              >
                {lexicalToText(item.answer)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
