import Link from "next/link"

export interface PricingPlan {
  name: string
  price: any
  priceNote?: string
  description?: string
  features?: string[]
  isFeatured?: boolean
  highlighted?: boolean
  ctaText?: string
  ctaLink?: string
}

export interface PricingBlockData {
  title?: string
  plans: PricingPlan[]
}

function formatPrice(price: any): string {
  if (typeof price === "number") {
    return new Intl.NumberFormat("ru-RU").format(price) + " \u20bd"
  }
  return String(price || "")
}

export function PricingBlock({ data }: { data: PricingBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      {data.title && (
        <h2 className="heading-sweep" style={{ fontSize: "2rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
          {data.title}
        </h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {(data.plans || []).map((plan, i) => {
          const highlighted = plan.highlighted || plan.isFeatured
          const description = plan.description || plan.priceNote
          return (
            <div key={i} style={{
              padding: "2rem",
              background: highlighted ? "rgba(201,110,77,0.12)" : "rgba(214,198,178,0.04)",
              border: highlighted ? "2px solid #C96E4D" : "1px solid rgba(214,198,178,0.15)",
              borderRadius: 14, position: "relative",
            }}>
              {highlighted && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "#C96E4D", color: "#fff", padding: "0.25rem 0.75rem",
                  borderRadius: 12, fontSize: "0.75rem", fontWeight: 600,
                }}>Популярный</div>
              )}
              <h3 style={{ color: "#E7DCCF", fontSize: "1.2rem", marginBottom: "0.5rem", fontWeight: 600 }}>{plan.name}</h3>
              <div style={{
                color: "#E68863",
                fontSize: "2.2rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
                textShadow: "0 0 20px rgba(230,136,99,0.4)",
                padding: "0.5rem 0",
                borderTop: "1px solid rgba(230,136,99,0.2)",
                borderBottom: "1px solid rgba(230,136,99,0.2)",
              }}>{formatPrice(plan.price)}</div>
              {description && <p style={{ color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", marginBottom: "1rem" }}>{description}</p>}
              {plan.features && Array.isArray(plan.features) && (
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ color: "rgba(214,198,178,0.85)", fontSize: "0.9rem", padding: "0.3rem 0", paddingLeft: "1.5rem", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#6DB89A" }}>\u2713</span> {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.ctaText && plan.ctaLink && (
                <Link href={plan.ctaLink} style={{
                  display: "block", padding: "0.75rem", textAlign: "center",
                  background: highlighted ? "#C96E4D" : "rgba(214,198,178,0.1)",
                  color: highlighted ? "#fff" : "#E7DCCF",
                  borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: "0.95rem",
                }}>{plan.ctaText}</Link>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
