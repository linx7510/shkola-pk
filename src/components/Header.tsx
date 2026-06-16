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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Курсы", href: "/courses" },
    { label: "Услуги", href: "/#services" },
    { label: "Аудит устава", href: "/#audit" },
    { label: "Консультации", href: "/#consultations" },
    { label: "Блог", href: "/blog" },
    { label: "О нас", href: "/#about" },
  ];

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="header-logo">
            <img
              src="/images/header-logo-tiny.webp"
              alt="Школа ПК"
              className="header-logo-img"
            />
            <span className="header-logo-text">Школа ПК</span>
          </Link>

          <nav className="header-nav-desktop">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="header-nav-link"
              >
                {link.label}
              </a>
            ))}
            <Link href="/login" className="header-nav-link header-login-link">
              Кабинет
            </Link>
            <a href="/#contacts" className="header-cta">
              Записаться
            </a>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="header-burger"
            aria-label="Меню"
          >
            <span className={`burger-line ${mobileOpen ? "open" : ""}`} />
            <span className={`burger-line ${mobileOpen ? "open" : ""}`} />
            <span className={`burger-line ${mobileOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div className={`mobile-menu-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-menu ${mobileOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <Link href="/" className="header-logo" onClick={() => setMobileOpen(false)}>
            <img src="/images/header-logo-tiny.webp" alt="" className="header-logo-img" />
            <span className="header-logo-text">Школа ПК</span>
          </Link>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Закрыть">
            &times;
          </button>
        </div>
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Кабинет
          </Link>
          <a
            href="/#contacts"
            className="btn-primary mobile-cta"
            onClick={() => setMobileOpen(false)}
          >
            Записаться
          </a>
        </nav>
        <div className="mobile-phone">
          <a href="tel:+79024720738" style={{ color: "#E68863", textDecoration: "none", fontSize: "1.1rem" }}>
            +7 902-472-07-38
          </a>
        </div>
      </div>
    </>
  );
}
