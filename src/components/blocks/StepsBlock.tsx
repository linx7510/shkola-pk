export interface StepsBlockData {
  title?: string
  steps: Array<{ title: string; description: string }>
}

export function StepsBlock({ data }: { data: StepsBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700, textAlign: "center" }}>{data.title}</h2>}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {data.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: 48, height: 48, borderRadius: "50%", background: "#E68863", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 700 }}>{i + 1}</div>
              <div>
                <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", marginBottom: "0.4rem" }}>{s.title}</h3>
                <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "0.92rem", lineHeight: 1.6 }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
