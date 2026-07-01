import Link from "next/link"
import Reveal from "@/components/Reveal"

export interface InstructorBlockData {
  title?: string
  name: string
  photo?: { url: string; alt?: string } | null
  photoAlt?: string
  facts?: Array<{ text: string }>
}

export function InstructorBlock({ data }: { data: InstructorBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {data.title && (
          <Reveal><h2 className="heading-sweep" style={{ fontSize: "1.8rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
            {data.title}
          </h2></Reveal>
        )}
        {/*
          Desktop: grid auto 1fr — фото слева, текст справа
          Mobile: flex column — заголовок → фото → список (через CSS media query)
          Microdata: itemscope/itemtype на обёртке Person, itemprop на name/image/jobTitle
        */}
        <div
          className="instructor-layout"
          itemScope
          itemType="https://schema.org/Person"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "2rem",
            alignItems: "center",
            padding: "2rem",
            background: "rgba(214,198,178,0.04)",
            border: "1px solid rgba(214,198,178,0.12)",
            borderRadius: 16,
          }}
        >
          {/* Фото — на desktop слева, на mobile по центру под заголовком */}
          {data.photo?.url && (
            <img
              src={data.photo.url}
              alt={data.photoAlt || data.photo?.alt || data.name}
              itemProp="image"
              width={200}
              height={200}
              style={{
                width: 200,
                height: 200,
                borderRadius: 14,
                objectFit: "cover",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
              loading="lazy"
            />
          )}
          <div>
            <Reveal>
              <h3 itemProp="name" style={{ color: "#E7DCCF", fontSize: "1.4rem", marginBottom: "1rem", fontWeight: 700 }}>
                {data.name}
              </h3>
            </Reveal>
            {data.facts && data.facts.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {data.facts.map((f, i) => (
                  <li
                    key={i}
                    itemProp="knowsAbout"
                    style={{
                      color: "rgba(214,198,178,0.9)",
                      fontSize: "1.05rem",
                      padding: "0.4rem 0 0.4rem 1.5rem",
                      position: "relative",
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: "#E68863", fontWeight: 700 }}>•</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* CSS для мобильных — переставляет порядок: заголовок → фото → список */}
      <style>{`
        @media (max-width: 768px) {
          .instructor-layout {
            display: flex !important;
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
          }
          .instructor-layout img {
            width: 160px !important;
            height: 160px !important;
          }
          .instructor-layout ul {
            text-align: left !important;
          }
        }
      `}</style>
    </section>
  )
}
