"use client"
import { useEffect, useRef, useCallback } from "react"

export interface SnakeAnimationBlockData {
  enabled?: boolean
  maxSnakes?: number
  explosionRadius?: number
}

/* ─── Types ─── */
interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; size: number; hue: number
}

interface FoodItem {
  x: number; y: number; size: number; hue: number
  pulse: number; pulseDir: number; eaten: boolean
}

interface SnakeSegment { x: number; y: number }

interface Snake {
  segments: SnakeSegment[]
  dx: number; dy: number; targetDx: number; targetDy: number
  speed: number; moveTimer: number; moveInterval: number
  hue: number; exploding: boolean; explodeTimer: number
  particles: Particle[]; depth: number
}

/* ─── Constants ─── */
const GRID = 14
const SEGMENT_GAP = 1
const MAX_SEGMENTS = 28
const FOOD_COUNT = 6
const DEPTH_RANGE = 6

/* ─── Component ─── */
export function SnakeAnimationBlock({ data }: { data: SnakeAnimationBlockData }) {
  const enabled = data?.enabled !== false
  const maxSnakes = data?.maxSnakes ?? 3
  const explosionRadius = data?.explosionRadius ?? 70

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snakesRef = useRef<Snake[]>([])
  const foodsRef = useRef<FoodItem[]>([])
  const rafRef = useRef<number>(0)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const dimensionsRef = useRef({ w: 0, h: 0 })

  const createSnake = useCallback(
    (w: number, h: number, index: number): Snake => {
      const startX = Math.floor(Math.random() * (w / GRID - 10)) + 5
      const startY = Math.floor(Math.random() * (h / GRID - 10)) + 5
      const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
      ]
      const dir = directions[Math.floor(Math.random() * directions.length)]
      const hue = (index * 120 + Math.random() * 60) % 360
      const segments: SnakeSegment[] = []
      for (let i = 0; i < 12; i++) {
        segments.push({ x: startX - dir.dx * i * SEGMENT_GAP, y: startY - dir.dy * i * SEGMENT_GAP })
      }
      return {
        segments, dx: dir.dx, dy: dir.dy, targetDx: dir.dx, targetDy: dir.dy,
        speed: 0.6 + Math.random() * 0.5, moveTimer: 0,
        moveInterval: 3 + Math.floor(Math.random() * 4), hue,
        exploding: false, explodeTimer: 0, particles: [],
        depth: 3 + Math.floor(Math.random() * (DEPTH_RANGE - 2)),
      }
    }, [],
  )

  const createFood = useCallback(
    (w: number, h: number, existingSnakes: Snake[]): FoodItem => {
      let x: number, y: number, attempts = 0
      do {
        x = Math.floor(Math.random() * (w / GRID - 4)) + 2
        y = Math.floor(Math.random() * (h / GRID - 4)) + 2
        attempts++
      } while (
        attempts < 50 &&
        existingSnakes.some((s) => s.segments.some((seg) => Math.abs(seg.x - x) < 3 && Math.abs(seg.y - y) < 3))
      )
      return { x, y, size: 1, hue: 40 + Math.random() * 30, pulse: 0, pulseDir: 1, eaten: false }
    }, [],
  )

  const init = useCallback(
    (canvas: HTMLCanvasElement) => {
      const w = window.innerWidth
      const h = document.documentElement.scrollHeight
      canvas.width = w; canvas.height = h
      dimensionsRef.current = { w, h }
      const snakes: Snake[] = []
      for (let i = 0; i < Math.min(maxSnakes, 3); i++) { snakes.push(createSnake(w, h, i)) }
      snakesRef.current = snakes
      const foods: FoodItem[] = []
      for (let i = 0; i < FOOD_COUNT; i++) { foods.push(createFood(w, h, snakes)) }
      foodsRef.current = foods
    },
    [maxSnakes, createSnake, createFood],
  )

  const update = useCallback(() => {
    const { w, h } = dimensionsRef.current
    const cols = Math.floor(w / GRID)
    const rows = Math.floor(h / GRID)
    for (const snake of snakesRef.current) {
      if (snake.exploding) {
        snake.explodeTimer--
        for (const p of snake.particles) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.08
          p.life--; p.vx *= 0.98; p.vy *= 0.98
        }
        snake.particles = snake.particles.filter((p) => p.life > 0)
        if (snake.explodeTimer <= 0 && snake.particles.length === 0) {
          const idx = snakesRef.current.indexOf(snake)
          snakesRef.current[idx] = createSnake(w, h, idx)
        }
        continue
      }
      snake.moveTimer++
      if (snake.moveTimer < snake.moveInterval) continue
      snake.moveTimer = 0
      if (Math.random() < 0.12) {
        const options = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
        ].filter((d) => !(d.dx === -snake.dx && d.dy === -snake.dy))
        const pick = options[Math.floor(Math.random() * options.length)]
        snake.targetDx = pick.dx; snake.targetDy = pick.dy
      }
      snake.dx = snake.targetDx; snake.dy = snake.targetDy
      const head = snake.segments[0]
      let nx = head.x + snake.dx; let ny = head.y + snake.dy
      if (nx < 0) nx = cols - 1; if (nx >= cols) nx = 0
      if (ny < 0) ny = rows - 1; if (ny >= rows) ny = 0
      snake.segments.unshift({ x: nx, y: ny })
      let ate = false
      for (const food of foodsRef.current) {
        if (!food.eaten && food.x === nx && food.y === ny) {
          food.eaten = true; ate = true
          const idx = foodsRef.current.indexOf(food)
          foodsRef.current[idx] = createFood(w, h, snakesRef.current)
          break
        }
      }
      if (!ate || snake.segments.length > MAX_SEGMENTS) { snake.segments.pop() }
    }
  }, [createSnake, createFood])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { w, h } = dimensionsRef.current
      ctx.clearRect(0, 0, w, h)
      // Draw food (3D style)
      for (const food of foodsRef.current) {
        if (food.eaten) continue
        food.pulse += 0.04 * food.pulseDir
        if (food.pulse > 1 || food.pulse < 0) food.pulseDir *= -1
        const px = food.x * GRID + GRID / 2; const py = food.y * GRID + GRID / 2
        const baseSize = GRID * 0.55; const pulseSize = baseSize + food.pulse * 3; const depthOff = 4
        ctx.fillStyle = `hsla(${food.hue}, 80%, 25%, 0.25)`
        ctx.beginPath(); ctx.arc(px + depthOff, py + depthOff, pulseSize, 0, Math.PI * 2); ctx.fill()
        const grad = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, pulseSize)
        grad.addColorStop(0, `hsla(${food.hue}, 90%, 75%, 0.9)`)
        grad.addColorStop(0.6, `hsla(${food.hue}, 85%, 55%, 0.85)`)
        grad.addColorStop(1, `hsla(${food.hue}, 80%, 35%, 0.7)`)
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(px, py, pulseSize, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `hsla(${food.hue}, 100%, 90%, 0.6)`
        ctx.beginPath(); ctx.arc(px - pulseSize * 0.25, py - pulseSize * 0.25, pulseSize * 0.3, 0, Math.PI * 2); ctx.fill()
      }
      // Draw snakes (3D)
      for (const snake of snakesRef.current) {
        if (snake.exploding) {
          for (const p of snake.particles) {
            const alpha = (p.life / p.maxLife) * 0.9; const depthOff = 3
            ctx.fillStyle = `hsla(${p.hue}, 80%, 20%, ${alpha * 0.3})`
            ctx.beginPath(); ctx.arc(p.x + depthOff, p.y + depthOff, p.size, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
          }
          continue
        }
        const depth = snake.depth
        for (let i = snake.segments.length - 1; i >= 0; i--) {
          const seg = snake.segments[i]
          const px = seg.x * GRID + GRID / 2; const py = seg.y * GRID + GRID / 2
          const t = i / snake.segments.length
          const segSize = GRID * (i === 0 ? 0.52 : 0.42 - t * 0.12)
          ctx.fillStyle = `hsla(${snake.hue}, 60%, 15%, ${0.2 - t * 0.1})`
          ctx.beginPath(); ctx.arc(px + depth, py + depth, segSize + 1, 0, Math.PI * 2); ctx.fill()
          const lightness = i === 0 ? 55 : 45 - t * 15
          const sat = 75 - t * 10
          const bodyGrad = ctx.createRadialGradient(px - segSize * 0.3, py - segSize * 0.3, 0, px, py, segSize + 2)
          bodyGrad.addColorStop(0, `hsla(${snake.hue}, ${sat + 15}%, ${lightness + 20}%, 0.95)`)
          bodyGrad.addColorStop(0.5, `hsla(${snake.hue}, ${sat}%, ${lightness}%, 0.9)`)
          bodyGrad.addColorStop(1, `hsla(${snake.hue}, ${sat - 10}%, ${lightness - 15}%, 0.8)`)
          ctx.fillStyle = bodyGrad; ctx.beginPath(); ctx.arc(px, py, segSize, 0, Math.PI * 2); ctx.fill()
          if (i < 5) {
            ctx.fillStyle = `hsla(${snake.hue}, 100%, 90%, ${0.5 - i * 0.08})`
            ctx.beginPath(); ctx.arc(px - segSize * 0.25, py - segSize * 0.25, segSize * 0.35, 0, Math.PI * 2); ctx.fill()
          }
          if (i === 0) {
            const eyeOff = segSize * 0.3; const eyeR = segSize * 0.18
            const ex1 = px + snake.dy * eyeOff - snake.dx * eyeOff * 0.3
            const ey1 = py - snake.dx * eyeOff - snake.dy * eyeOff * 0.3
            const ex2 = px + snake.dy * eyeOff + snake.dx * eyeOff * 0.3
            const ey2 = py - snake.dx * eyeOff + snake.dy * eyeOff * 0.3
            ctx.fillStyle = 'rgba(255,255,255,0.9)'
            ctx.beginPath(); ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2); ctx.fill()
            ctx.beginPath(); ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = 'rgba(20,20,20,0.9)'
            ctx.beginPath(); ctx.arc(ex1 + snake.dx * 1.2, ey1 + snake.dy * 1.2, eyeR * 0.55, 0, Math.PI * 2); ctx.fill()
            ctx.beginPath(); ctx.arc(ex2 + snake.dx * 1.2, ey2 + snake.dy * 1.2, eyeR * 0.55, 0, Math.PI * 2); ctx.fill()
          }
        }
      }
    }, [],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = e.clientX - rect.left + window.scrollX
      const my = e.clientY - rect.top + window.scrollY
      mouseRef.current = { x: mx, y: my }
      for (const snake of snakesRef.current) {
        if (snake.exploding) continue
        for (const seg of snake.segments) {
          const px = seg.x * GRID + GRID / 2; const py = seg.y * GRID + GRID / 2
          const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2)
          if (dist < explosionRadius) {
            snake.exploding = true; snake.explodeTimer = 60; snake.particles = []
            for (const s of snake.segments) {
              const sx = s.x * GRID + GRID / 2; const sy = s.y * GRID + GRID / 2
              for (let p = 0; p < 3; p++) {
                const angle = Math.random() * Math.PI * 2
                const speed = 1 + Math.random() * 4
                snake.particles.push({
                  x: sx, y: sy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
                  life: 30 + Math.floor(Math.random() * 30), maxLife: 60,
                  size: 2 + Math.random() * 3, hue: snake.hue + Math.random() * 40 - 20,
                })
              }
            }
            break
          }
        }
      }
    },
    [explosionRadius],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !enabled) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    init(canvas)
    let running = true
    const loop = () => {
      if (!running) return
      update(); draw(ctx)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    window.addEventListener("mousemove", handleMouseMove)
    const onResize = () => {
      const w = window.innerWidth; const h = document.documentElement.scrollHeight
      canvas.width = w; canvas.height = h
      dimensionsRef.current = { w, h }
    }
    window.addEventListener("resize", onResize)
    return () => {
      running = false; cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", onResize)
    }
  }, [enabled, init, update, draw, handleMouseMove])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 9999, opacity: 0.6,
        imageRendering: "auto",
      }}
    />
  )
}
