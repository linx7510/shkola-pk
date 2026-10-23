// 404 — максимально статичный компонент: без клиентских обвязок (Header/Footer),
// чистые <a>. Пререндер и рантайм-рендер одинаково отдают полный HTML с H1 и навигацией
// (рантайм-рендер с клиентскими компонентами отдаёт flight-only и робот видит пустую страницу).
export default function NotFound() {
  const links = [
    { href: "/", label: "Главная" },
    { href: "/blog", label: "Блог" },
    { href: "/glossary", label: "Глоссарий" },
    { href: "/uslugi-dlya-potrebitelskih-kooperativov", label: "Услуги" },
    { href: "/ai-konsultant", label: "ИИ-консультант" },
  ];
  return (
    <main style={{ minHeight: "70vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 0" }}>
      <div style={{ maxWidth: 640, textAlign: "center", padding: "0 var(--container-px)" }}>
        <div style={{ fontSize: "5rem", fontWeight: 800, color: "#E68863", lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, color: "#D6C6B2", margin: "1rem 0" }}>
          Страница не найдена
        </h1>
        <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Возможно, страница переехала или в адресе опечатка. Вот откуда можно продолжить:
        </p>
        <nav style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: 999,
                border: "1px solid rgba(230,136,99,0.5)",
                background: "rgba(230,136,99,0.1)",
                color: "#E68863",
                textDecoration: "none",
                fontSize: "1.05rem",
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
