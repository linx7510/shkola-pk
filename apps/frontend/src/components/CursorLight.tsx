"use client";
import { useEffect, useState } from "react";

/**
 * CursorLight — BEIGE NEON «фонарик в темноте»
 * Мягкое бежевое свечение (300px, rgba(214,198,178,0.07)),
 * следующее за курсором мыши.
 * 
 * ОТКЛЮЧЕНО на мобильных (max-width: 768px) и при prefers-reduced-motion
 * для экономии GPU и предотвращения зависания браузера (пункт 17 плана).
 */
export default function CursorLight() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // === Mobile detection (max-width: 768px) — отключаем на телефонах ===
    if (typeof window === "undefined") return;
    
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const checkEnabled = () => {
      setEnabled(!mqMobile.matches && !mqReducedMotion.matches);
    };
    
    checkEnabled();
    
    // Слушаем изменения media query (например, при повороте экрана)
    mqMobile.addEventListener("change", checkEnabled);
    mqReducedMotion.addEventListener("change", checkEnabled);
    
    if (!enabled) {
      return () => {
        mqMobile.removeEventListener("change", checkEnabled);
        mqReducedMotion.removeEventListener("change", checkEnabled);
      };
    }

    let rafId: number;
    let lastX = 0;
    let lastY = 0;

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!visible) setVisible(true);

      // Throttle via rAF for smoothness
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          setPos({ x: lastX, y: lastY });
          rafId = 0;
        });
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (rafId) cancelAnimationFrame(rafId);
      mqMobile.removeEventListener("change", checkEnabled);
      mqReducedMotion.removeEventListener("change", checkEnabled);
    };
  }, [visible, enabled]);

  // Don't render on server / mobile / reduced-motion
  if (typeof window === "undefined") return null;
  if (!enabled) return null;

  return (
    <div
      className="cursor-light"
      aria-hidden="true"
      style={{
        left: pos?.x ?? -500,
        top: pos?.y ?? -500,
        opacity: visible && pos ? 1 : 0,
      }}
    />
  );
}
