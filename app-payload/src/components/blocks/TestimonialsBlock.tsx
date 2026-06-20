export interface Testimonial {
  author: string
  role?: string
  text: string
  avatar?: { url: string; alt?: string } | null
  rating?: number
}

export interface TestimonialsBlockData {
  title?: string
  testimonials: Testimonial[]
}

export function TestimonialsBlock({ data }: { data: TestimonialsBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      {data.title && (
        <h2 style={{ fontSize: "2rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
          {data.title}
        </h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {data.testimonials.map((t, i) => (
          <div key={i} style={{
            padding: "1.5rem", background: "rgba(214,198,178,0.04)",
            border: "1px solid rgba(214,198,178,0.12)", borderRadius: 12,
          }}>
            {t.rating && (
              <div style={{ color: "#C9A84D", marginBottom: "0.75rem" }}>{"★".repeat(t.rating)}</div>
            )}
            <p style={{ color: "rgba(214,198,178,0.9)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem", fontStyle: "italic" }}>"{t.text}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {t.avatar?.url && (
                <img src={t.avatar.url} alt={t.avatar.alt || t.author} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <div>
                <div style={{ color: "#E7DCCF", fontSize: "0.95rem", fontWeight: 600 }}>{t.author}</div>
                {t.role && <div style={{ color: "rgba(214,198,178,0.6)", fontSize: "0.82rem" }}>{t.role}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
