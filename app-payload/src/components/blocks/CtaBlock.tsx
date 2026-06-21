import Link from "next/link"
import Reveal from "@/components/Reveal"

export interface CtaBlockData {
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  buttonText2?: string
  buttonLink2?: string
  ctaText?: string  // alias for buttonText
  ctaLink?: string  // alias for buttonLink
  backgroundImage?: { url: string } | null
}

export function CtaBlock({ data }: { data: CtaBlockData }) {
  const b1Text = data.buttonText || data.ctaText
  const b1Link = data.buttonLink || data.ctaLink
  const b2Text = data.buttonText2
  const b2Link = data.buttonLink2
  const description = data.description || data.subtitle
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "2.5rem",
        background: data.backgroundImage?.url
          ? `linear-gradient(rgba(13,12,10,0.85), rgba(13,12,10,0.92)), url(${data.backgroundImage.url}) center/cover`
          : "linear-gradient(135deg, rgba(201,110,77,0.15), rgba(214,198,178,0.05))",
        border: "1px solid rgba(201,110,77,0.3)", borderRadius: 16, textAlign: "center",
      }}>
        <Reveal><h2 style={{ fontSize: "1.8rem", color: "#F5F0E8", marginBottom: "0.75rem", fontWeight: 700 }}>{data.title}</h2></Reveal>
        {description && (
          <p style={{ color: "rgba(214,198,178,0.85)", fontSize: "1.05rem", marginBottom: "1.5rem", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 1.5rem" }}>
            {description}
          </p>
        )}
        {(b1Text || b2Text) && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {b1Text && b1Link && (
              <Link href={b1Link} style={{
                display: "inline-block", padding: "0.85rem 2rem",
                background: "#C96E4D", color: "#fff", borderRadius: 10,
                textDecoration: "none", fontWeight: 600, fontSize: "1rem",
              }}>
                {b1Text}
              </Link>
            )}
            {b2Text && b2Link && (
              <Link href={b2Link} style={{
                display: "inline-block", padding: "0.85rem 2rem",
                background: "transparent", color: "#E7DCCF",
                border: "1px solid rgba(214,198,178,0.3)", borderRadius: 10,
                textDecoration: "none", fontWeight: 600, fontSize: "1rem",
              }}>
                {b2Text}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
