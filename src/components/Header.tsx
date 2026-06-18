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
            {/* Кабинет — рядом с навигацией, как в 033 */}
            <Link href="/login" className="header-cta-btn">Кабинет</Link>
          </nav>

          {/* Правый верхний угол: телефон + соцсети */}
          <div className="header-right-cluster">
            <a href="tel:+79024720738" className="header-phone" title="Позвонить">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="header-phone-text">+7 (902) 472-07-38</span>
            </a>
            <div className="header-socials">
              <a href="https://t.me/Veles_ST" target="_blank" rel="noopener noreferrer" className="header-social-link" title="Telegram @Veles_ST" aria-label="Telegram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.94 4.34l-3.32 15.65c-.25 1.1-.9 1.37-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.13L17.96 6.4c.41-.36-.09-.57-.64-.21L7.04 12.36l-4.96-1.55c-1.08-.34-1.1-1.08.23-1.6L20.55 2.78c.9-.33 1.69.21 1.39 1.56z"/>
                </svg>
              </a>
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="header-social-link" title="ВКонтакте" aria-label="VK">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.785 16.241s.288-.032.435-.193c.135-.146.131-.42.131-.42s-.018-1.304.586-1.496c.596-.19 1.36 1.26 2.172 1.818.61.42 1.075.328 1.075.328l2.168-.03s1.133-.07.596-.954c-.044-.072-.313-.657-1.61-1.864-1.36-1.26-1.18-1.056.46-3.232.998-1.328 1.397-2.14 1.273-2.487-.119-.336-.856-.247-.856-.247l-2.44.015s-.181-.025-.315.055c-.131.078-.215.26-.215.26s-.386 1.024-.9 1.894c-1.083 1.85-1.516 1.948-1.694 1.832-.412-.266-.31-1.067-.31-1.635 0-1.778.27-2.52-.525-2.713-.264-.063-.458-.105-1.13-.112-.866-.009-1.598.003-2.012.205-.276.135-.488.435-.359.452.16.022.522.099.714.36.247.337.239 1.094.239 1.094s.142 2.077-.33 2.335c-.325.176-.77-.184-1.74-1.864-.495-.855-.868-1.8-.868-1.8s-.072-.176-.2-.27c-.156-.114-.374-.15-.374-.15l-2.316.015s-.348.01-.476.16c-.114.135-.009.413-.009.413s1.81 4.243 3.86 6.385c1.88 1.962 4.013 1.832 4.013 1.832h.964z"/>
                </svg>
              </a>
              <a href="mailto:boss@2980738.ru" className="header-social-link" title="Написать на email" aria-label="Email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>
          </div>

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
            <img src="/images/header-logo-tiny.webp" alt="Логотип Школа Кооперативов — Велеслав Старков" className="header-logo-img" />
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
          {/* Соцсети в мобильном меню */}
          <div className="mobile-socials">
            <a href="https://t.me/Veles_ST" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Telegram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.94 4.34l-3.32 15.65c-.25 1.1-.9 1.37-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.13L17.96 6.4c.41-.36-.09-.57-.64-.21L7.04 12.36l-4.96-1.55c-1.08-.34-1.1-1.08.23-1.6L20.55 2.78c.9-.33 1.69.21 1.39 1.56z"/>
              </svg>
            </a>
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="VK">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.435-.193c.135-.146.131-.42.131-.42s-.018-1.304.586-1.496c.596-.19 1.36 1.26 2.172 1.818.61.42 1.075.328 1.075.328l2.168-.03s1.133-.07.596-.954c-.044-.072-.313-.657-1.61-1.864-1.36-1.26-1.18-1.056.46-3.232.998-1.328 1.397-2.14 1.273-2.487-.119-.336-.856-.247-.856-.247l-2.44.015s-.181-.025-.315.055c-.131.078-.215.26-.215.26s-.386 1.024-.9 1.894c-1.083 1.85-1.516 1.948-1.694 1.832-.412-.266-.31-1.067-.31-1.635 0-1.778.27-2.52-.525-2.713-.264-.063-.458-.105-1.13-.112-.866-.009-1.598.003-2.012.205-.276.135-.488.435-.359.452.16.022.522.099.714.36.247.337.239 1.094.239 1.094s.142 2.077-.33 2.335c-.325.176-.77-.184-1.74-1.864-.495-.855-.868-1.8-.868-1.8s-.072-.176-.2-.27c-.156-.114-.374-.15-.374-.15l-2.316.015s-.348.01-.476.16c-.114.135-.009.413-.009.413s1.81 4.243 3.86 6.385c1.88 1.962 4.013 1.832 4.013 1.832h.964z"/>
              </svg>
            </a>
            <a href="mailto:boss@2980738.ru" className="mobile-social-link" aria-label="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
