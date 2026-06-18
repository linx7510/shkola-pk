import Link from "next/link"

export interface PricingPlan {
  name: string
  price: string
  description?: string
  features?: string[]
  ctaText?: string
  ctaLink?: string
  highlighted?: boolean
}

export interface PricingBlockData {
  title?: string
  plans: PricingPlan[]
}

export function PricingBlock({ data }: { data: PricingBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      {data.title && (
        <h2 style={{ fontSize: "2rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
          {data.title}
        </h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {data.plans.map((plan, i) => (
          <div key={i} style={{
            padding: "2rem",
            background: plan.highlighted ? "rgba(201,110,77,0.1)" : "rgba(214,198,178,0.04)",
            border: plan.highlighted ? "2px solid #C96E4D" : "1px solid rgba(214,198,178,0.15)",
            borderRadius: 14, position: "relative",
          }}>
            {plan.highlighted && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "#C96E4D", color: "#fff", padding: "0.25rem 0.75rem",
                borderRadius: 12, fontSize: "0.75rem", fontWeight: 600,
              }}>Популярный</div>
            )}
            <h3 style={{ color: "#E7DCCF", fontSize: "1.2rem", marginBottom: "0.5rem", fontWeight: 600 }}>{plan.name}</h3>
            <div style={{ color: "#C96E4D", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>{plan.price}</div>
            {plan.description && <p style={{ color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", marginBottom: "1rem" }}>{plan.description}</p>}
            {plan.features && (
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ color: "rgba(214,198,178,0.85)", fontSize: "0.9rem", padding: "0.3rem 0", paddingLeft: "1.5rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#6DB89A" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            )}
            {plan.ctaText && plan.ctaLink && (
              <Link href={plan.ctaLink} style={{
                display: "block", padding: "0.75rem", textAlign: "center",
                background: plan.highlighted ? "#C96E4D" : "rgba(214,198,178,0.1)",
                color: plan.highlighted ? "#fff" : "#E7DCCF",
                borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: "0.95rem",
              }}>{plan.ctaText}</Link>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
