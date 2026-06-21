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

/**
 * PricingBlock — использует CSS-класс .price-plaque для ценовой плашки
 * (тот же стиль, что и на главной странице в блоке «Услуги»).
 * Унифицированные .btn-primary/.btn-secondary классы для кнопок.
 */
export function PricingBlock({ data }: { data: PricingBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      {data.title && (
        <h2
          className="heading-sweep"
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
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {(data.plans || []).map((plan, i) => {
          const highlighted = plan.highlighted || plan.isFeatured
          const description = plan.description || plan.priceNote
          return (
            <div
              key={i}
              style={{
                padding: "0",
                background: highlighted ? "rgba(201,110,77,0.12)" : "rgba(214,198,178,0.04)",
                border: highlighted ? "2px solid #C96E4D" : "1px solid rgba(214,198,178,0.15)",
                borderRadius: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {highlighted && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "#C96E4D",
                    color: "#fff",
                    padding: "0.3rem 1rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottomLeftRadius: 10,
                  }}
                >
                  Популярный
                </div>
              )}
              <div style={{ padding: "1.5rem 1.5rem 0" }}>
                <h3
                  style={{
                    color: "#E7DCCF",
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    paddingRight: "5rem",
                  }}
                >
                  {plan.name}
                </h3>
                {description && (
                  <p
                    style={{
                      color: "rgba(214,198,178,0.7)",
                      fontSize: "0.88rem",
                      marginBottom: "1rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* === ЦЕНОВАЯ ПЛАШКА — отдельный блок, как на главной === */}
              <div className={`price-plaque${highlighted ? " price-plaque--featured" : ""}`}>
                <div className="price-plaque__value">{formatPrice(plan.price)}</div>
                {plan.priceNote && <div className="price-plaque__note">{plan.priceNote}</div>}
              </div>

              <div style={{ padding: "0 1.5rem 1.5rem" }}>
                {plan.features && Array.isArray(plan.features) && (
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                    {plan.features.map((f, j) => (
                      <li
                        key={j}
                        style={{
                          color: "rgba(214,198,178,0.85)",
                          fontSize: "0.9rem",
                          padding: "0.3rem 0",
                          paddingLeft: "1.5rem",
                          position: "relative",
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            color: "#6DB89A",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {plan.ctaText && plan.ctaLink && (
                  <Link
                    href={plan.ctaLink}
                    className={highlighted ? "btn-primary" : "btn-secondary"}
                    style={{ display: "block", textAlign: "center" }}
                  >
                    {plan.ctaText}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
