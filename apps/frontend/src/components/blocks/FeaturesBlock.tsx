import Reveal from "@/components/Reveal"

export interface FeatureItem {
  title: string
  description?: string
  icon?: string
}

export interface FeaturesBlockData {
  title?: string
  features?: FeatureItem[]
  items?: FeatureItem[]  // Payload schema uses "items"
}

export function FeaturesBlock({ data }: { data: FeaturesBlockData }) {
  const features = data.features || data.items || []
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      {data.title && (
        <Reveal><h2 className="heading-sweep" style={{ fontSize: "2rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
          {data.title}
        </h2></Reveal>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {features.map((f, i) => (
          <div key={i} style={{
            padding: "1.5rem", background: "rgba(214,198,178,0.05)",
            border: "1px solid rgba(214,198,178,0.15)", borderRadius: 12,
          }}>
            {f.icon && <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>}
            <Reveal><h3 style={{ color: "#E7DCCF", fontSize: "1.15rem", marginBottom: "0.5rem", fontWeight: 600 }}>{f.title}</h3></Reveal>
            {f.description && <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "0.92rem", lineHeight: 1.6 }}>{f.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
