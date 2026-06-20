"use client"
import { useEffect, useRef } from "react"

export interface PacmanAnimationBlockData {
  enabled?: boolean
  maxCreatures?: number
  explosionRadius?: number
}

interface Creature {
  x: number; y: number; vx: number; vy: number; size: number
  mouthAngle: number; mouthDir: number; color: string
  exploded: boolean; explodeTime: number
}

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number
  color: string; alpha: number; reformAt: number; srcIndex: number
}

const COLORS = [
  "rgba(214,198,178,0.55)",
  "rgba(201,110,77,0.50)",
  "rgba(109,184,154,0.45)",
  "rgba(91,141,170,0.40)",
  "rgba(212,160,176,0.45)",
]

export function PacmanAnimationBlock({ data }: { data: PacmanAnimationBlockData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!data?.enabled) return
    if (typeof window === "undefined") return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const MAX_CREATURES = Math.min(Math.max(data?.maxCreatures || 5, 3), 8)
    const EXPLOSION_RADIUS = data?.explosionRadius || 80
    const REFORM_DELAY = 2000

    let mouseX = -9999
    let mouseY = -9999
    let rafId = 0
    let running = true

    const resize = () => {
      canvas!.width = window.innerWidth
      canvas!.height = document.documentElement.scrollHeight
    }
    resize()
    window.addEventListener("resize", resize)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resize())
      ro.observe(document.body)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY + window.scrollY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY + window.scrollY
      }
    }
    document.addEventListener("mousemove", onMouseMove, { passive: true })
    document.addEventListener("touchmove", onTouchMove, { passive: true })

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        if (rafId) cancelAnimationFrame(rafId)
      } else {
        running = true
        rafId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    const createCreature = (): Creature => {
      const edge = Math.floor(Math.random() * 4)
      const speed = 0.6 + Math.random() * 0.8
      const cw = canvas!.width
      const ch = canvas!.height
      let x: number, y: number, vx: number, vy: number
      const size = 18 + Math.random() * 6
      if (edge === 0) { x = -size * 2; y = Math.random() * ch; vx = speed; vy = (Math.random() - 0.5) * speed * 0.3 }
      else if (edge === 1) { x = cw + size * 2; y = Math.random() * ch; vx = -speed; vy = (Math.random() - 0.5) * speed * 0.3 }
      else if (edge === 2) { x = Math.random() * cw; y = -size * 2; vx = (Math.random() - 0.5) * speed * 0.3; vy = speed }
      else { x = Math.random() * cw; y = ch + size * 2; vx = (Math.random() - 0.5) * speed * 0.3; vy = -speed }
      return {
        x, y, vx, vy, size,
        mouthAngle: 0, mouthDir: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        exploded: false, explodeTime: 0,
      }
    }

    const creatures: Creature[] = []
    const particles: Particle[] = []
    for (let i = 0; i < MAX_CREATURES; i++) {
      const c = createCreature()
      c.x = Math.random() * canvas!.width
      c.y = Math.random() * canvas!.height
      creatures.push(c)
    }

    const drawCreature = (c: Creature) => {
      if (!ctx) return
      c.mouthAngle += 0.06 * c.mouthDir
      if (c.mouthAngle > 0.35) c.mouthDir = -1
      if (c.mouthAngle < 0.02) c.mouthDir = 1
      const dir = Math.atan2(c.vy, c.vx)
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(dir)
      ctx.beginPath()
      ctx.arc(0, 0, c.size, c.mouthAngle, Math.PI * 2 - c.mouthAngle)
      ctx.lineTo(0, 0)
      ctx.closePath()
      ctx.fillStyle = c.color
      ctx.fill()
      ctx.restore()
    }

    const explode = (c: Creature, idx: number, t: number) => {
      c.exploded = true
      c.explodeTime = t
      const n = 12 + Math.floor(Math.random() * 8)
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3
        particles.push({
          x: c.x, y: c.y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 4,
          color: c.color,
          alpha: 0.8,
          reformAt: t + REFORM_DELAY + Math.random() * 800,
          srcIndex: idx,
        })
      }
    }

    const animate = (t: number) => {
      if (!running || !ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.97; p.vy *= 0.97
        if (t > p.reformAt - 500) {
          p.alpha = Math.max(0, p.alpha - 0.02)
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, p.alpha + ")")
        ctx.fill()
        if (t > p.reformAt) particles.splice(i, 1)
      }

      for (let i = 0; i < creatures.length; i++) {
        const c = creatures[i]

        if (c.exploded && t - c.explodeTime > REFORM_DELAY) {
          const still = particles.some(p => p.srcIndex === i)
          if (!still) {
            c.exploded = false
            c.x = -c.size * 3
            c.y = Math.random() * canvas.height
            c.vx = 0.6 + Math.random() * 0.8
            c.vy = (Math.random() - 0.5) * 0.3
          }
        }

        if (c.exploded) continue

        c.x += c.vx; c.y += c.vy

        const dx = c.x - mouseX
        const dy = c.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < EXPLOSION_RADIUS) {
          explode(c, i, t)
          continue
        }

        if (c.x < -c.size * 4 || c.x > canvas.width + c.size * 4 || c.y < -c.size * 4 || c.y > canvas.height + c.size * 4) {
          creatures[i] = createCreature()
          continue
        }

        drawCreature(c)
      }

      const active = creatures.filter(c => !c.exploded).length
      if (active < 3) creatures.push(createCreature())

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("visibilitychange", onVisibility)
      if (ro) ro.disconnect()
    }
  }, [data?.enabled, data?.maxCreatures, data?.explosionRadius])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  )
}
