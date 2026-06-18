import Link from "next/link"

export interface CtaBlockData {
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

export function CtaBlock({ data }: { data: CtaBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "2.5rem",
        background: "linear-gradient(135deg, rgba(201,110,77,0.15), rgba(214,198,178,0.05))",
        border: "1px solid rgba(201,110,77,0.3)", borderRadius: 16, textAlign: "center",
      }}>
        <h2 style={{ fontSize: "1.8rem", color: "#F5F0E8", marginBottom: "0.75rem", fontWeight: 700 }}>{data.title}</h2>
        {data.subtitle && (
          <p style={{ color: "rgba(214,198,178,0.85)", fontSize: "1.05rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            {data.subtitle}
          </p>
        )}
        {data.ctaText && data.ctaLink && (
          <Link href={data.ctaLink} style={{
            display: "inline-block", padding: "0.85rem 2rem",
            background: "#C96E4D", color: "#fff", borderRadius: 10,
            textDecoration: "none", fontWeight: 600, fontSize: "1rem",
          }}>
            {data.ctaText}
          </Link>
        )}
      </div>
    </section>
  )
}
