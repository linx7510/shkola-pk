export interface TextBlockData {
  title?: string
  body: string
  backgroundColor?: string
}

export function TextBlock({ data }: { data: TextBlockData }) {
  const bg = data.backgroundColor === 'accent' ? 'rgba(230,136,99,0.05)' :
             data.backgroundColor === 'dark' ? '#0D0C0A' : 'transparent'
  return (
    <section style={{ padding: "3rem 1.5rem", background: bg }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>{data.title}</h2>}
        <div style={{ color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: data.body }} />
      </div>
    </section>
  )
}
