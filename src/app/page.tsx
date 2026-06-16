"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CursorLight from "@/components/CursorLight";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (headerRef.current) {
        headerRef.current.classList.toggle("scrolled", window.scrollY > 40);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Set header ref after mount
  useEffect(() => {
    headerRef.current = document.querySelector(".site-header");
    if (headerRef.current) {
      headerRef.current.classList.toggle("scrolled", window.scrollY > 40);
    }
  }, []);

  const advantages = [
    { icon: "0%", title: "Налоги = 0", desc: "НДС, налог на прибыль, НДФЛ и соц.платежи — 0% по закону" },
    { icon: "\u{1F6E1}\uFE0F", title: "Защита имущества", desc: "ПК не отвечает по долгам пайщиков. Личное имущество в безопасности" },
    { icon: "\u2705", title: "Никаких проверок", desc: "Пожарные, СЭС, Роспотребнадзор не вмешиваются (ФЗ-3085)" },
    { icon: "\u{1F4B0}", title: "Возврат пая — не доход", desc: "Паевой взнос возвращается без налогов" },
    { icon: "\u{1F4BB}", title: "Онлайн-касса не нужна", desc: "Нет продаж — есть возврат паёв" },
    { icon: "\u{1F5F3}\uFE0F", title: "Один пайщик — один голос", desc: "Демократия в бизнесе" },
  ];

  const services = [
    { title: "Аудит и доработка устава ПК", price: "от 15 000 \u20BD", desc: "Проверю ваш устав на соответствие Закону \u2116 3085-1 и статьям 123.1\u2013123.8 ГК РФ. Выявлю риски субсидиарной ответственности, устраню противоречия, подготовлю пакет изменений.", id: "audit" },
    { title: "Готовый ПК \u00ABпод ключ\u00BB", price: "90 000 \u20BD", desc: "Полная подготовка и регистрация потребительского кооператива: устав под ваши задачи, протокол учредительного собрания, все учредительные документы, помощь с внесением в ЕГРЮЛ.", id: "registration" },
    { title: "Пакет документов для подтверждения деятельности ПК", price: "25 000 \u20BD", desc: "Подготовка полного пакета документов, подтверждающих целевую деятельность потребительского кооператива перед налоговой инспекцией.", id: "documents" },
    { title: "Разработка целевой потребительской программы", price: "25 000 \u20BD", desc: "Создам документально оформленный план расходов объединения на конкретные нужды участников \u2014 ключевой документ для подтверждения деятельности ПК перед налоговой.", id: "program" },
    { title: "Сопровождение при проверках налоговой", price: "15 000 \u20BD", desc: "Анализ рисков, подготовка пояснений и возражений, представление интересов в переписке с ФНС, корректировка документов. Не даю налоговой закрыть ваше объединение.", id: "support" },
    { title: "Создание \u00ABкооперативного сайта\u00BB под ключ", price: "50 000 \u20BD", desc: "Сайт для ПК с учётом специфики: лендинг для привлечения новых членов, личный кабинет, блог. Всё, чтобы ваш сайт выглядел профессионально и привлекал новых участников.", id: "website" },
  ];

  const stats = [
    { value: "2015", label: "Работаем с" },
    { value: "120+", label: "Успешных кейсов" },
    { value: "4", label: "Пакета обучения" },
    { value: "12", label: "Месяцев поддержки" },
  ];

  const courses = [
    { title: "Бесплатные видео-уроки", subtitle: "13 базовых уроков", price: "Бесплатно", desc: "Понимание основ, детальный разбор через разные образы, доступ сразу после регистрации", features: ["13 видео-уроков", "Бесплатная консультация 1 час", "Доступ после регистрации"], popular: false, href: "/register" },
    { title: "Консультации", subtitle: "Индивидуально или группой", price: "6 000 \u20BD/час", desc: "Онлайн разбор вашей ситуации, ответы на конкретные вопросы, необходимые документы", features: ["Онлайн формат", "Разбор ситуации", "Необходимые документы"], popular: false, href: "/#contacts" },
    { title: "Обучающий курс", subtitle: "Потребительский кооператив по модели С500", price: "Подробнее", desc: "Полное открытие ПК под ключ, документы и скрипты, консалтинг 12 месяцев", features: ["Полное открытие ПК", "Документы и скрипты", "Консалтинг 12 мес.", "Защита имущества", "Оптимизация налогов"], popular: true, href: "/courses" },
  ];

  const faqItems = [
    { q: "Что такое потребительский кооператив?", a: "Потребительский кооператив \u2014 это добровольное объединение граждан и юридических лиц на основе членства для удовлетворения материальных и иных потребностей участников. Деятельность ПК регулируется Законом РФ \u00ABО потребительской кооперации\u00BB \u2116 3085-1. В отличие от коммерческих организаций, ПК не преследует извлечение прибыли как основную цель." },
    { q: "Правда ли что налоги могут быть 0%?", a: "Да, это законно. НДС, налог на прибыль, НДФЛ и социальные платежи могут быть 0% при правильной организации деятельности ПК. Кооперативная цена равна себестоимости \u2014 налоговая база равна нулю. Это подтверждается Законом \u2116 3085-1 и практикой ФНС." },
    { q: "Как ПК защищает имущество?", a: "ПК не отвечает по долгам пайщиков, а пайщики не отвечают по долгам ПК (субсидиарная ответственность ограничена размером паевого взноса). Имущество кооператива принадлежит ему как юридическому лицу и не может быть взыскано по личным долгам членов." },
    { q: "Сколько человек нужно для создания ПК?", a: "Для регистрации потребительского кооператива необходимо минимум 5 граждан и/или 3 юридических лица. На практике рекомендуем не менее 10-15 членов для устойчивого функционирования." },
    { q: "Нужна ли онлайн-касса?", a: "Нет. В ПК нет продаж \u2014 есть возврат паёв. Поэтому онлайн-касса не требуется." },
    { q: "Могут ли проверять ПК?", a: "Пожарные, СЭС, Роспотребнадзор не вмешиваются в деятельность ПК (ФЗ-3085). Налоговая может проводить проверки, но при грамотно оформленных документах риски минимальны." },
    { q: "Что такое модель С500?", a: "Авторская методика Велеслава Старкова, структурирующая весь процесс создания и ведения потребительского общества в пять этапов: от анализа бизнес-модели до запуска деятельности. Ни один ПК, созданный по модели С500, не был ликвидирован по решению ФНС." },
    { q: "Сколько стоит регистрация ПК?", a: "Пакет \u00ABГотовый ПК под ключ\u00BB стоит 90 000 \u20BD и включает полный комплект документов, устав под ваши задачи и помощь с внесением в ЕГРЮЛ. Аудит устава \u2014 от 15 000 \u20BD." },
  ];

  const sectionStyle: React.CSSProperties = {
    padding: "4rem 0",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: "var(--container-max, 1240px)",
    margin: "0 auto",
    padding: "0 var(--container-px, 1.5rem)",
  };

  return (
    <>
      <CursorLight />
      <Header />

      {/* ===== HERO ===== */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "var(--color-bg, #0D0C0A)",
        paddingTop: "var(--header-h, 64px)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ ...innerStyle, width: "100%", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ maxWidth: 720 }}>
              <h1 className="hero-title heading-sweep" style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                color: "#D6C6B2",
                lineHeight: 1.2,
                marginBottom: "1.25rem",
              }}>
                Потребительский кооператив — защита активов и ставка 0%
              </h1>
              <p style={{
                fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                color: "#E68863",
                fontWeight: 600,
                marginBottom: "1rem",
              }}>
                НДС, налог на прибыль и соц.платежи — 0% по закону РФ \u2116 3085-1
              </p>
              <p className="hero-subtitle" style={{
                fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
                color: "rgba(214,198,178,0.65)",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: 600,
              }}>
                Обучим работе с некоммерческими организациями. Защитите имущество от взысканий, обнулите налоги и работайте легально \u2014 более 120 предпринимателей уже открыли свои ПК с нашей помощью.
              </p>
              <div className="hero-buttons" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/courses" className="btn-primary" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
                  Выбрать курс
                </Link>
                <a href="/#contacts" className="btn-secondary" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
                  Бесплатная консультация
                </a>
              </div>
            </div>
          </Reveal>
        </div>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "20%", right: "10%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,136,99,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />
      </section>

      {/* ===== PAIN POINT ===== */}
      <section style={{ ...sectionStyle, background: "rgba(214,198,178,0.02)" }}>
        <div style={innerStyle}>
          <Reveal>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <p style={{ fontSize: "1.1rem", color: "rgba(214,198,178,0.6)", lineHeight: 1.8, marginBottom: "1rem" }}>
                Предприниматели теряют миллионы на налогах и рискуют имуществом.
              </p>
              <p style={{ fontSize: "1rem", color: "rgba(214,198,178,0.45)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                ООО и ИП платят НДС, налог на прибыль, НДФЛ и страховые взносы. А ещё проверки, кассы, сертификация...
              </p>
              <h2 className="heading-sweep" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "0.5rem" }}>
                Но есть другой путь.
              </h2>
              <p style={{ fontSize: "1.15rem", color: "#E68863", fontWeight: 600 }}>
                Устал выживать один? Пора кооперироваться!
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={sectionStyle}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "1rem" }}>
              Законный способ платить налоги по ставке 0% и защитить активы
            </h2>
            <p style={{ textAlign: "center", color: "rgba(214,198,178,0.55)", maxWidth: 680, margin: "0 auto 3rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
              ПК \u2014 это некоммерческая организация по закону \u2116 3085-1. Вы объединяетесь с партнёрами, вносите паевые взносы и ведёте деятельность без фискальной нагрузки. Кооперативная цена равна себестоимости \u2014 налоговая база равна нулю.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" style={{ ...sectionStyle, background: "rgba(214,198,178,0.02)" }}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "2.5rem" }}>
              Преимущества
            </h2>
          </Reveal>
          <div className="advantages-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          }}>
            {advantages.map((a, i) => (
              <Reveal key={i}>
                <div style={{
                  padding: "1.5rem",
                  background: "rgba(214,198,178,0.03)",
                  border: "1px solid rgba(214,198,178,0.08)",
                  borderRadius: 12,
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{a.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#D6C6B2", marginBottom: "0.4rem" }}>{a.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.5)", lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={sectionStyle}>
        <div style={innerStyle}>
          <div className="stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
            textAlign: "center",
          }}>
            {stats.map((s, i) => (
              <Reveal key={i}>
                <div>
                  <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#E68863" }}>{s.value}</div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.5)", marginTop: "0.3rem" }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" style={{ ...sectionStyle, background: "rgba(214,198,178,0.02)" }}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "0.75rem" }}>
              Услуги для Потребительских кооперативов
            </h2>
            <p style={{ textAlign: "center", color: "rgba(214,198,178,0.5)", maxWidth: 600, margin: "0 auto 2.5rem", fontSize: "0.95rem" }}>
              Полное юридическое сопровождение ПК: от аудита устава до регистрации \u00ABпод ключ\u00BB
            </p>
          </Reveal>
          <div className="services-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}>
            {services.map((s, i) => (
              <Reveal key={i}>
                <div id={s.id} style={{
                  padding: "1.5rem",
                  background: "rgba(214,198,178,0.03)",
                  border: "1px solid rgba(214,198,178,0.08)",
                  borderRadius: 12,
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#D6C6B2", flex: 1, marginRight: "0.75rem" }}>{s.title}</h3>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#E68863", whiteSpace: "nowrap" }}>{s.price}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.5)", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/courses" className="btn-primary" style={{ padding: "0.7rem 1.5rem" }}>
              Все услуги для ПК
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT VELESLAV ===== */}
      <section id="about" style={sectionStyle}>
        <div style={innerStyle}>
          <Reveal>
            <div className="about-content" style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}>
              <div className="about-text" style={{ flex: 1 }}>
                <h2 className="section-title heading-sweep" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "1rem" }}>
                  С кем будете трудиться?
                </h2>
                <p style={{ fontSize: "1.15rem", fontWeight: 600, color: "#E68863", marginBottom: "1rem" }}>
                  Меня зовут Велеслав Старков. Учу предпринимателей кооперативной модели.
                </p>
                <div style={{ color: "rgba(214,198,178,0.65)", fontSize: "0.95rem", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: "0.75rem" }}>То есть:</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: "0.4rem", paddingLeft: "1.2rem", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#E68863" }}>+</span>
                      помогаю открыть Кооператив;
                    </li>
                    <li style={{ marginBottom: "0.4rem", paddingLeft: "1.2rem", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#E68863" }}>+</span>
                      получить законную налоговую ставку 0% для своего бизнеса;
                    </li>
                    <li style={{ marginBottom: "0.4rem", paddingLeft: "1.2rem", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#E68863" }}>+</span>
                      защитить активы от притязаний любой третьей стороны;
                    </li>
                    <li style={{ marginBottom: "0.4rem", paddingLeft: "1.2rem", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#E68863" }}>+</span>
                      настроить работу с контрагентами, банками, налоговой через проработанные скрипты.
                    </li>
                  </ul>
                  <p style={{ marginTop: "1rem" }}>
                    Председатель Правления Потребительского кооператива с 2015 года. Веду свой проект &laquo;Первая онлайн Школа Потребительской кооперации&raquo;. Мои ученики открыли уже более 120 Кооперативов. Имею красный диплом Пермского Института коммерции и Московского университета экономики статистики и информатики.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section id="consultations" style={{ ...sectionStyle, background: "rgba(214,198,178,0.02)" }}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "0.75rem" }}>
              Выберите свой формат обучения
            </h2>
          </Reveal>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}>
            {courses.map((c, i) => (
              <Reveal key={i}>
                <div style={{
                  padding: "2rem 1.5rem",
                  background: c.popular ? "rgba(230,136,99,0.05)" : "rgba(214,198,178,0.03)",
                  border: c.popular ? "1px solid rgba(230,136,99,0.25)" : "1px solid rgba(214,198,178,0.08)",
                  borderRadius: 14,
                  position: "relative",
                }}>
                  {c.popular && (
                    <div style={{
                      position: "absolute", top: "-0.7rem", left: "50%", transform: "translateX(-50%)",
                      background: "rgba(230,136,99,0.15)", border: "1px solid rgba(230,136,99,0.3)",
                      borderRadius: 20, padding: "0.2rem 1rem", fontSize: "0.75rem", color: "#E68863", fontWeight: 600,
                    }}>
                      Популярное
                    </div>
                  )}
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#D6C6B2", marginBottom: "0.25rem" }}>{c.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.4)", marginBottom: "0.75rem" }}>{c.subtitle}</p>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#E68863", marginBottom: "1rem" }}>{c.price}</div>
                  <p style={{ fontSize: "0.9rem", color: "rgba(214,198,178,0.55)", lineHeight: 1.6, marginBottom: "1rem" }}>{c.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem" }}>
                    {c.features.map((f, j) => (
                      <li key={j} style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.5)", padding: "0.25rem 0", paddingLeft: "1.2rem", position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "#81C784" }}>\u2713</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={c.href}
                    className={c.popular ? "btn-primary" : "btn-secondary"}
                    style={{ display: "inline-block", padding: "0.65rem 1.5rem" }}
                  >
                    {c.price === "Бесплатно" ? "Смотреть" : c.price === "Подробнее" ? "Подробнее" : "Записаться"}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FREE MATERIALS ===== */}
      <section style={sectionStyle}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "2rem" }}>
              Бесплатные материалы для старта
            </h2>
          </Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {[
              { label: "Закон РФ \u21163085-1", sub: "(скачать)", href: "#" },
              { label: "Статья:", sub: "\u00ABЧто такое ПК простыми словами в 2026\u00BB", href: "/blog" },
              { label: "Видео:", sub: "\u00ABЭкономика ПК против ООО\u00BB", href: "#" },
              { label: "Подкаст:", sub: "\u00AB5 ошибок новичков\u00BB", href: "#" },
            ].map((m, i) => (
              <Reveal key={i}>
                <a href={m.href} style={{
                  display: "block", padding: "1rem 1.5rem",
                  background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.1)",
                  borderRadius: 10, textDecoration: "none", transition: "border-color 0.2s",
                }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#D6C6B2" }}>{m.label}</div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.4)", marginTop: "0.2rem" }}>{m.sub}</div>
                </a>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/blog" style={{ color: "#E68863", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
              Перейти в Блог &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SCHOOL ===== */}
      <section style={{ ...sectionStyle, background: "rgba(214,198,178,0.02)" }}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "1.5rem" }}>
              О Школе
            </h2>
            <div style={{ maxWidth: 750, margin: "0 auto", color: "rgba(214,198,178,0.6)", fontSize: "0.95rem", lineHeight: 1.8 }}>
              <p style={{ marginBottom: "1rem" }}>
                Первая онлайн Школа потребительской кооперации \u2014 образовательный проект, запущенный в 2015 году Велеславом Старковым. За десять лет работы Школа стала крупнейшим в России центром подготовки предпринимателей к ведению деятельности через паевую модель. Более 120 учеников открыли собственные Кооперативы и успешно ведут бизнес по всей стране \u2014 от Калининграда до Владивостока.
              </p>
              <p style={{ marginBottom: "1rem" }}>
                Проект построен на принципе практической направленности: каждый участник получает не только теоретическую базу, но и готовые документы, скрипты для общения с контрагентами и ФНС, а также до двенадцатимесячную поддержку после завершения обучения.
              </p>
              <p>
                Отдельного внимания заслуживает <strong style={{ color: "#E68863" }}>модель С500</strong> \u2014 авторская методика, структурирующая весь процесс создания и ведения общества в пять этапов: от анализа бизнес-модели до запуска деятельности с привлечением участников. Ни одна организация, созданная по модели С500, не была ликвидирована по решению ФНС.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" style={sectionStyle}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "2rem" }}>
              Частые вопросы
            </h2>
          </Reveal>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {faqItems.map((item, i) => (
              <Reveal key={i}>
                <div style={{
                  marginBottom: "0.5rem",
                  background: "rgba(214,198,178,0.03)",
                  border: "1px solid rgba(214,198,178,0.08)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{
                      width: "100%", padding: "1rem 1.25rem", background: "none", border: "none",
                      cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                      color: "#D6C6B2", fontSize: "0.95rem", fontWeight: 600, textAlign: "left",
                    }}
                  >
                    <span>{item.q}</span>
                    <span style={{ fontSize: "1.2rem", transition: "transform 0.2s", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0deg)", flexShrink: 0, marginLeft: "1rem" }}>+</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.6)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ ...sectionStyle, background: "rgba(214,198,178,0.02)" }}>
        <div style={innerStyle}>
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 550, margin: "0 auto" }}>
              <h2 className="heading-sweep" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "1rem" }}>
                Готовы открыть свой Кооператив?
              </h2>
              <p style={{ color: "rgba(214,198,178,0.55)", marginBottom: "2rem", lineHeight: 1.7 }}>
                Запишитесь на бесплатную консультацию \u2014 разберём вашу ситуацию и подберём оптимальный формат
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/#contacts" className="btn-primary" style={{ padding: "0.8rem 2rem" }}>
                  Записаться
                </a>
                <a href="/courses" className="btn-secondary" style={{ padding: "0.8rem 2rem" }}>
                  Смотреть курсы
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CONTACTS ===== */}
      <section id="contacts" style={sectionStyle}>
        <div style={innerStyle}>
          <Reveal>
            <h2 className="section-title heading-sweep" style={{ textAlign: "center", fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 700, color: "#D6C6B2", marginBottom: "2rem" }}>
              Контакты
            </h2>
          </Reveal>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const fd = new FormData(form);
              fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: fd.get("name"), email: fd.get("email"),
                  phone: fd.get("phone"), message: fd.get("message"), source: "contact-form",
                }),
              }).then(() => { alert("Заявка отправлена!"); form.reset(); });
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input name="name" placeholder="Имя" required style={{ padding: "0.7rem 1rem", borderRadius: 8, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)", color: "#D6C6B2", fontSize: "0.95rem" }} />
                <input name="email" type="email" placeholder="Email" required style={{ padding: "0.7rem 1rem", borderRadius: 8, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)", color: "#D6C6B2", fontSize: "0.95rem" }} />
                <input name="phone" placeholder="Телефон" style={{ padding: "0.7rem 1rem", borderRadius: 8, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)", color: "#D6C6B2", fontSize: "0.95rem" }} />
                <textarea name="message" placeholder="Сообщение" rows={3} style={{ padding: "0.7rem 1rem", borderRadius: 8, border: "1px solid rgba(214,198,178,0.12)", background: "rgba(214,198,178,0.04)", color: "#D6C6B2", fontSize: "0.95rem", resize: "vertical" }} />
                <button type="submit" className="btn-primary" style={{ padding: "0.75rem", fontSize: "1rem" }}>
                  Отправить заявку
                </button>
              </div>
            </form>
            <div style={{ textAlign: "center", marginTop: "1.5rem", color: "rgba(214,198,178,0.4)", fontSize: "0.85rem" }}>
              <a href="tel:+79024720738" style={{ color: "#E68863", textDecoration: "none", fontWeight: 500 }}>+7 902-472-07-38</a>
              <span style={{ margin: "0 0.5rem" }}>|</span>
              <a href="mailto:boss@2980738.ru" style={{ color: "rgba(214,198,178,0.5)", textDecoration: "none" }}>boss@2980738.ru</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: "2rem 0", borderTop: "1px solid rgba(214,198,178,0.06)" }}>
        <div style={innerStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.3)" }}>
              &copy; {new Date().getFullYear()}, Велеслав Старков. Первая онлайн школа Потребительской кооперации
            </span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Link href="/blog" style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.3)", textDecoration: "none" }}>Блог</Link>
              <Link href="/glossary" style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.3)", textDecoration: "none" }}>Глоссарий</Link>
              <Link href="/faq" style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.3)", textDecoration: "none" }}>FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
