"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const serviceLinks = [
  { label: "Аудит устава ПК", href: "/uslugi/audit-ustava" },
  { label: "Пакет документов для ПК", href: "/uslugi#expertise" },
  { label: "Разработка Положений", href: "/uslugi#expertise" },
  { label: "Целевые программы", href: "/uslugi#target-programs" },
  { label: "Налоговая и судебная практика", href: "/uslugi#tax-practice" },
  { label: "Сопровождение при проверках", href: "/uslugi#tax-practice" },
  { label: "Готовый ПК «под ключ»", href: "/uslugi#turnkey" },
  { label: "Бухгалтерское сопровождение", href: "/uslugi#accounting" },
  { label: "Обучение председателей", href: "/uslugi#education" },
  { label: "Сайт для кооператива", href: "/uslugi#website" },
  { label: "Полный прайс-лист", href: "/uslugi#pricing" },
];

const navItems = [
  { label: "Курсы", href: "/kursy" },
  { label: "Услуги для ПК", href: "/uslugi", dropdown: serviceLinks },
  { label: "Бесплатно", href: "/besplatno" },
  { label: "Консультации", href: "/konsultacii" },
  { label: "Блог", href: "/blog" },
  { label: "О нас", href: "/about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleDropdownEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };
  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => setServicesOpen(false), 200);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          <Link href="/" className="header-logo">
            <img src="/images/header-logo-tiny.webp" alt="Школа ПК" className="header-logo-img" />
            <span className="header-logo-text">Школа Кооперативов</span>
          </Link>

          <nav className="header-nav-desktop">
            {navItems.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="header-dropdown-wrap"
                  ref={dropdownRef}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link href={item.href} className="header-nav-link">
                    {item.label}
                    <svg className="dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" style={{ marginLeft: 4, opacity: 0.5 }}>
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </Link>
                  {servicesOpen && (
                    <div className="header-dropdown">
                      {item.dropdown.map((sub) => (
                        <Link key={sub.label} href={sub.href} className="header-dropdown-link">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} href={item.href} className="header-nav-link">
                  {item.label}
                </Link>
              )
            )}
            <Link href="/login" className="header-cta-btn">Кабинет</Link>
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

      <div className={`mobile-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-menu ${mobileOpen ? "active" : ""}`}>
        <div className="mobile-menu-head">
          <Link href="/" className="header-logo" onClick={() => setMobileOpen(false)}>
            <img src="/images/header-logo-tiny.webp" alt="" className="header-logo-img" />
            <span className="header-logo-text">Школа Кооперативов</span>
          </Link>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>&times;</button>
        </div>
        <nav className="mobile-nav">
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.label}>
                <button
                  className="mobile-nav-link mobile-accordion-btn"
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                >
                  {item.label}
                  <span className={`chevron ${mobileServicesOpen ? "open" : ""}`}>+</span>
                </button>
                {mobileServicesOpen && (
                  <div className="mobile-accordion-panel">
                    <Link href={item.href} className="mobile-nav-link mobile-sub" onClick={() => setMobileOpen(false)}>
                      Все услуги
                    </Link>
                    {item.dropdown.map((sub) => (
                      <Link key={sub.label} href={sub.href} className="mobile-nav-link mobile-sub" onClick={() => setMobileOpen(false)}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.label} href={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            )
          )}
          <Link href="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Кабинет</Link>
          <a href="tel:+79024720738" className="mobile-phone-link">+7 (902) 472-07-38</a>
        </nav>
      </div>
    </>
  );
}
