"use client"
import dynamic from "next/dynamic"

/**
 * SnakeAnimationBlock — теперь рендерит BlogParticles (как на главной).
 *
 * Раньше это была тяжёлая анимация со змеями (canvas, 298 строк JS,
 * десятки объектов с сегментами, частицами, food items).
 * Она замедляла загрузку страницы /kursy.
 *
 * Заменена на BlogParticles — лёгкие световые частицы (161 строка,
 * 45 частиц max, disabled on mobile, visibility API pause).
 * Это та же анимация что на главной странице.
 *
 * CMS-поля (enabled, maxSnakes, explosionRadius) игнорируются —
 * оставлены только для обратной совместимости с существующими block-ами в БД.
 */

// Lazy load — анимация не нужна в initial bundle
const BlogParticles = dynamic(() => import("@/components/BlogParticles"), {
  loading: () => null,
  ssr: false,
})

export interface SnakeAnimationBlockData {
  enabled?: boolean
  maxSnakes?: number
  explosionRadius?: number
}

export function SnakeAnimationBlock({ data }: { data: SnakeAnimationBlockData }) {
  // Если block явно disabled в CMS — не рендерим
  if (data?.enabled === false) return null

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 200 }}>
      <BlogParticles />
    </div>
  )
}
