"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

/**
 * LazyAIChatButton — плавающая круглая кнопка AI-консультанта.
 * Отображается в правом нижнем углу на ВСЕХ страницах сайта.
 * При клике lazy-загружает AIChatWidget (отдельный chunk, не блокирует LCP).
 *
 * Подключается в layout.tsx — глобально для всех страниц.
 */
const AIChatWidget = dynamic(() => import("../app/home/AIChatWidget").then(m => m.AIChatWidget), { ssr: false });

export default function LazyAIChatButton() {
  const [open, setOpen] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  const handleClick = () => {
    if (!widgetLoaded) setWidgetLoaded(true);
    setOpen(!open);
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Открыть чат с AI-консультантом"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #C96E4D, #E68863)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(201,110,77,0.4), 0 0 30px rgba(230,136,99,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "#0D0C0A",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
      </button>
      {widgetLoaded && open && <AIChatWidget />}
    </>
  );
}
