"use client"
import { useState, useEffect } from "react"
import Reveal from "@/components/Reveal"

export interface StepsBlockData {
  title?: string
  gated?: boolean
  steps: Array<{ title: string; description: string; videoUrl?: string; thumbnailUrl?: string }>
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  // VK embed URL (video_ext.php): домен всегда vk.com —
  // vkvideo.ru/video_ext отдаёт 302 на login.vk.ru (X-Frame-Options: deny)
  if (url.includes("video_ext.php")) {
    return url.replace("//vkvideo.ru/", "//vk.com/").replace("//vk.ru/", "//vk.com/")
  }
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

/**
 * Gated CTA: показывается НЕзалогиненным пользователям.
 * Цель — поймать лида: пользователь регистрируется в ЛК, чтобы смотреть видео.
 */
function GatedVideoCTA() {
  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1.25rem",
        background: "linear-gradient(135deg, rgba(230,136,99,0.08), rgba(201,110,77,0.05))",
        border: "1px solid rgba(230,136,99,0.25)",
        borderRadius: 12,
        textAlign: "center",
        maxWidth: 560,
        margin: "1rem auto 0",
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔒</div>
      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#E7DCCF", marginBottom: "0.35rem" }}>
        Видео доступно в личном кабинете
      </div>
      <div style={{ fontSize: "0.82rem", color: "rgba(214,198,178,0.7)", marginBottom: "0.85rem", lineHeight: 1.5 }}>
        Зарегистрируйтесь бесплатно — и смотрите все уроки не уходя с сайта
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href="/register"
          style={{
            display: "inline-block",
            padding: "0.55rem 1.25rem",
            background: "linear-gradient(135deg, #C96E4D, #E68863)",
            color: "#0D0C0A",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Регистрация →
        </a>
        <a
          href="/login"
          style={{
            display: "inline-block",
            padding: "0.55rem 1.25rem",
            background: "transparent",
            border: "1px solid rgba(214,198,178,0.25)",
            color: "#D6C6B2",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Войти
        </a>
      </div>
    </div>
  )
}

function VideoEmbed({ url, thumbnail, freeAccess }: { url: string; thumbnail?: string; freeAccess?: boolean }) {
  const [authed, setAuthed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [clicked, setClicked] = useState(false)
  const embedUrl = getEmbedUrl(url)

  // Проверка авторизации (localStorage auth_token — наш session JWT)
  useEffect(() => {
    setAuthed(!!localStorage.getItem("auth_token"))
    setMounted(true)
  }, [])

  // Для freeAccess видео — рендерим превью сразу (без проверки авторизации)
  if (freeAccess) {
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
          src={embedUrl || ""}
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

  // Для gated видео — ждём монтирования (проверка localStorage)
  if (!mounted) return null

  // GATING: только залогиненные видят встроенный iframe.
  if (!authed) {
    return <GatedVideoCTA />
  }

  // Залогинен, но URL не распознан как embed — fallback на новую вкладку
  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.5rem", color: "#E68863", fontSize: "0.85rem" }}>
        Открыть видео в новой вкладке →
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

  // После клика — загружаем iframe (встроенный, не новая вкладка)
  return (
    <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden", maxWidth: 560, margin: "1rem auto 0" }}>
      <iframe
        src={embedUrl || ""}
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
                  <VideoEmbed url={s.videoUrl} thumbnail={s.thumbnailUrl} freeAccess={(data.gated === false) || (data.title || "").toLowerCase().includes("открыт")} />
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
