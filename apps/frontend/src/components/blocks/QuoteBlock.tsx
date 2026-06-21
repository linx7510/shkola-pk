export interface QuoteBlockData {
  text: string
  author?: string
}

export function QuoteBlock({ data }: { data: QuoteBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <blockquote style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "2rem", background: "linear-gradient(135deg, rgba(230,136,99,0.05), rgba(214,198,178,0.02))", borderLeft: "3px solid rgba(230,136,99,0.3)", borderRight: "3px solid rgba(230,136,99,0.3)", borderRadius: 12 }}>
        <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", color: "#F5F0E8", fontStyle: "italic", lineHeight: 1.5, marginBottom: "0.75rem" }}>{data.text}</p>
        {data.author && <cite style={{ color: "#E68863", fontSize: "1rem", fontStyle: "normal" }}>— {data.author}</cite>}
      </blockquote>
    </section>
  )
}
