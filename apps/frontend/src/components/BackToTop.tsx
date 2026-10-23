"use client";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 1200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Наверх"
      title="Наверх"
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "1.25rem",
        zIndex: 50,
        width: "2.8rem",
        height: "2.8rem",
        borderRadius: "50%",
        border: "1px solid rgba(230,136,99,0.5)",
        background: "rgba(26,22,18,0.9)",
        color: "#E68863",
        fontSize: "1.2rem",
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      ↑
    </button>
  );
}
