"use client";
import { useEffect, useRef } from "react";

/**
 * BlogParticles — световые частицы из 033
 * Летают по странице, при наведении курсора — разлетаются от него.
 * Desktop only (mobile — выключено для экономии GPU).
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
    let mouseX = -1000;
    let mouseY = -1000;
    const REPEL_RADIUS = 120;
    const REPEL_FORCE = 0.6;

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
      
      // Количество частиц — зависит от площади экрана
      const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
      particles = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 0.5,
          baseAlpha: Math.random() * 0.4 + 0.15,
          alpha: 0,
          hue: Math.random() > 0.5 ? 25 : 35, // оранжевый/бежевый
        });
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
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

        // Отталкивание от курсора
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.alpha = Math.min(1, p.baseAlpha + (1 - dist / REPEL_RADIUS) * 0.6);
        } else {
          // Возврат к базовому
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          // Замедление
          p.vx *= 0.98;
          p.vy *= 0.98;
          // Базовый дрейф
          if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.05;
          if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.05;
        }

        // Ограничение скорости
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) {
          p.vx = (p.vx / speed) * 3;
          p.vy = (p.vy / speed) * 3;
        }

        // Рисуем частицу — свечение
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        if (p.hue === 25) {
          gradient.addColorStop(0, `rgba(230, 136, 99, ${p.alpha})`);
          gradient.addColorStop(0.5, `rgba(230, 136, 99, ${p.alpha * 0.3})`);
          gradient.addColorStop(1, "rgba(230, 136, 99, 0)");
        } else {
          gradient.addColorStop(0, `rgba(214, 198, 178, ${p.alpha})`);
          gradient.addColorStop(0.5, `rgba(214, 198, 178, ${p.alpha * 0.3})`);
          gradient.addColorStop(1, "rgba(214, 198, 178, 0)");
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Ядро
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 25 
          ? `rgba(255, 200, 160, ${p.alpha})` 
          : `rgba(245, 240, 232, ${p.alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onMouseLeave() {
      mouseX = -1000;
      mouseY = -1000;
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
