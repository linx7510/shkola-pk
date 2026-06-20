import Link from "next/link"

export interface HeroBlockData {
  title: string
  subtitle?: string
  backgroundImage?: { url: string; alt?: string } | null
  ctaText?: string
  ctaLink?: string
  ctaText2?: string
  ctaLink2?: string
}

export function HeroBlock({ data }: { data: HeroBlockData }) {
  return (
    <section style={{
      padding: "4rem 1.5rem",
      textAlign: "center",
      background: data.backgroundImage?.url
        ? `linear-gradient(rgba(13,12,10,0.7), rgba(13,12,10,0.9)), url(${data.backgroundImage.url}) center/cover`
        : "linear-gradient(135deg, #181613, #0D0C0A)",
      borderRadius: 16,
    }}>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#F5F0E8", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.2 }}>
        {data.title}
      </h1>
      {data.subtitle && (
        <p style={{ fontSize: "1.1rem", color: "rgba(214,198,178,0.9)", maxWidth: 700, margin: "0 auto 2rem", lineHeight: 1.6 }}
           dangerouslySetInnerHTML={{ __html: data.subtitle }} />
      )}
      {(data.ctaText || data.ctaText2) && (
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {data.ctaText && data.ctaLink && (
            <Link href={data.ctaLink} style={{
              display: "inline-block", padding: "0.9rem 2rem",
              background: "#C96E4D", color: "#fff", borderRadius: 10,
              textDecoration: "none", fontWeight: 600, fontSize: "1rem",
            }}>
              {data.ctaText}
            </Link>
          )}
          {data.ctaText2 && data.ctaLink2 && (
            <Link href={data.ctaLink2} style={{
              display: "inline-block", padding: "0.9rem 2rem",
              background: "transparent", color: "#E7DCCF",
              border: "1px solid rgba(214,198,178,0.3)", borderRadius: 10,
              textDecoration: "none", fontWeight: 600, fontSize: "1rem",
            }}>
              {data.ctaText2}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
