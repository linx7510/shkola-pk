"use client";
import { useEffect, useRef } from "react";

/**
 * HeroCanvas — анимация «созвездия» в hero-секции.
 * Точная копия анимации с velaslav.rus (index.php → home.min.js → heroCanvas).
 *
 * 60 светящихся бежевых точек (nodes) дрейфуют по hero-секции,
 * пульсируют (sin wave) и соединяются линиями когда находятся близко (maxDist=180px).
 * Mobile (<769px): выключено для экономии GPU.
 *
 * Источник: /home/z/my-project/source/js/home.min.js (блок heroCanvas).
 */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const nodeCount = 60;
    const maxDist = 180;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }
    let nodes: Node[] = [];

    function resize() {
      if (!canvas || !ctx || !parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function initNodes() {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
        });
      }
    }

    let time = 0;
    function draw() {
      if (!canvas || !ctx || !parent) return;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      time += 0.005;

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));

        const pulse = Math.sin(time * 2 + i) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.1, n.r * pulse), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(214,198,178," + n.alpha * pulse + ")";
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = "rgba(214,198,178," + alpha + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    // IntersectionObserver — pause when hero not visible
    let heroObs: IntersectionObserver | null = null;
    const heroEl = document.getElementById("hero");
    if (heroEl && "IntersectionObserver" in window) {
      heroObs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (!raf) raf = requestAnimationFrame(draw);
          } else {
            if (raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          }
        },
        { threshold: 0.05 }
      );
      heroObs.observe(heroEl);
    }

    // Visibility API — pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else {
        if (!raf && heroEl && heroEl.getBoundingClientRect().top < window.innerHeight) {
          raf = requestAnimationFrame(draw);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Resize handler (debounced)
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        initNodes();
      }, 200);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    resize();
    initNodes();
    raf = requestAnimationFrame(draw);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      if (heroObs) heroObs.disconnect();
    };
  }, []);

  return (
    <div
      className="hero__bg-canvas"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
