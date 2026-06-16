"use client";
import { useState, useRef, useEffect } from "react";
import CursorLight from "@/components/CursorLight";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";

/* ═══════════════════════════════════════════════════════════
   BEIGE NEON — Главная страница Школа ПК v3
   Логотип-дерево, heading-sweep (color sweep), AI-консультант,
   облако тегов, услуги, аккордеон о школе, расширенный FAQ
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

/* ─── Услуги ─── */
const services = [
  { icon: "🎓", title: "Обучение потребительской кооперации", desc: "Полный курс от основ до практики. Четыре пакета обучения: Базовый, Стандарт, Премиум и VIP. Разбираем налоги, устав, регистрацию и ведение ПК.", color: "orange", price: "от 15 000 ₽" },
  { icon: "⚖️", title: "Консалтинг и аудит устава", desc: "Проверка уставных документов действующих кооперативов. Аудит на соответствие ФЗ-3085, рекомендации по устранению рисков. Защита от претензий ФНС.", color: "green", price: "от 25 000 ₽" },
  { icon: "📝", title: "Регистрация ПК под ключ", desc: "Полный цикл: разработка устава, целевой программы, протокола учредительного собрания, подача в ФНС. Результат — ЕГРЮЛ запись за 10-14 дней.", color: "blue", price: "от 50 000 ₽" },
  { icon: "🛡️", title: "Защита активов через ПК", desc: "Структурирование имущества через потребительский кооператив. Личное имущество пайщика защищено от взысканий. Юридически чистая схема по закону РФ.", color: "orange", price: "от 35 000 ₽" },
  { icon: "📊", title: "Бухгалтерский учёт ПК", desc: "Настройка бухгалтерии кооператива: учёт паевых взносов, возвратов, целевых программ. Автоматизация отчётности. Обучение бухгалтера.", color: "green", price: "от 20 000 ₽" },
  { icon: "🤝", title: "Сопровождение 12 месяцев", desc: "Постоянная юридическая и бухгалтерская поддержка после регистрации. Ответы на вопросы, внесение изменений в устав, представительство в ФНС.", color: "blue", price: "включено в Премиум" },
];

/* ─── Аккордеон «О Школе ПК» ─── */
const aboutAccordion = [
  { title: "Миссия Школы ПК", content: "Наша миссия — сделать потребительскую кооперацию доступной для каждого предпринимателя в России. Мы верим, что кооперативная модель — это честный и законный способ защитить активы, снизить налоговую нагрузку и объединить усилия единомышленников. С 2015 года мы обучили более 500 человек из 40 регионов страны." },
  { title: "Методология С500", content: "Модель С500 — это авторская пятиступенчатая методика создания и развития потребительского кооператива, разработанная Велеславом Старковым. Этапы: 1) Анализ потребностей и целей участников, 2) Разработка устава и целевой программы, 3) Регистрация в ФНС, 4) Запуск деятельности, 5) Сопровождение и масштабирование. Ни один кооператив, созданный по этой модели, не был ликвидирован ФНС." },
  { title: "Правовая база", content: "Вся деятельность основана на Законе РФ № 3085-1 «О потребительской кооперации», Гражданском кодексе РФ (ст. 123.2, 123.3), Налоговом кодексе РФ (ст. 149 — освобождение от НДС). Наши юристы отслеживают все изменения в законодательстве и оперативно адаптируют документы и учебные программы." },
  { title: "Формат обучения", content: "Обучение проходит в онлайн-формате: видеоуроки, практические задания, вебинары с ответами на вопросы. Каждый студент получает готовые шаблоны документов для регистрации ПК. После прохождения курса — сертификат и 12 месяцев поддержки (в пакетах Премиум и VIP). Доступ к материалам — бессрочный." },
  { title: "Гарантии и результаты", content: "Мы гарантируем: юридически безупречный пакет документов для регистрации ПК, полное соответствие ФЗ-3085, сопровождение до получения выписки из ЕГРЮЛ. Если ФНС откажет по нашей вине — бесплатная доработка и повторная подача. 100+ успешных регистраций, 0 ликвидаций по модели С500." },
];

