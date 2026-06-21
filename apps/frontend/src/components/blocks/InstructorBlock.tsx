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
        <div style={{
          display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem",
          alignItems: "center",
          padding: "2rem", background: "rgba(214,198,178,0.04)",
          border: "1px solid rgba(214,198,178,0.12)", borderRadius: 16,
        }}>
          {data.photo?.url && (
            <img
              src={data.photo.url}
              alt={data.photoAlt || data.photo.alt || data.name}
              style={{
                width: 200, height: 200, borderRadius: 14, objectFit: "cover",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
              loading="lazy"
            />
          )}
          <div>
            <Reveal><h3 style={{ color: "#E7DCCF", fontSize: "1.4rem", marginBottom: "1rem", fontWeight: 700 }}>
              {data.name}
            </h3></Reveal>
            {data.facts && data.facts.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {data.facts.map((f, i) => (
                  <li key={i} style={{
                    color: "rgba(214,198,178,0.85)",
                    fontSize: "0.95rem",
                    padding: "0.4rem 0 0.4rem 1.5rem",
                    position: "relative",
                    lineHeight: 1.6,
                  }}>
                    <span style={{ position: "absolute", left: 0, color: "#E68863", fontWeight: 700 }}>•</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
