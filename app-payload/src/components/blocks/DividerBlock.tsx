export interface DividerBlockData {
  style?: string
}

export function DividerBlock({ data }: { data: DividerBlockData }) {
  const s = data.style || 'line'
  return (
    <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
      {s === 'line' && <hr style={{ border: "none", borderTop: "1px solid rgba(214,198,178,0.15)", maxWidth: 400, margin: "0 auto" }} />}
      {s === 'dots' && <div style={{ color: "rgba(230,136,99,0.4)", fontSize: "1.5rem", letterSpacing: "0.5rem" }}>• • •</div>}
      {s === 'space' && <div style={{ height: 60 }} />}
    </div>
  )
}
