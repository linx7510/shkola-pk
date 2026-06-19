"use client";
import { useEffect, useRef } from "react";

/**
 * Reveal — scroll reveal animation
 * IntersectionObserver with rootMargin for reliable detection.
 * Fallback: show after 500ms if observer doesn't fire.
 * Supports prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check prefers-reduced-motion — skip animation entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("visible");
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -50px 0px", threshold: 0.05 }
    );
    obs.observe(el);

    // Fallback: show after 500ms in any case (was missing — caused invisible content)
    const timer = setTimeout(() => {
      el.classList.add("visible");
      obs.disconnect();
    }, 500);

    return () => { obs.disconnect(); clearTimeout(timer); };
  }, []);

  const delayClass = delay ? ` reveal-delay-${delay}` : "";

  return (
    <div ref={ref} className={`reveal${delayClass} ${className}`}>
      {children}
    </div>
  );
}
