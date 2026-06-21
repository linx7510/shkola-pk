"use client";
import { useEffect, useRef, useCallback } from "react";

/**
 * SnakeCanvas — объёмная змейка + светящиеся точки для BEIGE NEON
 * GPU-оптимизировано: canvas 2D, requestAnimationFrame, willReadFrequently: false
 */
export default function SnakeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = 0, H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // === Змейка ===
    const SEGMENTS = 60;
    const SEG_DIST = 12;
    const snake: { x: number; y: number }[] = [];
    let headX = W * 0.3, headY = H * 0.5;
    let angle = 0;
    let targetAngle = Math.random() * Math.PI * 2;

    for (let i = 0; i < SEGMENTS; i++) {
      snake.push({ x: headX - i * SEG_DIST * 0.5, y: headY });
    }

    // === Светящиеся точки (оранжевые и зелёные) ===
    interface Dot {
      x: number; y: number;
      vx: number; vy: number;
      radius: number;
      color: string;
      alpha: number;
      pulse: number;
      pulseSpeed: number;
    }

    const dots: Dot[] = [];
    const DOT_COUNT = 25;
    const colors = [
      "rgba(201,110,77,",  // orange
      "rgba(107,191,140,",  // green
      "rgba(214,198,178,",  // beige
    ];

    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    // === Animation loop ===
    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // --- Update snake ---
      // Change direction periodically
      if (frame % 120 === 0) {
        targetAngle = Math.random() * Math.PI * 2;
      }
      // Smooth turn towards target
      const angleDiff = targetAngle - angle;
      angle += angleDiff * 0.02;

      // Add some waviness
      const wave = Math.sin(frame * 0.03) * 0.3;
      headX += Math.cos(angle + wave) * 1.8;
      headY += Math.sin(angle + wave) * 1.8;

      // Wrap around screen
      if (headX < -50) headX = W + 50;
      if (headX > W + 50) headX = -50;
      if (headY < -50) headY = H + 50;
      if (headY > H + 50) headY = -50;

      // Update segments (follow the leader)
      snake[0] = { x: headX, y: headY };
      for (let i = 1; i < snake.length; i++) {
        const prev = snake[i - 1];
        const curr = snake[i];
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > SEG_DIST) {
          const ratio = SEG_DIST / dist;
          curr.x = prev.x - dx * ratio;
          curr.y = prev.y - dy * ratio;
        }
      }

      // --- Draw snake with volume ---
      // Outer glow
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Shadow/glow layer (wide, low opacity)
      for (let i = 1; i < snake.length; i++) {
        const t = 1 - i / snake.length;
        const glowWidth = (6 + t * 12) * 2.5;
        const alpha = t * 0.08;
        ctx.beginPath();
        ctx.moveTo(snake[i - 1].x, snake[i - 1].y);
        ctx.lineTo(snake[i].x, snake[i].y);
        ctx.strokeStyle = `rgba(201,110,77,${alpha})`;
        ctx.lineWidth = glowWidth;
        ctx.stroke();
      }

      // Main body with gradient thickness
      for (let i = 1; i < snake.length; i++) {
        const t = 1 - i / snake.length;
        const bodyWidth = 3 + t * 7; // 3px tail -> 10px head
        const alpha = 0.15 + t * 0.5; // More opaque at head

        ctx.beginPath();
        ctx.moveTo(snake[i - 1].x, snake[i - 1].y);
        ctx.lineTo(snake[i].x, snake[i].y);
        ctx.strokeStyle = `rgba(201,110,77,${alpha})`;
        ctx.lineWidth = bodyWidth;
        ctx.stroke();
      }

      // Highlight line (thin bright core)
      for (let i = 1; i < snake.length; i += 2) {
        const t = 1 - i / snake.length;
        if (t < 0.3) continue; // No highlight on thin tail
        const coreWidth = 1 + t * 2;

        ctx.beginPath();
        ctx.moveTo(snake[i - 1].x, snake[i - 1].y);
        ctx.lineTo(snake[i].x, snake[i].y);
        ctx.strokeStyle = `rgba(255,220,180,${t * 0.4})`;
        ctx.lineWidth = coreWidth;
        ctx.stroke();
      }

      // Head dot (bright, with glow)
      ctx.beginPath();
      ctx.arc(headX, headY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201,110,77,0.8)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(headX, headY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201,110,77,0.15)";
      ctx.fill();

      // Tiny bright core of head
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,220,180,0.9)";
      ctx.fill();

      ctx.restore();

      // --- Draw glowing dots with volume ---
      for (const dot of dots) {
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.pulse += dot.pulseSpeed;

        // Wrap
        if (dot.x < -20) dot.x = W + 20;
        if (dot.x > W + 20) dot.x = -20;
        if (dot.y < -20) dot.y = H + 20;
        if (dot.y > H + 20) dot.y = -20;

        const pulseAlpha = dot.alpha * (0.6 + 0.4 * Math.sin(dot.pulse));
        const pulseRadius = dot.radius * (0.85 + 0.15 * Math.sin(dot.pulse));

        // Outer glow
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = dot.color + (pulseAlpha * 0.12).toFixed(2) + ")";
        ctx.fill();

        // Mid glow
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = dot.color + (pulseAlpha * 0.25).toFixed(2) + ")";
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color + pulseAlpha.toFixed(2) + ")";
        ctx.fill();

        // Bright center
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = dot.color + (pulseAlpha * 1.2).toFixed(2) + ")";
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

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
        opacity: 0.7,
      }}
    />
  );
}
