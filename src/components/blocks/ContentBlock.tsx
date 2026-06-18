export interface ContentBlockData {
  title?: string
  content: string  // HTML или простой текст
}

export function ContentBlock({ data }: { data: ContentBlockData }) {
  return (
    <section style={{ padding: "2rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
      {data.title && (
        <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>
          {data.title}
        </h2>
      )}
      <div
        style={{ color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  )
}
