"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "О школе", href: "/#about" },
    { label: "Программа", href: "/#how" },
    { label: "Услуги", href: "/#services" },
    { label: "FAQ", href: "/#faq" },
    { label: "Контакты", href: "/#contacts" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 10000,
        height: "var(--header-h)",
        display: "flex",
        alignItems: "center",
        background: scrolled ? "rgba(13,12,10,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(214,198,178,0.06)"
          : "1px solid transparent",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 var(--container-px)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            fontWeight: 700,
            fontSize: "1.05rem",
            color: "#D6C6B2",
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          <img
            src="/images/header-logo-tiny.webp"
            alt=""
            style={{
              width: 40,
              height: 40,
              filter: "brightness(1.2) contrast(1.05) drop-shadow(0 0 10px rgba(255,230,200,0.4))",
            }}
          />
          Школа ПК
        </Link>

        <nav
          className="nav-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flex: 1,
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "rgba(214,198,178,0.6)",
                textDecoration: "none",
                transition: "color 150ms",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#D6C6B2")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color =
                  "rgba(214,198,178,0.6)")
              }
            >
              {link.label}
            </a>
          ))}

          <Link
            href="/login"
            style={{
              marginLeft: "0.5rem",
              fontSize: "0.85rem",
              color: "rgba(214,198,178,0.6)",
              textDecoration: "none",
            }}
          >
            Войти
          </Link>

          <a
            href="/#contacts"
            className="btn-primary"
            style={{
              marginLeft: "auto",
              fontSize: "0.85rem",
              padding: "0.6rem 1.5rem",
              background: "rgba(201,110,77,0.15)",
              border: "1px solid rgba(201,110,77,0.3)",
              boxShadow: "none",
              color: "#E68863",
            }}
          >
            Записаться
          </a>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-mobile-btn"
          style={{
            display: "none",
            background: "rgba(214,198,178,0.12)",
            border: "1px solid rgba(214,198,178,0.3)",
            borderRadius: 8,
            padding: "10px 8px",
            cursor: "pointer",
            color: "#D6C6B2",
            marginLeft: "auto",
          }}
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "var(--header-h)",
            left: 0,
            right: 0,
            background: "rgba(13,12,10,0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(214,198,178,0.08)",
            padding: "1rem var(--container-px)",
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.75rem",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1rem",
                color: "#D6C6B2",
                textDecoration: "none",
                padding: "0.5rem 0",
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{ color: "#E68863", textDecoration: "none" }}
          >
            Войти
          </Link>
          <a
            href="/#contacts"
            className="btn-primary"
            style={{ textAlign: "center" as const }}
            onClick={() => setMobileOpen(false)}
          >
            Записаться
          </a>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
