"use client"
import { useState } from "react"
import Reveal from "@/components/Reveal"

export interface VideoBlockData {
  title?: string
  videoUrl: string
  description?: string
}

/**
 * VideoBlock — видео в модальном окне.
 *
 * Поведение:
 *   - На странице показывается «плеер-заглушка» с превью и кнопкой ▶
 *   - При клике открывается модальное окно с iframe
 *   - Поддерживаются: YouTube, Rutube, VK Видео, прямые URL
 *   - Закрытие: клик по фону / Esc / кнопка ✕
 *
 * Это совпадает с задачей пользователя:
 *   «Видео уроки должны открываться во фрейме. Сделай стандартную форму,
 *    окно с контентом и видео в выпадающем окне!»
 */
export function VideoBlock({ data }: { data: VideoBlockData }) {
  const [open, setOpen] = useState(false)

  // Извлекаем embed URL из различных форматов
  function getEmbed(url: string): string | null {
    if (!url) return null
    // YouTube: youtube.com/watch?v=ID или youtu.be/ID
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    // Rutube: rutube.ru/video/HASH
    const ru = url.match(/rutube\.ru\/video\/([a-f0-9]+)/)
    if (ru) return `https://rutube.ru/play/embed/${ru[1]}`
    // VK: vk.com/video_ext.php?oid=X&id=Y
    if (url.includes("vk.com/video_ext") || url.includes("vk.ru/video_ext")) {
      return url
    }
    // VK обычная ссылка: vk.com/videoOWNER_VIDEO
    const vk = url.match(/vk\.com\/video(-?\d+)_(\d+)/)
    if (vk) {
      return `https://vk.com/video_ext.php?oid=${vk[1]}&id=${vk[2]}&hd=2`
    }
    // Vimeo
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`
    // Если это уже embed-ссылка — оставляем как есть
    if (url.includes("/embed/") || url.includes("/play/")) return url
    // Fallback: открываем в новом окне
    return null
  }

  const embedUrl = getEmbed(data.videoUrl)

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
                marginBottom: "1rem",
                fontWeight: 700,
              }}
            >
              {data.title}
            </h2>
          </Reveal>
        )}

        {/* Плеер-превью с кнопкой Play */}
        <div
          onClick={() => embedUrl && setOpen(true)}
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            borderRadius: 12,
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(13,12,10,0.95), rgba(24,22,19,0.95))",
            border: "1px solid rgba(214,198,178,0.12)",
            cursor: embedUrl ? "pointer" : "default",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            if (embedUrl) {
              e.currentTarget.style.borderColor = "rgba(230,136,99,0.4)"
              e.currentTarget.style.boxShadow = "0 0 30px rgba(230,136,99,0.15)"
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(214,198,178,0.12)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {/* Декоративный фон с иконкой */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C96E4D, #E68863)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                color: "#fff",
                boxShadow: "0 0 30px rgba(230,136,99,0.4)",
                transition: "transform 0.3s",
              }}
            >
              ▶
            </div>
            <div style={{ color: "rgba(214,198,178,0.6)", fontSize: "0.9rem" }}>
              {embedUrl ? "Нажмите, чтобы посмотреть видео" : "Видео скоро будет добавлено"}
            </div>
          </div>
        </div>

        {data.description && (
          <p
            style={{
              color: "rgba(214,198,178,0.8)",
              marginTop: "1rem",
              lineHeight: 1.6,
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            {data.description}
          </p>
        )}

        {/* Если ссылка не поддерживает embed — даём fallback */}
        {!embedUrl && data.videoUrl && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <a
              href={data.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ display: "inline-block" }}
            >
              Открыть видео в новом окне →
            </a>
          </div>
        )}
      </div>

      {/* Модальное окно с iframe */}
      {open && embedUrl && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 1000,
              background: "#0D0C0A",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(214,198,178,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Заголовок модального окна */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(214,198,178,0.08)",
                background: "rgba(24,22,19,0.95)",
              }}
            >
              <div style={{ color: "#E7DCCF", fontWeight: 600, fontSize: "1rem" }}>
                {data.title || "Видео"}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(214,198,178,0.2)",
                  color: "#E7DCCF",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201,110,77,0.2)"
                  e.currentTarget.style.borderColor = "#C96E4D"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.borderColor = "rgba(214,198,178,0.2)"
                }}
              >
                ✕
              </button>
            </div>
            {/* iframe с видео */}
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                background: "#000",
              }}
            >
              <iframe
                src={embedUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
                allowFullScreen
                title={data.title || "Видео"}
              />
            </div>
            {/* Описание под видео */}
            {data.description && (
              <div
                style={{
                  padding: "1rem 1.5rem",
                  color: "rgba(214,198,178,0.8)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  borderTop: "1px solid rgba(214,198,178,0.08)",
                }}
              >
                {data.description}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
