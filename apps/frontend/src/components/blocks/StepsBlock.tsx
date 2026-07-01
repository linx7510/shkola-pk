import Reveal from "@/components/Reveal"

export interface StepsBlockData {
  title?: string
  steps: Array<{ title: string; description: string; videoUrl?: string; thumbnailUrl?: string }>
}

function VideoEmbed({ url, thumbnail }: { url: string; thumbnail?: string }) {
  if (!url) return null

  // VK embed: vk.com/video_ext.php?oid=X&id=Y
  if (url.includes("vk.com/video_ext") || url.includes("vk.ru/video_ext")) {
    return (
      <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden" }}>
        <iframe
          src={url}
          width="100%"
          height="315"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          style={{ borderRadius: 12, maxWidth: 560, margin: "0 auto", display: "block" }}
        />
      </div>
    )
  }

  // VK обычная ссылка: vk.com/videoOWNER_VIDEO или vkvideo.ru/videoOID_ID
  const vk = url.match(/(?:vk\.com\/video|vkvideo\.ru\/video)(-?\d+)_(\d+)/)
  if (vk) {
    const ownerId = vk[1]
    const videoId = vk[2]
    const oid = ownerId.startsWith("-") ? ownerId.substring(1) : ownerId
    const embedUrl = "https://vk.com/video_ext.php?oid=" + oid + "&id=" + videoId + "&hd=2"
    return (
      <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden" }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="315"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          style={{ borderRadius: 12, maxWidth: 560, margin: "0 auto", display: "block" }}
        />
      </div>
    )
  }

  // YouTube: youtube.com/watch?v=X или youtu.be/X
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) {
    const embedUrl = "https://www.youtube.com/embed/" + yt[1]
    return (
      <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden" }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="315"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          style={{ borderRadius: 12, maxWidth: 560, margin: "0 auto", display: "block" }}
        />
      </div>
    )
  }

  // Rutube: rutube.ru/video/HASH
  const ru = url.match(/rutube\.ru\/video\/([a-f0-9]+)/)
  if (ru) {
    const embedUrl = "https://rutube.ru/play/embed/" + ru[1]
    return (
      <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden" }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="315"
          allowFullScreen
          frameBorder="0"
          style={{ borderRadius: 12, maxWidth: 560, margin: "0 auto", display: "block" }}
        />
      </div>
    )
  }

  // Не распознано — просто ссылка
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.5rem", color: "#E68863", fontSize: "0.85rem" }}>
      Открыть видео
    </a>
  )
}

export function StepsBlock({ data }: { data: StepsBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && (
          <Reveal>
            <h2
              className="section-title heading-sweep"
              data-text={data.title}
              style={{
                fontSize: "1.8rem",
                color: "#E7DCCF",
                marginBottom: "2rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {data.title}
            </h2>
          </Reveal>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {data.steps.map((s, i) => (
            <Reveal key={i} delay={i + 1}>
              <div
                style={{
                  padding: "1.5rem",
                  background: "rgba(214,198,178,0.04)",
                  border: "1px solid rgba(214,198,178,0.08)",
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem", color: "#E68863", fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#E7DCCF", margin: 0 }}>
                      {s.title}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: "0.95rem", color: "rgba(214,198,178,0.9)", lineHeight: 1.7, margin: "0.5rem 0 0 0", whiteSpace: "pre-wrap" }}>
                  {s.description}
                </p>
                {s.videoUrl && <VideoEmbed url={s.videoUrl} thumbnail={s.thumbnailUrl} />}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
