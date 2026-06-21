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
    const REPEL_RADIUS = 100;
    const REPEL_FORCE = 0.5;
    const MAX_PARTICLES = 25;

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
      
      const count = Math.min(MAX_PARTICLES, Math.floor((canvas.width * canvas.height) / 50000));
      particles = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 2 + 0.5,
          baseAlpha: Math.random() * 0.35 + 0.12,
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

        // Плавное появление
        p.alpha += (p.baseAlpha - p.alpha) * 0.02;

        // Рисуем частицу (простой круг вместо радиального градиента для производительности)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ", 80%, 65%, " + p.alpha + ")";
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
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ opacity: 0.8 }}
    />
  );
}

