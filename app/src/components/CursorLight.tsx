"use client";
import { useEffect, useState } from "react";

/**
 * CursorLight — BEIGE NEON «фонарик в темноте»
 * Мягкое бежевое свечение (300px, rgba(214,198,178,0.07)),
 * следующее за курсором мыши.
 * Активируется при движении, исчезает при уходе со страницы.
 */
export default function CursorLight() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
    };
  }, [visible]);

  // Don't render on server / touch devices
  if (typeof window === "undefined") return null;

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
