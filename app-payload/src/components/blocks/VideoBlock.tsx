export interface VideoBlockData {
  title?: string
  videoUrl: string
  description?: string
}

export function VideoBlock({ data }: { data: VideoBlockData }) {
  const youtubeMatch = data.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  const rutubeMatch = data.videoUrl.match(/rutube\.ru\/video\/([a-f0-9]+)/)
  const embedUrl = youtubeMatch ? `https://www.youtube.com/embed/${youtubeMatch[1]}` :
                   rutubeMatch ? `https://rutube.ru/play/embed/${rutubeMatch[1]}` : null

  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>{data.title}</h2>}
        {embedUrl ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
            <iframe src={embedUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen />
          </div>
        ) : (
          <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#E68863" }}>Открыть видео →</a>
        )}
        {data.description && <p style={{ color: "rgba(214,198,178,0.8)", marginTop: "1rem", lineHeight: 1.6 }}>{data.description}</p>}
      </div>
    </section>
  )
}
