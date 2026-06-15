"use client";
import { useState } from "react";
import Link from "next/link";
import CursorLight from "@/components/CursorLight";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";

/* ═══════════════════════════════════════════════════════════
   BEIGE NEON — Главная страница Школа ПК
   ═══════════════════════════════════════════════════════════ */

/* ─── Data ─── */
const advantages = [
  { icon: "🟠", title: "Налоги = 0", desc: "НДС, налог на прибыль, НДФЛ и соц.платежи — 0% по закону", color: "orange" },
  { icon: "🛡️", title: "Защита имущества", desc: "ПК не отвечает по долгам пайщиков. Личное имущество в безопасности", color: "green" },
  { icon: "📋", title: "Никаких проверок", desc: "Пожарные, СЭС, Роспотребнадзор не вмешиваются (ФЗ-3085)", color: "blue" },
  { icon: "💰", title: "Возврат пая — не доход", desc: "Паевой взнос возвращается без налогов", color: "orange" },
  { icon: "💳", title: "Онлайн-касса не нужна", desc: "Нет продаж — есть возврат паёв", color: "green" },
  { icon: "🗳️", title: "Один пайщик — один голос", desc: "Демократия в бизнесе", color: "blue" },
];

const stats = [
  { number: "2015", label: "Работаем с 2015 года", color: "beige" },
  { number: "100+", label: "Успешных кейсов", color: "orange" },
  { number: "4", label: "Пакета обучения", color: "green" },
  { number: "12 мес", label: "Поддержка до 12 месяцев", color: "blue" },
];

const howSteps = [
  { num: 1, title: "Объединяетесь с партнёрами", desc: "Минимум 5 участников — физических лиц с 16 лет или юридических лиц. Каждый вносит паевой взнос и становится пайщиком с правом одного голоса независимо от размера пая.", color: "orange" },
  { num: 2, title: "Регистрируете кооператив", desc: "Разрабатываете устав, протокол учредительного собрания, целевую программу. Регистрация в ФНС — 3-5 рабочих дней. Полный цикл под ключ занимает 10-14 дней.", color: "green" },
  { num: 3, title: "Ведёте деятельность без фискальной нагрузки", desc: "Кооперативная цена равна себестоимости — налоговая база равна нулю. НДС, налог на прибыль, НДФЛ с паёв — 0%. Онлайн-касса не нужна.", color: "blue" },
];

const aboutCards = [
  { icon: "⚡", title: "Современный подход", desc: "Цифровизация процессов и адаптация документов к реалиям 2025–2026 годов", color: "orange" },
  { icon: "🎯", title: "Модель С500", desc: "Пять этапов от анализа до запуска. Ни один ПК не ликвидирован ФНС", color: "green" },
  { icon: "📋", title: "Практическая база", desc: "Готовые документы, скрипты и 12 месяцев поддержки после обучения", color: "blue" },
  { icon: "👥", title: "Сообщество 500+", desc: "Более 500 участников из 40 регионов России", color: "orange" },
];

const faqItems = [
  { q: "Что такое потребительский кооператив?", a: "Потребительский кооператив (ПК) — некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников. В отличие от ООО, ПК не преследует извлечение прибыли, освобождён от НДС, налога на прибыль и НДФЛ с паевых взносов (Закон РФ № 3085-1)." },
  { q: "Сколько времени занимает создание ПК под ключ?", a: "Полный цикл занимает от 3 до 7 рабочих дней. Включает разработку устава, протокол учредительного собрания, целевую программу. Регистрация в ФНС — 3-5 рабочих дней. Итого от обращения до ЕГРЮЛ-записи — 10-14 дней." },
  { q: "Какие налоги платит потребительский кооператив?", a: "ПК по Закону № 3085-1 освобождён от НДС (ст. 149 НК РФ), налога на прибыль, НДФЛ с доходов от паевых взносов. Уплачиваются: госпошлина при регистрации, налог на имущество, земельный и транспортный налог." },
  { q: "Сколько человек нужно для создания ПК?", a: "Минимум 5 физических лиц или 3 юридических лица для учреждения потребительского кооператива. Физлицо может быть пайщиком с 16 лет." },
  { q: "Онлайн-касса нужна для ПК?", a: "Нет. Поскольку ПК не осуществляет реализацию товаров, а производит возврат паевых взносов, применение ККТ не требуется (ст. 1.1 ФЗ-54)." },
];

