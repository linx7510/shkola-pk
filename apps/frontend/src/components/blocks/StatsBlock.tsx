import Reveal from "@/components/Reveal"

export interface StatItem {
  value: string
  label: string
  icon?: string
}

export interface StatsBlockData {
  title?: string
  stats: StatItem[]
}

export function StatsBlock({ data }: { data: StatsBlockData }) {
  return (
    <section style={{ padding: "2.5rem 1.5rem" }}>
      {data.title && (
        <Reveal><h2 className="heading-sweep" style={{ fontSize: "1.8rem", color: "#E7DCCF", textAlign: "center", marginBottom: "1.5rem", fontWeight: 700 }}>
          {data.title}
        </h2></Reveal>
      )}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${data.stats.length}, 1fr)`,
        gap: "1rem", maxWidth: 1000, margin: "0 auto",
        padding: "1.5rem", background: "rgba(214,198,178,0.04)", borderRadius: 14,
      }}>
        {data.stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            {s.icon && <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{s.icon}</div>}
            <div style={{ color: "#C96E4D", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: "rgba(214,198,178,0.8)", fontSize: "0.88rem", marginTop: "0.4rem" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
