export interface TestimonialsBlockData {
  title?: string
  testimonials?: Array<{ name: string; role?: string; text: string; avatar?: { url: string } | null }>  // DEPRECATED
  items?: Array<{ name: string; role?: string; text: string; avatar?: { url: string } | null }>  // Schema field name
}

export function TestimonialsBlock({ data }: { data: TestimonialsBlockData }) {
  const items = data.items || data.testimonials || []
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {data.title && (
          <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
            {data.title}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {items.map((t, i) => (
            <div key={i} style={{
              padding: "1.5rem",
              background: "rgba(214,198,178,0.04)",
              border: "1px solid rgba(214,198,178,0.12)",
              borderRadius: 12,
            }}>
              {t.avatar?.url && (
                <img src={t.avatar.url} alt={t.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", marginBottom: "0.75rem" }} />
              )}
              <p style={{ color: "rgba(214,198,178,0.85)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "0.75rem", fontStyle: "italic }}>“{t.text}”</p>
              <div style={{ color: "#E68863", fontSize: "0.88rem", fontWeight: 600 }}>
                {t.name}{t.role ? `, ${t.role}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
