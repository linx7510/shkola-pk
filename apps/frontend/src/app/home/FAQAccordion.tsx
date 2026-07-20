"use client";
import { useState } from "react";
import Reveal from "@/components/Reveal";

interface FAQItem {
  q: string;
  a: string;
}

/**
 * FAQAccordion — клиентский компонент для FAQ секции
 * Вынесен из HomePageClient для code splitting
 */
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {items.map((item, i) => (
        <Reveal key={i}>
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(214,198,178,0.04)",
              border: "1px solid rgba(214,198,178,0.12)",
              borderRadius: 12,
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#E7DCCF",
                  margin: 0,
                }}
              >
                {item.q}
              </h3>
              <span
                style={{
                  fontSize: "1.5rem",
                  color: "#E68863",
                  transition: "transform 0.3s",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  flexShrink: 0,
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <p
                style={{
                  fontSize: "0.92rem",
                  color: "rgba(214,198,178,0.9)",
                  lineHeight: 1.8,
                  marginTop: "1rem",
                  marginBottom: 0,
                }}
              >
                {item.a}
              </p>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