/* ─── FAQ (расширенный) ─── */
const faqItems = [
  { q: "Что такое потребительский кооператив?", a: "Потребительский кооператив (ПК) — некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников. В отличие от ООО, ПК не преследует извлечение прибыли, освобождён от НДС, налога на прибыль и НДФЛ с паевых взносов (Закон РФ № 3085-1)." },
  { q: "Сколько времени занимает создание ПК под ключ?", a: "Полный цикл занимает от 3 до 7 рабочих дней. Включает разработку устава, протокол учредительного собрания, целевую программу. Регистрация в ФНС — 3-5 рабочих дней. Итого от обращения до ЕГРЮЛ-записи — 10-14 дней." },
  { q: "Какие налоги платит потребительский кооператив?", a: "ПК по Закону № 3085-1 освобождён от НДС (ст. 149 НК РФ), налога на прибыль, НДФЛ с доходов от паевых взносов. Уплачиваются: госпошлина при регистрации, налог на имущество, земельный и транспортный налог." },
  { q: "Сколько человек нужно для создания ПК?", a: "Минимум 5 физических лиц или 3 юридических лица для учреждения потребительского кооператива. Физлицо может быть пайщиком с 16 лет." },
  { q: "Онлайн-касса нужна для ПК?", a: "Нет. Поскольку ПК не осуществляет реализацию товаров, а производит возврат паевых взносов, применение ККТ не требуется (ст. 1.1 ФЗ-54)." },
  { q: "Чем ПК отличается от ООО?", a: "ООО — коммерческая организация, платит НДС, налог на прибыль, НДФЛ. ПК — некоммерческая, освобождена от этих налогов. В ООО прибыль распределяется пропорционально доле, в ПК — один пайщик = один голос. ПК не отвечает по долгам пайщиков, а пайщики — по долгам ПК только в пределах своего пая." },
  { q: "Можно ли вести бизнес через ПК?", a: "ПК создается для удовлетворения потребностей пайщиков, а не для извлечения прибыли. Кооперативная цена = себестоимость. Если деятельность ведётся по закону 3085-1, налоговая база равна нулю. Однако нельзя подменять коммерческую деятельность кооперативной — это главное правило." },
  { q: "Что такое паевой взнос?", a: "Паевой взнос — это имущественный взнос пайщика в кооператив. Он возвращается при выходе из ПК. Паевой взнос не облагается НДФЛ и не признаётся доходом. Размер пая определяется уставом кооператива." },
  { q: "Могут ли приставы арестовать имущество ПК?", a: "Имущество кооператива принадлежит ПК как юридическому лицу. Приставы могут обратить взыскание только на долю должника-пайщика — паевой взнос. Личное имущество других пайщиков и кооператива в целом защищено." },
  { q: "Какие документы нужны для регистрации ПК?", a: "Потребуются: устав кооператива, протокол учредительного собрания, целевая программа, заявление по форме Р11001, квитанция об оплате госпошлины (4000 ₽). Мы предоставляем все шаблоны и сопровождаем процесс." },
  { q: "Какие проверки может проходить ПК?", a: "По ФЗ-3085 потребительские кооперативы освобождены от проверок пожарных, СЭС, Роспотребнадзора. Налоговые проверки возможны, но при правильном ведении деятельности рисков нет — мы учим именно этому." },
  { q: "Сколько стоит обучение?", a: "Стоимость зависит от пакета: Базовый — от 15 000 ₽ (ознакомительный курс), Стандарт — от 30 000 ₽ (полный курс + документы), Премиум — от 50 000 ₽ (курс + консалтинг + 12 мес поддержки), VIP — от 80 000 ₽ (всё включено + регистрация ПК под ключ). Рассрочка available." },
];

