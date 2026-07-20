"use client"
import { useState } from "react"
import Reveal from "@/components/Reveal"

export interface StepsBlockData {
  title?: string
  steps: Array<{ title: string; description: string; videoUrl?: string; thumbnailUrl?: string }>
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  if (url.includes("vk.com/video_ext") || url.includes("vk.ru/video_ext")) return url
  const vk = url.match(/(?:vk\.com\/video|vkvideo\.ru\/video)(-?\d+)_(\d+)/)
  if (vk) {
    const oid = vk[1].startsWith("-") ? vk[1].substring(1) : vk[1]
    return "https://vk.com/video_ext.php?oid=" + oid + "&id=" + vk[2] + "&hd=2"
  }
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return "https://www.youtube.com/embed/" + yt[1]
  const ru = url.match(/rutube\.ru\/video\/([a-f0-9]+)/)
  if (ru) return "https://rutube.ru/play/embed/" + ru[1]
  if (url.includes("/embed/") || url.includes("/play/")) return url
  return null
}

function VideoEmbed({ url, thumbnail }: { url: string; thumbnail?: string }) {
  const [clicked, setClicked] = useState(false)
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.5rem", color: "#E68863", fontSize: "0.85rem" }}>
        Открыть видео
      </a>
    )
  }

  // Lazy: показываем превью, iframe грузится только при клике
  if (!clicked) {
    return (
      <div
        onClick={() => setClicked(true)}
        style={{
          marginTop: "1rem",
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          borderRadius: 12,
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(13,12,10,0.95), rgba(24,22,19,0.95))",
          border: "1px solid rgba(214,198,178,0.12)",
          cursor: "pointer",
          maxWidth: 560,
          margin: "1rem auto 0",
          transition: "border-color 0.3s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(230,136,99,0.4)" }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(214,198,178,0.12)" }}
      >
        {thumbnail && (
          <img
            src={thumbnail}
            alt="Видео превью"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C96E4D, #E68863)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
            color: "#fff",
            boxShadow: "0 0 30px rgba(230,136,99,0.4)",
            zIndex: 3,
          }}
        >
          ▶
        </div>
        <div style={{ position: "absolute", bottom: "0.75rem", left: 0, right: 0, textAlign: "center", color: "rgba(214,198,178,0.7)", fontSize: "0.85rem", zIndex: 3 }}>
          Нажмите, чтобы посмотреть
        </div>
      </div>
    )
  }

  // После клика — загружаем iframe
  return (
    <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden", maxWidth: 560, margin: "1rem auto 0" }}>
      <iframe
        src={embedUrl + (embedUrl.includes("?") ? "&" : "?") + "autoplay=1"}
        width="100%"
        height="315"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        frameBorder="0"
        title="Видео урок"
        style={{ borderRadius: 12, display: "block" }}
      />
    </div>
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
                {s.videoUrl ? (
                  <VideoEmbed url={s.videoUrl} thumbnail={s.thumbnailUrl} />
                ) : (
                  <a
                    href="/register"
                    style={{
                      display: "block",
                      marginTop: "0.5rem",
                      padding: "0.75rem 1rem",
                      background: "rgba(230,136,99,0.08)",
                      border: "1px solid rgba(230,136,99,0.2)",
                      borderRadius: 8,
                      color: "#E68863",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(230,136,99,0.15)"
                      e.currentTarget.style.borderColor = "rgba(230,136,99,0.4)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(230,136,99,0.08)"
                      e.currentTarget.style.borderColor = "rgba(230,136,99,0.2)"
                    }}
                  >
                    🔒 Доступ после бесплатной подписки →
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
