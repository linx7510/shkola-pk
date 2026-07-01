export interface GalleryImage {
  url: string
  alt?: string
  caption?: string
}

export interface GalleryBlockData {
  title?: string
  images: GalleryImage[]
}

export function GalleryBlock({ data }: { data: GalleryBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      {data.title && (
        <h2 style={{ fontSize: "2rem", color: "#E7DCCF", textAlign: "center", marginBottom: "2rem", fontWeight: 700 }}>
          {data.title}
        </h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", maxWidth: 1200, margin: "0 auto" }}>
        {data.images.map((img, i) => (
          <figure key={i} style={{ margin: 0 }}>
            <img src={img.url} alt={img.alt || ""} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 10, display: "block" }} />
            {img.caption && (
              <figcaption style={{ color: "rgba(214,198,178,0.8)", fontSize: "0.82rem", textAlign: "center", marginTop: "0.5rem" }}>
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}
