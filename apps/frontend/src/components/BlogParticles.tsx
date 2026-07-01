"use client";
import { useEffect, useRef, useState } from "react";

/**
 * BlogParticles — оптимизированные световые частицы
 * Desktop only (mobile ≤768px — выключено для экономии GPU).
 * Также отключается при prefers-reduced-motion (пункт 17 плана).
 * 
 * v4: canvas element НЕ рендерится на мобильных (раньше только анимация
 *     останавливалась, но сам canvas оставался в DOM)
 */
export default function BlogParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // === Mobile detection (max-width: 768px) — не рендерим canvas на телефонах ===
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const checkEnabled = () => {
      setEnabled(!mqMobile.matches && !mqReducedMotion.matches);
    };
    
    checkEnabled();
    mqMobile.addEventListener("change", checkEnabled);
    mqReducedMotion.addEventListener("change", checkEnabled);
    
    return () => {
      mqMobile.removeEventListener("change", checkEnabled);
      mqReducedMotion.removeEventListener("change", checkEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let paused = false;
    let mouseX = -1000;
    let mouseY = -1000;
    const REPEL_RADIUS = 110;
    const REPEL_FORCE = 0.6;
    const MAX_PARTICLES = 45;

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
      
      const count = Math.min(MAX_PARTICLES, Math.floor((canvas.width * canvas.height) / 30000));
      particles = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.8 + 0.8,
          baseAlpha: Math.random() * 0.3 + 0.28,
          alpha: 0,
          hue: Math.random() > 0.5 ? 25 : 35,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx || paused) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        p.alpha += (p.baseAlpha - p.alpha) * 0.03;

        const glowR = Math.max(0.1, p.r * 2.2);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        glow.addColorStop(0, "hsla(" + p.hue + ", 80%, 65%, " + (p.alpha * 0.5) + ")");
        glow.addColorStop(1, "hsla(" + p.hue + ", 80%, 65%, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ", 85%, 72%, " + Math.min(1, p.alpha * 1.2) + ")";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    const handleVisibility = () => {
      paused = document.hidden;
      if (!paused && !raf) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("mousemove", handleMouse, { passive: true });

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
  }, [enabled]);

  // Don't render canvas on mobile or when reduced-motion is preferred
  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ opacity: 0.95 }}
    />
  );
}
