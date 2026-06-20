"use client"
import Link from "next/link"

export default function Footer() {
  return (
    <footer style={{
      background: "rgba(13,12,10,0.95)",
      borderTop: "1px solid rgba(214,198,178,0.1)",
      padding: "3rem 0 1.5rem",
      color: "#D6C6B2",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      zIndex: 2,
    }}>
      <div className="footer-grid" style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
        gap: "3rem",
        maxWidth: 1600,
        margin: "0 auto",
        padding: "0 clamp(1rem, 4vw, 4rem)",
        marginBottom: "2.5rem",
      }}>
        {/* О школе */}
        <div>
          <div style={{
            fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "rgba(214,198,178,0.5)",
            marginBottom: "1.25rem",
          }}>О школе</div>
          <div style={{
            fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(214,198,178,0.7)",
          }}>
            Первая Онлайн Школа Потребительских Кооперативов. Обучение, консалтинг и юридическое сопровождение потребительских кооперативов по всей России. Закон РФ № 3085-1.
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <a href="https://t.me/Veles_ST" target="_blank" rel="noopener" title="Telegram" style={socialStyle}>TG</a>
            <a href="https://t.me/OnlinePK" target="_blank" rel="noopener" title="Telegram канал" style={socialStyle}>CH</a>
            <a href="https://vk.com/cooperator" target="_blank" rel="noopener" title="ВКонтакте" style={socialStyle}>VK</a>
            <a href="https://www.youtube.com/@cooperator" target="_blank" rel="noopener" title="YouTube" style={socialStyle}>YT</a>
            <a href="/pomosch-proektu" title="Помощь проекту" style={socialStyle}>❤</a>
          </div>
        </div>

        {/* Навигация */}
        <div>
          <div style={{
            fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "rgba(214,198,178,0.5)",
            marginBottom: "1.25rem",
          }}>Навигация</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { label: "Услуги", href: "/uslugi" },
              { label: "Курсы", href: "/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" },
              { label: "Глоссарий", href: "/glossary" },
              { label: "FAQ", href: "/faq" },
              { label: "Блог", href: "/blog" },
              { label: "О нас", href: "/about" },
              { label: "Помощь проекту", href: "/pomosch-proektu" },
            ].map((link) => (
              <li key={link.href} style={{ marginBottom: "0.6rem" }}>
                <Link href={link.href} className="footer-link" style={{
                  fontSize: "0.9rem", color: "rgba(214,198,178,0.6)",
                  textDecoration: "none", transition: "color 0.15s",
                }}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Рассылка */}
        <div>
          <div style={{
            fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "rgba(214,198,178,0.5)",
            marginBottom: "1.25rem",
          }}>Рассылка</div>
          <p style={{
            fontSize: "0.85rem", color: "rgba(214,198,178,0.55)",
            marginBottom: "0.75rem", lineHeight: 1.5,
          }}>Новости кооперации и правовые обновления на ваш email</p>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="Ваш email"
              required
              style={{
                flex: 1, minWidth: 140, padding: "0.5rem 0.75rem",
                background: "#121110", border: "1px solid rgba(214,198,178,0.15)",
                borderRadius: 6, color: "#D6C6B2", fontSize: "0.8125rem", outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #C06030, #A85028)",
              color: "#fff", border: "none", borderRadius: 6,
              fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }}>Подписаться</button>
          </form>
        </div>

        {/* Контакты */}
        <div>
          <div style={{
            fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "rgba(214,198,178,0.5)",
            marginBottom: "1.25rem",
          }}>Контакты</div>
          <div style={contactStyle}>
            <span>📧</span>
            <a href="mailto:boss@2980738.ru" className="footer-link" style={contactLinkStyle}>boss@2980738.ru</a>
          </div>
          <div style={contactStyle}>
            <span>📱</span>
            <a href="tel:+79024720738" className="footer-link" style={contactLinkStyle}>+7 (902) 472-07-38</a>
          </div>
          <div style={contactStyle}>
            <span>💬</span>
            <a href="https://t.me/Veles_ST" target="_blank" rel="noopener" className="footer-link" style={contactLinkStyle}>Telegram: @Veles_ST</a>
          </div>
          <div style={contactStyle}>
            <span>📍</span>
            <span style={{ color: "rgba(214,198,178,0.7)" }}>г. Пермь, ул. Фонтанная, д. 1а/1</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        maxWidth: 1600, margin: "0 auto",
        padding: "1.25rem clamp(1rem, 4vw, 4rem) 0",
        borderTop: "1px solid rgba(214,198,178,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "0.78rem", color: "rgba(214,198,178,0.35)",
        flexWrap: "wrap", gap: "0.5rem",
      }}>
        <span>© ИП Старков Велеслав Владимирович, 2015–2026. Все права защищены.</span>
        <Link href="/politika-konfidentsialnosti" className="footer-link" style={{
          color: "rgba(214,198,178,0.45)", textDecoration: "none", transition: "color 0.15s",
        }}>Политика конфиденциальности</Link>
      </div>

      <style>{`
        .footer-link:hover { color: #C06030 !important; }
        @media (max-width: 767px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </footer>
  )
}

const socialStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(214,198,178,0.12)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "rgba(214,198,178,0.5)", textDecoration: "none",
  fontSize: "0.85rem", transition: "all 0.15s",
}

const contactStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.6rem",
  marginBottom: "0.75rem", fontSize: "0.9rem",
  color: "rgba(214,198,178,0.7)",
}

const contactLinkStyle: React.CSSProperties = {
  color: "rgba(214,198,178,0.7)", textDecoration: "none", transition: "color 0.15s",
}
