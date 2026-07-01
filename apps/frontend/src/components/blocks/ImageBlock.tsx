export interface ImageBlockData {
  image: { url: string; alt?: string } | null
  caption?: string
  alignment?: string
  width?: string
}

export function ImageBlock({ data }: { data: ImageBlockData }) {
  const maxW = data.width === 'limited' ? 800 : data.width === 'small' ? 400 : '100%'
  const align = data.alignment || 'center'
  return (
    <section style={{ padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: maxW, margin: "0 auto", textAlign: align as any }}>
        {data.image?.url && (
          <figure style={{ margin: 0 }}>
            <img src={data.image.url} alt={data.image.alt || ''} style={{ width: "100%", borderRadius: 12, display: "block" }} />
            {data.caption && <figcaption style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.05rem", marginTop: "0.5rem" }}>{data.caption}</figcaption>}
          </figure>
        )}
      </div>
    </section>
  )
}
