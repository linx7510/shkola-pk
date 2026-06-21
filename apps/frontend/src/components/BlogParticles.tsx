"use client";
import { useEffect, useRef } from "react";

/**
 * BlogParticles — оптимизированные световые частицы
 * Desktop only (mobile — выключено для экономии GPU).
 * 
 * v2: 25 particles max, visibility API pause, reduced math per frame
 */
export default function BlogParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let paused = false;
    let mouseX = -1000;
    let mouseY = -1000;
    const REPEL_RADIUS = 120;
    const REPEL_FORCE = 0.8;
    const MAX_PARTICLES = 80;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      baseAlpha: number;
      alpha: number;
      hue: number;
    }

    let particles: Particle[] = [];

    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const count = Math.min(MAX_PARTICLES, Math.floor((canvas.width * canvas.height) / 18000));
      particles = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2.5 + 1.2,
          baseAlpha: Math.random() * 0.45 + 0.4,
          alpha: 0,
          hue: Math.random() > 0.5 ? 25 : 35,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx || paused) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Дрейф
        p.x += p.vx;
        p.y += p.vy;

        // Отражение от краёв
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Отталкивание от курсора (упрощённая математика)
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Затухание скорости
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Плавное появление (быстрее)
        p.alpha += (p.baseAlpha - p.alpha) * 0.05;

        // Рисуем частицу со свечением (radial gradient)
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(0.1, p.r * 3));
        glow.addColorStop(0, "hsla(" + p.hue + ", 85%, 70%, " + p.alpha + ")");
        glow.addColorStop(0.4, "hsla(" + p.hue + ", 80%, 60%, " + (p.alpha * 0.4) + ")");
        glow.addColorStop(1, "hsla(" + p.hue + ", 80%, 60%, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.r * 3), 0, Math.PI * 2);
        ctx.fill();

        // Яркое ядро
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ", 90%, 80%, " + Math.min(1, p.alpha * 1.5) + ")";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    // Visibility API — пауза когда вкладка не видна
    const handleVisibility = () => {
      paused = document.hidden;
      if (!paused && !raf) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Обработка мыши
    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    // Обработка ресайза
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      aria-hidden="true"
      style={{ opacity: 1, zIndex: 1 }}
    />
  );
}