/* ─── Color maps ─── */
const colorRGB: Record<string, string> = {
  orange: "201,110,77",
  green: "76,154,122",
  blue: "58,109,140",
};

const colorVar: Record<string, string> = {
  orange: "var(--color-orange-400)",
  green: "var(--color-green-400)",
  blue: "var(--color-blue-400)",
};

/* ─── Hero ─── */
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "calc(var(--header-h) + 2rem)",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {/* Ambient glow — colour spots drifting */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse, rgba(201,110,77,0.06) 0%, transparent 70%)",
            animation: "ambientDrift 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse, rgba(76,154,122,0.05) 0%, transparent 70%)",
            animation: "ambientDrift 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "3rem",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {/* Badge */}
          <div
            className="mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: 100,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--glass-border)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              marginBottom: "1.5rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-green-400)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Потребительский кооператив — защита активов и ставка 0%
          </div>

          {/* Heading */}
          <h1 style={{ marginBottom: "1.5rem" }}>
            <span className="text-gradient">Первая Онлайн Школа</span>
            <br />
            <span>Потребительских Кооперативов</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "var(--color-text-muted)",
              maxWidth: 540,
              marginBottom: "2rem",
            }}
          >
            НДС, налог на прибыль и соц.платежи — 0% по закону РФ № 3085-1.
            Обучим работе с некоммерческими организациями. Защитите имущество от
            взысканий, обнулите налоги и работайте легально.
          </p>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "2.5rem",
            }}
          >
            <a href="#how" className="btn-primary">
              Выбрать курс
            </a>
            <a href="#contacts" className="btn-secondary">
              Бесплатная консультация
            </a>
          </div>
        </div>

        {/* Right: Logo with glow rings + particles */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              aspectRatio: "1/1",
            }}
          >
            {/* Orbital rings */}
            <div
              style={{
                position: "absolute",
                inset: "-25%",
                borderRadius: "50%",
                border: "1px solid rgba(214,198,178,0.05)",
                animation: "logoRing 16s linear infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-15%",
                borderRadius: "50%",
                border: "1px solid rgba(214,198,178,0.04)",
                animation: "logoRing 12s linear infinite reverse",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-5%",
                borderRadius: "50%",
                border: "1px solid rgba(214,198,178,0.06)",
                animation: "logoRing 8s linear infinite",
              }}
            />

            {/* Floating particles */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 3 + i,
                  height: 3 + i,
                  borderRadius: "50%",
                  background: "rgba(214,198,178,0.3)",
                  animation: `logoGlow ${5 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                  top: `${20 + (i * 12) % 60}%`,
                  left: `${15 + (i * 17) % 70}%`,
                }}
              />
            ))}

            {/* Center emblem */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "logoFloat 6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: "60%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(201,110,77,0.12) 0%, rgba(214,198,178,0.04) 40%, transparent 70%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 0 40px rgba(255,230,200,0.4), 0 0 80px rgba(214,198,178,0.2)",
                  animation: "logoGlow 4s ease-in-out infinite",
                }}
              >
                <span
                  style={{
                    fontSize: "4rem",
                    filter:
                      "drop-shadow(0 0 40px rgba(255,230,200,0.4)) drop-shadow(0 0 80px rgba(214,198,178,0.2))",
                  }}
                >
                  🏛️
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Quote (Pause-section) ─── */
function Quote({ text, author }: { text: string; author: string }) {
  return (
    <Reveal>
      <section className="quote-section">
        <blockquote className="quote-text">&laquo;{text}&raquo;</blockquote>
        <div className="quote-divider" />
        <cite className="quote-author">{author}</cite>
      </section>
    </Reveal>
  );
}

/* ─── Advantages ─── */
function Advantages() {
  return (
    <section id="advantages" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">Преимущества</span>
          <h2 className="section-title">Преимущества</h2>
          <p className="section-subtitle" style={{ marginBottom: "2rem" }}>
            Предприниматели теряют миллионы на налогах и рискуют имуществом. ООО
            и ИП платят НДС, налог на прибыль, НДФЛ и страховые взносы. Но есть
            другой путь — потребительский кооператив по закону РФ № 3085-1.
          </p>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          }}
        >
          {advantages.map((card, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className={`advantage-card advantage-card--${card.color}`}>
                <div className="advantage-card__icon">{card.icon}</div>
                <div className="advantage-card__title">{card.title}</div>
                <div className="advantage-card__desc">{card.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function Stats() {
  return (
    <Reveal>
      <section className="section--light" style={{ padding: "1rem 0" }}>
        <div className="container content-area">
          <div className="stats-bar__inner">
            {stats.map((s, i) => (
              <div key={i}>
                <div className={`stats-bar__number stats-bar__number--${s.color}`}>
                  {s.number}
                </div>
                <div className="stats-bar__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  return (
    <section id="how" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area--wide">
        <Reveal>
          <span
            className="section-label"
            style={{
              justifyContent: "center",
              display: "flex",
            }}
          >
            Как это работает
          </span>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Устал выживать один?{" "}
            <span style={{ color: "var(--color-orange-400)" }}>
              Пора кооперироваться!
            </span>
          </h2>
        </Reveal>
        <div
          style={{
            maxWidth: 800,
            margin: "2rem auto 0",
            display: "grid",
            gap: "1.5rem",
          }}
        >
          {howSteps.map((step, i) => (
            <Reveal key={i} delay={i + 1}>
              <div
                className="glass-2"
                style={{
                  padding: "1.5rem 2rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `rgba(${colorRGB[step.color]},0.12)`,
                    color: colorVar[step.color],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.35rem",
                      color: "var(--color-beige-200)",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─── */
function About() {
  return (
    <section
      id="about"
      className="section--light"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div className="container content-area">
        <Reveal>
          <span className="section-label">О Школе</span>
          <h2 className="section-title">О Школе</h2>
          <p className="section-subtitle">
            Первая онлайн Школа потребительской кооперации — образовательный
            проект, запущенный в 2015 году Велеславом Старковым.
          </p>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.25rem",
            marginTop: "2.5rem",
          }}
        >
          {aboutCards.map((card, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="value-card">
                <div className={`value-card__icon value-card__icon--${card.color}`}>
                  {card.icon}
                </div>
                <div className="value-card__title">{card.title}</div>
                <div className="value-card__desc">{card.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Частые вопросы</h2>
        </Reveal>
        <div
          style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}
        >
          {faqItems.map((faq, i) => (
            <Reveal key={i} delay={Math.min(i + 1, 6)}>
              <div className={`faq-item${openIndex === i ? " open" : ""}`}>
                <button
                  className="faq-item__question"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-item__icon">+</span>
                </button>
                <div
                  className="faq-item__answer"
                  style={{ maxHeight: openIndex === i ? 300 : 0 }}
                >
                  <div className="faq-item__answer-inner">{faq.a}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section
      className="section--light"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div className="container content-area">
        <Reveal>
          <div className="cta__inner">
            <h2 className="cta__title">Готовы начать?</h2>
            <p className="cta__desc">
              Запишитесь на бесплатную консультацию и узнайте, как
              потребительский кооператив поможет вашему бизнесу
            </p>
            <a
              href="#contacts"
              className="btn-primary"
              style={{ fontSize: "1.05rem", padding: "1rem 2.5rem" }}
            >
              Оставить заявку
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Contacts ─── */
function Contacts() {
  return (
    <section id="contacts" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">Контакты</span>
          <h2 className="section-title">Свяжитесь с нами</h2>
        </Reveal>
        <div className="contacts__grid">
          <div>
            {[
              {
                label: "Телефон",
                value: "+7 (902) 472-07-38",
                href: "tel:+79024720738",
              },
              {
                label: "Email",
                value: "boss@2980738.ru",
                href: "mailto:boss@2980738.ru",
              },
              {
                label: "Telegram",
                value: "@Veles_ST (личный)",
                href: "https://t.me/Veles_ST",
              },
              {
                label: "Адрес",
                value: "г. Пермь, ул. Фонтанная, д. 1а/1",
                href: undefined,
              },
            ].map((c, i) => (
              <Reveal key={i} delay={i + 1}>
                <div className="contact-block">
                  <div className="contact-block__label">{c.label}</div>
                  <div className="contact-block__value">
                    {c.href ? (
                      <a
                        href={c.href}
                        target={
                          c.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel="noopener"
                      >
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={3}>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: "grid", gap: "0.75rem" }}
            >
              <input
                type="text"
                className="form-field"
                placeholder="Ваше имя"
              />
              <input
                type="email"
                className="form-field"
                placeholder="Email"
              />
              <input
                type="tel"
                className="form-field"
                placeholder="Телефон (необязательно)"
              />
              <textarea
                className="form-field form-textarea"
                placeholder="Сообщение"
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Отправить
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#D6C6B2",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, var(--color-orange-500), var(--color-beige-300))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0D0C0A",
                  fontWeight: 900,
                  fontSize: "0.9rem",
                }}
              >
                Ш
              </span>
              Школа ПК
            </div>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                maxWidth: 280,
              }}
            >
              Первая Онлайн Школа Потребительских Кооперативов
            </p>
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "var(--color-beige-200)",
                fontSize: "0.9rem",
              }}
            >
              Навигация
            </div>
            {["О школе", "Программа", "FAQ", "Контакты"].map((t) => (
              <div key={t} style={{ marginBottom: "0.4rem" }}>
                <a
                  href={`/#${t === "О школе" ? "about" : t === "Программа" ? "how" : t.toLowerCase()}`}
                >
                  {t}
                </a>
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "var(--color-beige-200)",
                fontSize: "0.9rem",
              }}
            >
              Услуги
            </div>
            {["Обучение", "Консалтинг", "Аудит устава", "Регистрация ПК"].map(
              (t) => (
                <div key={t} style={{ marginBottom: "0.4rem" }}>
                  <a href="#">{t}</a>
                </div>
              )
            )}
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "var(--color-beige-200)",
                fontSize: "0.9rem",
              }}
            >
              Контакты
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.8,
              }}
            >
              <a href="tel:+79024720738">+7 (902) 472-07-38</a>
              <br />
              <a href="mailto:boss@2980738.ru">boss@2980738.ru</a>
              <br />
              <a
                href="https://t.me/Veles_ST"
                target="_blank"
                rel="noopener"
              >
                @Veles_ST
              </a>
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "1.5rem 0",
            borderTop: "1px solid rgba(214,198,178,0.04)",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--color-text-disabled)",
          }}
        >
          &copy; 2026 Школа ПК. Все права защищены.
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <CursorLight />
      <Header />
      <Hero />
      <Quote
        text="Кооперация — это не бизнес-модель. Это архитектура доверия."
        author="— Велеслав Старков"
      />
      <Advantages />
      <Stats />
      <HowItWorks />
      <About />
      <FAQ />
      <CTA />
      <Quote
        text="Один в поле не воин. Но вместе мы — сила, меняющая правила игры."
        author="— Кооперативная мудрость"
      />
      <Contacts />
      <Footer />
    </div>
  );
}
