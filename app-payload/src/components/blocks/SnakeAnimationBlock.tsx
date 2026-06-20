"use client"
import { useEffect, useRef } from "react"

export interface SnakeAnimationBlockData {
  enabled?: boolean
  maxSnakes?: number
  explosionRadius?: number
}

// 8-битная Snake игра — классическая Snake как на Nokia
// Змейка движется по сетке, поедает точки и РАСТЁТ, взрывается от мыши

interface Point { x: number; y: number }

interface Snake {
  body: Point[]              // head = body[0], tail = body[body.length-1]
  dir: Point                 // direction vector (1,0), (-1,0), (0,1), (0,-1)
  color: string
  alive: boolean
  explodeTime: number
  moveCounter: number        // throttle — move every N frames
}

interface Dot {
  x: number
  y: number
  color: string
  pulse: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
}

// 8-бит палитра (классическая Snake)
const SNAKE_COLORS = ["#6DB89A", "#4A9D7E", "#7FCB9E", "#5CB585"]  // зелёные оттенки
const DOT_COLORS = ["#FFC96E", "#FF6B6B", "#FFE08C", "#FFAA3E"]    // тёплые точки

const CELL = 12  // размер ячейки сетки (px)
const MOVE_INTERVAL = 8  // move every N frames (lower = faster)

