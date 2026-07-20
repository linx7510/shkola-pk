"use client"

import Link from "next/link"

/**
 * ExpressAuditCTA — компактный CTA-блок для главной страницы.
 *
 * НЕ содержит интерактивную форму (она на отдельной странице аудита).
 * Это яркая акцентная плашка-ссылка с триггером любопытства:
 *   «Проверьте свой устав бесплатно за 60 секунд» → переход на форму аудита.
 *
 * Встраивается в HomePageClient перед секцией LEAD FORM.
 * Анимация — мягкое свечение (ctaGlow из globals.css).
 */

export default function ExpressAuditCTA() {
  return (
    <section
      id="express-audit-cta"
      style={{
        padding: "3rem 1.5rem",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <Link
        href="/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa#express-audit"
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "1.5rem",
            alignItems: "center",
            padding: "2rem 2.25rem",
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(201,110,77,0.10) 0%, rgba(214,198,178,0.05) 100%)",
            border: "1px solid rgba(201,110,77,0.25)",
            boxShadow: "0 0 40px rgba(201,110,77,0.08)",
            animation: "ctaGlow 8s ease-in-out infinite",
            transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)"
            e.currentTarget.style.borderColor = "rgba(201,110,77,0.45)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.borderColor = "rgba(201,110,77,0.25)"
          }}
        >
          {/* Иконка-щит с галочкой */}
          <div
            style={{
              fontSize: "3rem",
              lineHeight: 1,
              flexShrink: 0,
              filter: "drop-shadow(0 0 12px rgba(230,136,99,0.4))",
            }}
            aria-hidden
          >
            🛡️
          </div>

          {/* Текст */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.3rem 0.85rem",
                borderRadius: 100,
                background: "rgba(201,110,77,0.15)",
                border: "1px solid rgba(201,110,77,0.25)",
                fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#E68863",
                marginBottom: "0.6rem",
              }}
            >
              ⚡ Бесплатно · за 60 секунд
            </div>
            <h3
              style={{
                fontSize: "clamp(1.25rem, 2.5vw, 1.7rem)",
                fontWeight: 800,
                color: "#F5F0E8",
                lineHeight: 1.2,
                marginBottom: "0.4rem",
              }}
            >
              Проверьте свой устав кооператива
            </h3>
            <p
              style={{
                color: "rgba(214,198,178,0.85)",
                fontSize: "0.98rem",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Загрузите устав — наш ИИ-юрист проанализирует его по законам РФ
              и покажет ключевые риски. <strong style={{ color: "#D6C6B2" }}>Без оплаты</strong>,
              результат через минуту.
            </p>
          </div>

          {/* Стрелка-CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C96E4D, #A85538)",
              boxShadow: "0 4px 20px rgba(201,110,77,0.4)",
              flexShrink: 0,
              fontSize: "1.4rem",
              color: "#fff",
            }}
            aria-hidden
          >
            →
          </div>
        </div>
      </Link>

      {/* Социальное доказательство — мелкая строка снизу */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          marginTop: "1rem",
          fontSize: "0.82rem",
          color: "rgba(214,198,178,0.6)",
          flexWrap: "wrap",
        }}
      >
        <span>✓ 10 ключевых блоков проверки</span>
        <span>✓ Законы 3085-1, ГК, НК, 115-ФЗ</span>
        <span>✓ Конфиденциально (152-ФЗ)</span>
      </div>
    </section>
  )
}
