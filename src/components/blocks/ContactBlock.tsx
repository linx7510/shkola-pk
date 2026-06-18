export interface ContactBlockData {
  title?: string
  phone?: string
  email?: string
  telegram?: string
  address?: string
}

export function ContactBlock({ data }: { data: ContactBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1.5rem", fontWeight: 700 }}>{data.title}</h2>}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.phone && <a href={`tel:${data.phone}`} style={{ color: "#E68863", fontSize: "1.1rem" }}>📞 {data.phone}</a>}
          {data.email && <a href={`mailto:${data.email}`} style={{ color: "#E68863" }}>✉ {data.email}</a>}
          {data.telegram && <span style={{ color: "rgba(214,198,178,0.9)" }}>💬 {data.telegram}</span>}
          {data.address && <span style={{ color: "rgba(214,198,178,0.9)" }}>📍 {data.address}</span>}
        </div>
      </div>
    </section>
  )
}
