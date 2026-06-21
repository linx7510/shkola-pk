import Link from "next/link"
import Reveal from "@/components/Reveal"

export interface HeroBlockData {
  title: string
  subtitle?: string
  backgroundImage?: { url: string; alt?: string } | null
  ctaText?: string
  ctaLink?: string
  ctaText2?: string
  ctaLink2?: string
}

/**
 * HeroBlock — унифицирован с главной страницей.
 * Использует те же CSS-классы (.heading-sweep, .btn-primary, .btn-secondary, .hero-block),
 * что и hero-секция на 2980738.ru, чтобы hover-анимации заголовков и кнопок
 * работали идентично на всех страницах.
 */
export function HeroBlock({ data }: { data: HeroBlockData }) {
  const hasBg = !!data.backgroundImage?.url
  return (
    <section
      className="hero-block"
      style={{
        padding: "5rem 1.5rem 4rem",
        textAlign: "center",
        background: hasBg
          ? `linear-gradient(rgba(13,12,10,0.7), rgba(13,12,10,0.9)), url(${data.backgroundImage!.url}) center/cover`
          : "linear-gradient(135deg, #181613, #0D0C0A)",
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Reveal>
        <h1
          className="hero-title heading-sweep"
          data-text={data.title}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#F5F0E8",
            fontWeight: 700,
            marginBottom: "1.25rem",
            lineHeight: 1.2,
          }}
        >
          {data.title}
        </h1>
      </Reveal>

      {data.subtitle && (
        <Reveal delay={1}>
          <p
            className="hero-desc"
            style={{
              fontSize: "1.1rem",
              color: "rgba(214,198,178,0.9)",
              maxWidth: 700,
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: data.subtitle }}
          />
        </Reveal>
      )}

      {(data.ctaText || data.ctaText2) && (
        <Reveal delay={2}>
          <div
            className="hero-actions"
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {data.ctaText && data.ctaLink && (
              <Link href={data.ctaLink} className="btn-primary">
                {data.ctaText}
              </Link>
            )}
            {data.ctaText2 && data.ctaLink2 && (
              <Link href={data.ctaLink2} className="btn-secondary">
                {data.ctaText2}
              </Link>
            )}
          </div>
        </Reveal>
      )}
    </section>
  )
}
