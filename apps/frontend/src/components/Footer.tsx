"use client"
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [footerData, setFooterData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/globals/footer")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setFooterData(data); })
      .catch(() => {});
  }, []);

  const columns = footerData?.columns || [];
  const copyright = footerData?.bottomBar?.copyright;
  const legalLinks = footerData?.bottomBar?.legalLinks || [];

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
        gridTemplateColumns: columns.length === 4 ? "1.5fr 1fr 1fr 1fr" : columns.length > 0 ? `repeat(${columns.length}, 1fr)` : "1.5fr 1fr 1fr 1fr",
        gap: "3rem",
        maxWidth: 1600,
        margin: "0 auto",
        padding: "0 clamp(1rem, 4vw, 4rem)",
        marginBottom: "2.5rem",
      }}>
        {columns.map((col: any, idx: number) => (
          <div key={col.id || idx}>
            {col.title && (
              <div style={{
                fontSize: "1rem", fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.12em", color: "rgba(214,198,178,0.8)",
                marginBottom: "1.25rem",
              }}>{col.title}</div>
            )}

            {/* Type: text */}
            {col.type === "text" && col.text && (
              <div className="footer-text-col" style={{
                fontSize: "1rem", lineHeight: 1.7, color: "rgba(214,198,178,0.8)",
              }} dangerouslySetInnerHTML={{ __html: col.text }} />
            )}

            {/* Type: links */}
            {col.type === "links" && Array.isArray(col.links) && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map((link: any, lidx: number) => (
                  <li key={link.id || lidx} style={{ marginBottom: "0.6rem" }}>
                    <Link href={link.href} className="footer-link" style={{
                      fontSize: "1rem", color: "rgba(214,198,178,0.75)",
                      textDecoration: "none", transition: "color 0.15s",
                    }}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Type: socials */}
            {col.type === "socials" && Array.isArray(col.socials) && (
              <>
                {/* О школе description - shown above socials only for first column */}
                {idx === 0 && (
                  <div style={{
                    fontSize: "1rem", lineHeight: 1.7, color: "rgba(214,198,178,0.8)",
                    marginBottom: "1rem",
                  }}>
                    Первая Онлайн Школа Потребительских Кооперативов. Обучение, консалтинг и юридическое сопровождение потребительских кооперативов по всей России. Закон РФ № 3085-1.
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {col.socials.map((soc: any, sidx: number) => {
                    const isInternal = soc.href && soc.href.startsWith("/");
                    const socialStyle: React.CSSProperties = {
                      width: 36, height: 36, borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(214,198,178,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(214,198,178,0.8)", textDecoration: "none",
                      fontSize: "1.05rem", transition: "all 0.15s",
                    };
                    return isInternal ? (
                      <Link key={soc.id || sidx} href={soc.href} title={soc.title || soc.label}
                        style={socialStyle} className="footer-social-link">{soc.label}</Link>
                    ) : (
                      <a key={soc.id || sidx} href={soc.href} target="_blank" rel="noopener noreferrer"
                        title={soc.title || soc.label} style={socialStyle} className="footer-social-link">{soc.label}</a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1600, margin: "0 auto",
        padding: "1.25rem clamp(1rem, 4vw, 4rem) 0",
        borderTop: "1px solid rgba(214,198,178,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "0.78rem", color: "rgba(214,198,178,0.35)",
        flexWrap: "wrap", gap: "0.5rem",
      }}>
        <span>{copyright || "© ИП Старков Велеслав Владимирович, 2015–2026. Все права защищены."}</span>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {legalLinks.map((link: any, lidx: number) => (
            <Link key={link.id || lidx} href={link.href} className="footer-link" style={{
              color: "rgba(214,198,178,0.45)", textDecoration: "none", transition: "color 0.15s",
            }}>{link.label}</Link>
          ))}
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #C06030 !important; }
        .footer-social-link:hover { color: #C06030 !important; border-color: rgba(192,96,48,0.4) !important; }
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