/* Tag cloud data */
const tagCloud = [
  { text: "НДС 0%", color: "orange" },
  { text: "Защита активов", color: "green" },
  { text: "Закон 3085-1", color: "blue" },
  { text: "Паевой взнос", color: "beige" },
  { text: "Регистрация ПК", color: "orange" },
  { text: "Налог на прибыль = 0", color: "green" },
  { text: "Устав кооператива", color: "blue" },
  { text: "Возврат паёв", color: "beige" },
  { text: "Без проверок", color: "orange" },
  { text: "Аудит устава", color: "green" },
  { text: "Кооперативная цена", color: "blue" },
  { text: "Целевая программа", color: "beige" },
  { text: "Консалтинг", color: "orange" },
  { text: "Обучение ПК", color: "green" },
  { text: "Онлайн-касса не нужна", color: "blue" },
];

const colorRGB: Record<string, string> = { orange: "201,110,77", green: "76,154,122", blue: "58,109,140" };
const colorVar: Record<string, string> = { orange: "var(--color-orange-400)", green: "var(--color-green-400)", blue: "var(--color-blue-400)" };

/* ─── Hero ─── */
function Hero() {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "calc(var(--header-h) + 2rem)", overflow: "hidden", isolation: "isolate" }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.6 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", background: "radial-gradient(ellipse, rgba(201,110,77,0.06) 0%, transparent 70%)", animation: "ambientDrift 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(ellipse, rgba(76,154,122,0.05) 0%, transparent 70%)", animation: "ambientDrift 25s ease-in-out infinite reverse" }} />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem", alignItems: "center" }}>
        <div style={{ maxWidth: 680 }}>
          <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "1.5rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-green-400)", animation: "pulse 2s ease-in-out infinite" }} />
            Потребительский кооператив — защита активов и ставка 0%
          </div>
          <h1 style={{ marginBottom: "1.5rem" }}>
            <span className="text-gradient">Первая Онлайн Школа</span><br />
            <span>Потребительских Кооперативов</span>
          </h1>
          <p style={{ color: "var(--color-text-muted)", maxWidth: 540, marginBottom: "2rem" }}>
            НДС, налог на прибыль и соц.платежи — 0% по закону РФ № 3085-1. Обучим работе с некоммерческими организациями. Защитите имущество от взысканий, обнулите налоги и работайте легально.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <a href="#services" className="btn-primary">Выбрать курс</a>
            <a href="#contacts" className="btn-secondary">Бесплатная консультация</a>
          </div>
        </div>

        {/* Right: Logo image (tree) with glow rings + particles */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 420, aspectRatio: "1/1" }}>
            {/* Orbital rings */}
            <div className="hero__logo-ring" style={{ position: "absolute", inset: "-25%", borderRadius: "50%", border: "1px solid rgba(214,198,178,0.05)", animation: "logoRing 16s linear infinite" }} />
            <div className="hero__logo-ring" style={{ position: "absolute", inset: "-15%", borderRadius: "50%", border: "1px solid rgba(214,198,178,0.04)", animation: "logoRing 12s linear infinite reverse" }} />
            <div className="hero__logo-ring" style={{ position: "absolute", inset: "-5%", borderRadius: "50%", border: "1px solid rgba(214,198,178,0.06)", animation: "logoRing 8s linear infinite" }} />
            {/* Floating particles */}
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} aria-hidden="true" style={{ position: "absolute", width: 3+i, height: 3+i, borderRadius: "50%", background: "rgba(214,198,178,0.3)", animation: `logoGlow ${5+i}s ease-in-out infinite`, animationDelay: `${i*0.8}s`, top: `${20+(i*12)%60}%`, left: `${15+(i*17)%70}%` }} />
            ))}
            {/* Glow behind logo */}
            <div style={{ position: "absolute", inset: "10%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,110,77,0.08) 0%, rgba(214,198,178,0.03) 40%, transparent 70%)", animation: "logoGlow 4s ease-in-out infinite" }} />
            {/* Logo image — the tree! */}
            <img
              className="hero__logo-img"
              src="/images/hero-logo.webp"
              alt="Школа Кооперации — Древо"
              width={420}
              height={420}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />
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