export function SnakeAnimationBlock({ data }: { data: SnakeAnimationBlockData }) {
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

    const EXPLOSION_RADIUS = data?.explosionRadius || 70
    const REFORM_DELAY = 2500

    let mouseX = -9999
    let mouseY = -9999
    let rafId = 0
    let running = true
    let frame = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
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

    // === Helpers ===
    function randomCell(): Point {
      const cw = canvas!.width
      const ch = canvas!.height
      return {
        x: Math.floor(Math.random() * (cw / CELL)) * CELL,
        y: Math.floor(Math.random() * (ch / CELL)) * CELL,
      }
    }

    function createSnake(): Snake {
      const start = randomCell()
      const dirs: Point[] = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}]
      const dir = dirs[Math.floor(Math.random() * 4)]
      const body: Point[] = []
      for (let i = 0; i < 5; i++) {
        body.push({ x: start.x - i * dir.x * CELL, y: start.y - i * dir.y * CELL })
      }
      return {
        body,
        dir,
        color: SNAKE_COLORS[Math.floor(Math.random() * SNAKE_COLORS.length)],
        alive: true,
        explodeTime: 0,
        moveCounter: 0,
      }
    }

    function spawnDot(): Dot {
      const cell = randomCell()
      return {
        x: cell.x + CELL / 2,
        y: cell.y + CELL / 2,
        color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
      }
    }

    // === State ===
    const snakes: Snake[] = [createSnake()]
    const particles: Particle[] = []
    const dots: Dot[] = []
    for (let i = 0; i < 15; i++) dots.push(spawnDot())

    // === AI: find nearest dot, turn towards it ===
    function aiTurn(s: Snake) {
      if (s.body.length === 0) return
      const head = s.body[0]
      if (dots.length === 0) return
      // Find nearest dot
      let nearest = dots[0]
      let minDist = Infinity
      for (const d of dots) {
        const dx = d.x - head.x
        const dy = d.y - head.y
        const dist = dx * dx + dy * dy
        if (dist < minDist) { minDist = dist; nearest = d }
      }
      // Decide direction: prefer horizontal or vertical based on dot position
      const dx = nearest.x - head.x
      const dy = nearest.y - head.y
      // 80% chance to move towards dot, 20% random (to avoid getting stuck)
      if (Math.random() < 0.8) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // Move horizontally
          const newDir = { x: dx > 0 ? 1 : -1, y: 0 }
          // Don't reverse
          if (newDir.x !== -s.dir.x || newDir.y !== -s.dir.y) s.dir = newDir
        } else {
          const newDir = { x: 0, y: dy > 0 ? 1 : -1 }
          if (newDir.x !== -s.dir.x || newDir.y !== -s.dir.y) s.dir = newDir
        }
      } else {
        // Random 90-degree turn
        const dirs: Point[] = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}]
        const valid = dirs.filter(d => d.x !== -s.dir.x || d.y !== -s.dir.y)
        s.dir = valid[Math.floor(Math.random() * valid.length)]
      }
    }

    function moveSnake(s: Snake) {
      const head = s.body[0]
      const newHead = {
        x: head.x + s.dir.x * CELL,
        y: head.y + s.dir.y * CELL,
      }
      // Wrap around
      const cw = canvas!.width
      const ch = canvas!.height
      if (newHead.x < 0) newHead.x = cw - CELL
      if (newHead.x >= cw) newHead.x = 0
      if (newHead.y < 0) newHead.y = ch - CELL
      if (newHead.y >= ch) newHead.y = 0

      s.body.unshift(newHead)

      // Check if eats dot
      let ate = false
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i]
        const dx = d.x - (newHead.x + CELL / 2)
        const dy = d.y - (newHead.y + CELL / 2)
        if (Math.sqrt(dx * dx + dy * dy) < CELL) {
          dots.splice(i, 1)
          ate = true
          // Spawn new dot
          dots.push(spawnDot())
          break
        }
      }

      // If ate, DON'T remove tail (snake grows)
      if (!ate) {
        s.body.pop()
      }
    }

    function drawSnake(s: Snake) {
      if (!ctx) return
      // Draw body segments (8-bit style: solid squares)
      for (let i = s.body.length - 1; i >= 0; i--) {
        const seg = s.body[i]
        const isHead = i === 0
        ctx.fillStyle = isHead ? "#FFFFFF" : s.color
        // 8-bit: solid square with slight glow on head
        if (isHead) {
          ctx.shadowColor = s.color
          ctx.shadowBlur = 10
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fillRect(seg.x + 1, seg.y + 1, CELL - 2, CELL - 2)
      }
      // Eyes on head (8-bit style: 2 black pixels)
      ctx.shadowBlur = 0
      ctx.fillStyle = "#0D0C0A"
      const head = s.body[0]
      const eyeSize = 2
      const eyeOffset = 3
      // Eyes perpendicular to direction
      if (s.dir.x !== 0) {
        // Moving horizontally
        const ex = head.x + (s.dir.x > 0 ? CELL - eyeSize - eyeOffset : eyeOffset)
        ctx.fillRect(ex, head.y + eyeOffset, eyeSize, eyeSize)
        ctx.fillRect(ex, head.y + CELL - eyeSize - eyeOffset, eyeSize, eyeSize)
      } else {
        // Moving vertically
        const ey = head.y + (s.dir.y > 0 ? CELL - eyeSize - eyeOffset : eyeOffset)
        ctx.fillRect(head.x + eyeOffset, ey, eyeSize, eyeSize)
        ctx.fillRect(head.x + CELL - eyeSize - eyeOffset, ey, eyeSize, eyeSize)
      }
    }

    function drawDot(d: Dot) {
      if (!ctx) return
      d.pulse += 0.1
      const pulseSize = (CELL - 4) / 2 + Math.sin(d.pulse) * 1.5
      // Glow
      ctx.shadowColor = d.color
      ctx.shadowBlur = 14
      ctx.fillStyle = d.color
      ctx.beginPath()
      ctx.arc(d.x, d.y, pulseSize, 0, Math.PI * 2)
      ctx.fill()
      // Bright core (8-bit style: white center)
      ctx.shadowBlur = 0
      ctx.fillStyle = "#FFF8E0"
      ctx.beginPath()
      ctx.arc(d.x, d.y, pulseSize * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }

    function explodeSnake(s: Snake, t: number) {
      s.alive = false
      s.explodeTime = t
      // Each segment explodes into 6-10 particles
      for (const seg of s.body) {
        const n = 6 + Math.floor(Math.random() * 4)
        for (let i = 0; i < n; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 1.5 + Math.random() * 3.5
          particles.push({
            x: seg.x + CELL / 2,
            y: seg.y + CELL / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: s.color,
            alpha: 1,
          })
        }
      }
    }

    function animate(t: number) {
      if (!running || !ctx || !canvas) return
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw dots (with glow + pulse)
      ctx.globalAlpha = 1
      for (const d of dots) drawDot(d)

      // Update + draw particles
      ctx.shadowBlur = 0
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.95
        p.vy *= 0.95
        p.alpha -= 0.015
        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        // 8-bit style: square particles
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      // Update + draw snakes
      for (let i = 0; i < snakes.length; i++) {
        const s = snakes[i]

        // Respawn dead snake after delay
        if (!s.alive && t - s.explodeTime > REFORM_DELAY) {
          snakes[i] = createSnake()
          continue
        }
        if (!s.alive) continue

        // AI: decide turn every 5 moves
        s.moveCounter++
        if (s.moveCounter % 5 === 0) aiTurn(s)

        // Move on interval
        if (frame % MOVE_INTERVAL === 0) moveSnake(s)

        // Check mouse proximity — EXPLODE!
        const head = s.body[0]
        const dx = head.x - mouseX
        const dy = head.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < EXPLOSION_RADIUS) {
          explodeSnake(s, t)
          continue
        }

        drawSnake(s)
      }

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
  }, [data?.enabled, data?.maxSnakes, data?.explosionRadius])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
        imageRendering: "pixelated",
      }}
      aria-hidden="true"
    />
  )
}
