"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * CookieConsent — компактный баннер согласия на использование cookie
 * Показывается один раз, выбор сохраняется 6 месяцев в localStorage
 */
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie-consent");
      if (!consent) {
        // Small delay so it doesn't flash on page load
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie-consent", JSON.stringify({
        accepted: true,
        date: new Date().toISOString(),
      }));
    } catch {}
    setShow(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("cookie-consent", JSON.stringify({
        accepted: false,
        date: new Date().toISOString(),
      }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(13, 12, 10, 0.98)",
        borderTop: "1px solid rgba(184, 149, 106, 0.3)",
        padding: "0.65rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
        fontSize: "0.8rem",
        color: "#D6C6B2",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        animation: "slideUp 0.3s ease",
      }}
    >
      <span style={{ maxWidth: 580, lineHeight: 1.4 }}>
        Мы используем cookie для работы сайта и аналитики. Продолжая, вы соглашаетесь с{" "}
        <Link
          href="/politika-konfidentsialnosti"
          style={{ color: "#B8956A", textDecoration: "underline" }}
        >
          Политикой конфиденциальности
        </Link>{" "}
        (152-ФЗ).
      </span>
      <button
        onClick={handleAccept}
        style={{
          background: "#B8956A",
          color: "#0D0C0A",
          border: "none",
          borderRadius: "4px",
          padding: "0.4rem 1rem",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Принять
      </button>
      <button
        onClick={handleDecline}
        style={{
          background: "transparent",
          color: "#8B7E6B",
          border: "1px solid rgba(214,198,178,0.2)",
          borderRadius: "4px",
          padding: "0.4rem 0.75rem",
          fontSize: "0.8rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Отклонить
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