/* ─── Tag Cloud ─── */
function TagCloudSection() {
  return (
    <section style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label" style={{ display: "flex", justifyContent: "center" }}>Направления</span>
          <h2 className="section-title heading-sweep" style={{ textAlign: "center", marginBottom: "2rem" }}>Что вас интересует?</h2>
        </Reveal>
        <Reveal delay={1}>
          <div className="tag-cloud">
            {tagCloud.map((tag, i) => (
              <span key={i} className={`tag-cloud__item tag-cloud__item--${tag.color}`}>{tag.text}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Advantages ─── */
function Advantages() {
  return (
    <section id="advantages" className="section--light" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">Преимущества</span>
          <h2 className="section-title heading-sweep">Преимущества</h2>
          <p className="section-subtitle" style={{ marginBottom: "2rem" }}>
            Предприниматели теряют миллионы на налогах и рискуют имуществом. ООО и ИП платят НДС, налог на прибыль, НДФЛ и страховые взносы. Но есть другой путь — потребительский кооператив по закону РФ № 3085-1.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
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
                <div className={`stats-bar__number stats-bar__number--${s.color}`}>{s.number}</div>
                <div className="stats-bar__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ─── Services (Услуги) ─── */
function Services() {
  return (
    <section id="services" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label" style={{ justifyContent: "center", display: "flex" }}>Услуги</span>
          <h2 className="section-title heading-sweep" style={{ textAlign: "center" }}>Наши услуги</h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>От обучения до полной регистрации кооператива под ключ. Выберите то, что нужно именно вам.</p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginTop: "2rem" }}>
          {services.map((svc, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="glass-2" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `rgba(${colorRGB[svc.color]},0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{svc.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-beige-200)" }}>{svc.title}</div>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.7, flex: 1 }}>{svc.desc}</p>
                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: colorVar[svc.color] }}>{svc.price}</span>
                  <a href="#contacts" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "underline", textUnderlineOffset: 3 }}>Подробнее</a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  return (
    <section id="how" className="section--light" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area--wide">
        <Reveal>
          <span className="section-label" style={{ justifyContent: "center", display: "flex" }}>Как это работает</span>
          <h2 className="section-title heading-sweep" style={{ textAlign: "center" }}>
            Устал выживать один? <span style={{ color: "var(--color-orange-400)" }}>Пора кооперироваться!</span>
          </h2>
        </Reveal>
        <div style={{ maxWidth: 800, margin: "2rem auto 0", display: "grid", gap: "1.5rem" }}>
          {howSteps.map((step, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="glass-2" style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${colorRGB[step.color]},0.12)`, color: colorVar[step.color], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 }}>{step.num}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-beige-200)" }}>{step.title}</div>
                  <div style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About with Accordion ─── */
function About() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="about" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">О Школе</span>
          <h2 className="section-title heading-sweep">О Школе ПК</h2>
          <p className="section-subtitle">Первая онлайн Школа потребительской кооперации — образовательный проект, запущенный в 2015 году Велеславом Старковым.</p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginTop: "2rem" }}>
          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {aboutCards.map((card, i) => (
              <Reveal key={i} delay={i + 1}>
                <div className="value-card">
                  <div className={`value-card__icon value-card__icon--${card.color}`}>{card.icon}</div>
                  <div className="value-card__title">{card.title}</div>
                  <div className="value-card__desc">{card.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
          {/* Accordion */}
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {aboutAccordion.map((item, i) => (
              <Reveal key={i} delay={i + 1}>
                <div className={`faq-item${openIndex === i ? " open" : ""}`}>
                  <button className="faq-item__question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                    <span>{item.title}</span>
                    <span className="faq-item__icon">+</span>
                  </button>
                  <div className="faq-item__answer" style={{ maxHeight: openIndex === i ? 400 : 0 }}>
                    <div className="faq-item__answer-inner">{item.content}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section id="faq" className="section--light" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">FAQ</span>
          <h2 className="section-title heading-sweep">Частые вопросы</h2>
        </Reveal>
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}>
          {faqItems.map((faq, i) => (
            <Reveal key={i} delay={Math.min(i + 1, 6)}>
              <div className={`faq-item${openIndex === i ? " open" : ""}`}>
                <button className="faq-item__question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-item__icon">+</span>
                </button>
                <div className="faq-item__answer" style={{ maxHeight: openIndex === i ? 400 : 0 }}>
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

/* ─── AI Consultant ─── */
function AIConsultant() {
  const [messages, setMessages] = useState<{ text: string; type: "ai" | "user" | "error" }[]>([
    { text: "Привет! Я AI-ассистент Школы Кооперативов. Помогу разобраться с потребительской кооперацией — просто и понятно. Спрашивайте!", type: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg = msg.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userMsg, type: "user" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { text: data.error, type: "error" }]);
      } else {
        setMessages((prev) => [...prev, { text: data.reply, type: "ai" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { text: "Не удалось подключиться к серверу. Попробуйте позже или напишите @Veles_ST в Telegram.", type: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section id="ai-consultant" className="ai-section">
      <div className="container content-area">
        <Reveal>
          <div className="ai-section__inner">
            <div className="ai-section__icon">🤖</div>
            <h2 className="ai-section__title heading-sweep">Задайте вопрос AI-ассистенту</h2>
            <p className="ai-section__desc">Наш AI-помощник специально натренирован на потребительскую кооперацию. Задайте вопрос — получите ответ прямо здесь!</p>

            <div className="ai-section__chat">
              <div className="ai-section__chat-header">
                <div className="ai-section__chat-avatar">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>
                <div>
                  <div className="ai-section__chat-name">Ассистент Школы Кооперативов</div>
                  <div className="ai-section__chat-status"><span className="ai-section__chat-status-dot" /> Онлайн</div>
                </div>
              </div>

              <div className="ai-section__chat-messages" ref={messagesRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-chat__bubble ai-chat__bubble--${msg.type}`}>
                    <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
                  </div>
                ))}
                {loading && (
                  <div className="ai-chat__typing">
                    <span className="ai-chat__typing-dot" />
                    <span className="ai-chat__typing-dot" />
                    <span className="ai-chat__typing-dot" />
                  </div>
                )}
              </div>

              <div className="ai-section__chat-input-area">
                <textarea
                  className="ai-section__chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Спроси что-нибудь про кооперацию..."
                  rows={1}
                  disabled={loading}
                />
                <button className="ai-section__chat-send" onClick={() => sendMessage()} disabled={loading} aria-label="Отправить">
                  <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
              </div>
            </div>

            <p className="ai-section__note">
              AI-бот предоставляет базовую информацию. За более подробной консультацией обращайтесь к Велеславу Старкову через <a href="https://t.me/Veles_ST" target="_blank" rel="noopener">Telegram</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <div className="cta__inner">
            <h2 className="cta__title heading-sweep">Готовы начать?</h2>
            <p className="cta__desc">Запишитесь на бесплатную консультацию и узнайте, как потребительский кооператив поможет вашему бизнесу</p>
            <a href="#contacts" className="btn-primary" style={{ fontSize: "1.05rem", padding: "1rem 2.5rem" }}>Оставить заявку</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Contacts ─── */
function Contacts() {
  return (
    <section id="contacts" className="section--light" style={{ padding: "var(--section-py) 0" }}>
      <div className="container content-area">
        <Reveal>
          <span className="section-label">Контакты</span>
          <h2 className="section-title heading-sweep">Свяжитесь с нами</h2>
        </Reveal>
        <div className="contacts__grid">
          <div>
            {[
              { label: "Телефон", value: "+7 (902) 472-07-38", href: "tel:+79024720738" },
              { label: "Email", value: "boss@2980738.ru", href: "mailto:boss@2980738.ru" },
              { label: "Telegram", value: "@Veles_ST (личный)", href: "https://t.me/Veles_ST" },
              { label: "Адрес", value: "г. Пермь, ул. Фонтанная, д. 1а/1", href: undefined },
            ].map((c, i) => (
              <Reveal key={i} delay={i + 1}>
                <div className="contact-block">
                  <div className="contact-block__label">{c.label}</div>
                  <div className="contact-block__value">
                    {c.href ? <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener">{c.value}</a> : c.value}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={3}>
            <ContactForm />
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", fontWeight: 700, fontSize: "1.05rem", color: "#D6C6B2", marginBottom: "1rem" }}>
              <img src="/images/header-logo-tiny.webp" alt="" style={{ width: 32, height: 32, filter: "brightness(1.2) drop-shadow(0 0 8px rgba(255,230,200,0.3))" }} />
              Школа ПК
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: 280 }}>Первая Онлайн Школа Потребительских Кооперативов</p>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-beige-200)", fontSize: "0.9rem" }}>Навигация</div>
            {["О школе", "Программа", "Услуги", "FAQ", "Контакты"].map((t) => (
              <div key={t} style={{ marginBottom: "0.4rem" }}><a href={`/#${t === "О школе" ? "about" : t === "Программа" ? "how" : t === "Услуги" ? "services" : t.toLowerCase()}`}>{t}</a></div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-beige-200)", fontSize: "0.9rem" }}>Услуги</div>
            {["Обучение", "Консалтинг", "Аудит устава", "Регистрация ПК"].map((t) => (
              <div key={t} style={{ marginBottom: "0.4rem" }}><a href="#services">{t}</a></div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-beige-200)", fontSize: "0.9rem" }}>Контакты</div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.8 }}>
              <a href="tel:+79024720738">+7 (902) 472-07-38</a><br />
              <a href="mailto:boss@2980738.ru">boss@2980738.ru</a><br />
              <a href="https://t.me/Veles_ST" target="_blank" rel="noopener">@Veles_ST</a>
            </div>
          </div>
        </div>
        <div style={{ padding: "1.5rem 0", borderTop: "1px solid rgba(214,198,178,0.04)", textAlign: "center", fontSize: "0.8rem", color: "var(--color-text-disabled)" }}>
          &copy; 2026 Школа ПК. Все права защищены.
        </div>
      </div>
    </footer>
  );
}


/* ─── Contact Form (functional) ─── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSent(true);
        setForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setSent(false), 5000);
      }
    } catch {
      setError("Ошибка отправки. Попробуйте позже.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
        <div style={{ color: "var(--color-green-400)", fontWeight: 600 }}>Заявка отправлена!</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Мы свяжемся с вами в ближайшее время</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
      <input type="text" className="form-field" placeholder="Ваше имя *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input type="email" className="form-field" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="tel" className="form-field" placeholder="Телефон (необязательно)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <textarea className="form-field form-textarea" placeholder="Сообщение *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
      {error && <div style={{ fontSize: "0.85rem", color: "var(--color-orange-400)" }}>{error}</div>}
      <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={sending}>
        {sending ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <CursorLight />
      <Header />
      <Hero />
      <Quote text="Кооперация — это не бизнес-модель. Это архитектура доверия." author="— Велеслав Старков" />
      <TagCloudSection />
      <Advantages />
      <Stats />
      <Services />
      <HowItWorks />
      <About />
      <FAQ />
      <AIConsultant />
      <CTA />
      <Quote text="Один в поле не воин. Но вместе мы — сила, меняющая правила игры." author="— Кооперативная мудрость" />
      <Contacts />
      <Footer />
    </div>
  );
}
