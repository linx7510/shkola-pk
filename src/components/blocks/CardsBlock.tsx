import Link from "next/link"

export interface CardsBlockData {
  title?: string
  cards: Array<{ icon?: string; title: string; description: string; link?: string }>
}

export function CardsBlock({ data }: { data: CardsBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700, textAlign: "center" }}>{data.title}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {data.cards.map((c, i) => (
            <div key={i} style={{ padding: "1.5rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 14 }}>
              {c.icon && <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{c.icon}</div>}
              <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", marginBottom: "0.5rem" }}>{c.title}</h3>
              <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "0.9rem", lineHeight: 1.6 }}>{c.description}</p>
              {c.link && <Link href={c.link} style={{ display: "inline-block", marginTop: "0.75rem", color: "#E68863", fontSize: "0.88rem" }}>Подробнее →</Link>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
