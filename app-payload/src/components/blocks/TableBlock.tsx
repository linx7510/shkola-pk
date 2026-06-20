export interface TableBlockData {
  title?: string
  columns: Array<{ header: string }>
  rows: Array<{ cells: Array<{ value: string }> }>
}

export function TableBlock({ data }: { data: TableBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1.5rem", fontWeight: 700, textAlign: "center" }}>{data.title}</h2>}
        <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, rgba(230,136,99,0.15), rgba(214,198,178,0.05))" }}>
                {data.columns.map((col, i) => (
                  <th key={i} style={{ padding: "1rem 1.25rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 600, color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(230,136,99,0.2)" }}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri} style={{ transition: "background 0.25s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(230,136,99,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {row.cells.map((cell, ci) => (
                    <td key={ci} style={{ padding: "1rem 1.25rem", color: ci === 0 ? "#E7DCCF" : "rgba(214,198,178,0.85)", fontSize: "0.92rem", lineHeight: 1.6, borderBottom: "1px solid rgba(214,198,178,0.06)", fontWeight: ci === 0 ? 600 : 400 }}>{cell.value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
