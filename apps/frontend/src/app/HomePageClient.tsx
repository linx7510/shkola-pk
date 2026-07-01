"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import dynamic from "next/dynamic";
const BlogParticles = dynamic(() => import("@/components/BlogParticles"), { loading: () => null });
const CursorLight = dynamic(() => import("@/components/CursorLight"), { ssr: false });

// Lazy-load тяжёлых виджетов (AI чат + блог-превью)
// Они не нужны для LCP — загружаются после idle
const LatestBlogPosts = dynamic(() => import("./home/LatestBlogPosts").then(m => m.LatestBlogPosts), { loading: () => null });
import { FAQAccordion } from "./home/FAQAccordion";
import { LeadForm } from "./home/LeadForm";
import Reveal from "@/components/Reveal";
import { BlockRenderer } from "@/components/BlockRenderer";

// Тип данных главной страницы из Payload CMS
interface HomePageData {
  hero?: { titleLine1?: string; titleLine2?: string; description?: string; ctaPrimaryText?: string; ctaPrimaryLink?: string; ctaSecondaryText?: string; ctaSecondaryLink?: string; };
  quote?: { text?: string; author?: string; };
  advantages?: Array<{ icon: string; title: string; desc: string; }>;
  stats?: Array<{ value: string; label: string; }>;
  howSteps?: Array<{ num: string; title: string; desc: string; }>;
  aboutCards?: Array<{ icon: string; title: string; desc: any; }>;
  aboutVeleslav?: { title?: string; photo?: any; paragraphs?: Array<{ text: string; }>; };
  services?: Array<{ icon: string; title: string; price: string; desc: string; href: string; }>;
  faqItems?: Array<{ q: string; a: string; }>;
  cta?: { title?: string; subtitle?: string; buttonText?: string; buttonLink?: string; };
  blocks?: Array<{ blockType: string; [key: string]: any; }>;
  contacts?: { phone?: string; phoneHref?: string; email?: string; telegram?: string; telegramLink?: string; address?: string; legal?: string; };
}


// Утилита: конвертировать Payload Lexical richText в HTML
// Поддерживает: paragraph, heading, list, listitem, link, text с форматированием
function richTextToHtml(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.root) return richTextToHtml(node.root);
  if (node.children && Array.isArray(node.children)) {
    if (node.type === "paragraph") {
      return "<p>" + node.children.map(richTextToHtml).join("") + "</p>";
    }
    if (node.type === "heading") {
      const lvl = node.tag || "h3";
      return "<" + lvl + ">" + node.children.map(richTextToHtml).join("") + "</" + lvl + ">";
    }
    if (node.type === "list") {
      const tag = node.listType === "number" ? "ol" : "ul";
      return "<" + tag + ">" + node.children.map(richTextToHtml).join("") + "</" + tag + ">";
    }
    if (node.type === "listitem") {
      return "<li>" + node.children.map(richTextToHtml).join("") + "</li>";
    }
    if (node.type === "quote") {
      return "<blockquote>" + node.children.map(richTextToHtml).join("") + "</blockquote>";
    }
    if (node.type === "link") {
      const href = node.fields?.url || "#";
      return '<a href="' + href + '">' + node.children.map(richTextToHtml).join('') + '</a>';
    }
    return node.children.map(richTextToHtml).join("");
  }
  if (node.type === "text") {
    let html = node.text || "";
    const fmt = node.format || 0;
    if (fmt & 1) html = "<b>" + html + "</b>";        // bold
    if (fmt & 2) html = "<i>" + html + "</i>";        // italic
    if (fmt & 8) html = "<u>" + html + "</u>";        // underline
    return html;
  }
  return "";
}

// Alias для обратной совместимости
function richTextToText(node: any): string {
  return richTextToHtml(node).replace(/<[^>]+>/g, "");
}

const PAYLOAD_PUBLIC_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "";



// Lazy AI Chat Button — загружает AIChatWidget только при клике
function LazyAIChatButton() {
  const [open, setOpen] = useState(false);
  const [AIChatWidget, setAIChatWidget] = useState<any>(null);

  const handleClick = async () => {
    if (!AIChatWidget) {
      // Lazy load AIChatWidget только при первом клике
      const mod = await import("./home/AIChatWidget");
      setAIChatWidget(() => mod.AIChatWidget);
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Открыть чат с AI-консультантом"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #C96E4D, #E68863)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(201,110,77,0.4), 0 0 30px rgba(230,136,99,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "#0D0C0A",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
      </button>
      {open && AIChatWidget && <AIChatWidget />}
    </>
  );
}

export default function HomePageClient({ homeData }: { homeData: HomePageData | null }) {
  const [aboutOpen, setAboutOpen] = useState<number | null>(null);

  
  const headerRef = useRef<HTMLElement|null>(null);

  useEffect(() => {
    headerRef.current = document.querySelector(".site-header");
    const onScroll = () => {
      if (headerRef.current) headerRef.current.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const advantages = [
    {icon:"0%", title:"Налоги 0%", desc:"НДС 0% (ст. 149 НК РФ), налог на прибыль 0%, НДФЛ с паевых взносов 0%. Налоговая база равна нулю", color:"orange"},
    {icon:"🛡️", title:"Защита имущества", desc:"ПК не отвечает по долгам пайщиков, а пайщики не отвечают по долгам кооператива (субсидиарная ответственность ограничена размером паевого взноса)", color:"green"},
    {icon:"✅", title:"Никаких проверок", desc:"Пожарные, СЭС, Роспотребнадзор не вмешиваются — Закон РФ № 3085-1", color:"blue"},
    {icon:"💰", title:"Возврат пая — не доход", desc:"Возврат паевого взноса при выходе из кооператива не облагается НДФЛ", color:"beige"},
    {icon:"💳", title:"Онлайн-касса не нужна", desc:"Онлайн-касса не требуется — нет продаж, есть возврат паёв", color:"orange"},
    {icon:"🗳️", title:"Один пайщик — один голос", desc:"Демократическое управление: каждый пайщик имеет один голос независимо от размера паевого взноса", color:"green"},
  ];

  const stats = [
    {value:"2015", label:"Работаем с 2015 года"},
    {value:"100+", label:"успешных кейсов"},
    {value:"4", label:"пакета обучения"},
    {value:"12 мес", label:"Поддержка до 12 месяцев"},
  ];

  const howSteps = [
    {num:"1", title:"Объединяетесь с партнёрами", desc:"Минимум 5 участников — физических лиц с 16 лет или юридических лиц. Вносите паевые взносы и формируете паевой фонд кооператива.", color:"orange"},
    {num:"2", title:"Регистрируете кооператив", desc:"Разрабатываете устав, протокол учредительного собрания, целевую программу. Подаете документы в ФНС и получаете запись в ЕГРЮЛ.", color:"green"},
    {num:"3", title:"Ведёте деятельность без фискальной нагрузки", desc:"Кооперативная цена равна себестоимости — налоговая база равна нулю. НДС 0%, налог на прибыль 0%, НДФЛ 0%.", color:"blue"},
  ];

  const aboutCards = [
    {
      icon: "⚡",
      color: "orange",
      title: "Современный подход к организации деятельности потребительских обществ",
      desc: "Первая онлайн Школа потребительской кооперации — образовательный проект, запущенный в 2015 году Велеславом Старковым. За десять лет работы Школа стала крупнейшим в России центром подготовки предпринимателей к ведению деятельности через паевую модель. Более 120 учеников открыли собственные Кооперативы и успешно ведут бизнес по всей стране — от Калининграда до Владивостока. Проект построен на принципе практической направленности: каждый участник получает не только теоретическую базу, но и готовые документы, скрипты для общения с контрагентами и ФНС, а также до двенадцатимесячную поддержку после завершения обучения. Традиционные методики опирались на бумажные регламенты и устаревшие шаблоны. Школа предлагает принципиально иной подход — цифровизацию процессов и адаптацию уставных документов к реалиям 2025–2026 годов. Каждая целевая программа разрабатывается индивидуально, с учётом конкретного ОКВЭД, региональной практики и судебных прецедентов последних лет. Это позволяет минимизировать риски при проверках и обеспечить документальное подтверждение деятельности с первого дня работы. Отдельного внимания заслуживает модель С500 — авторская методика, структурирующая весь процесс создания и ведения общества в пять этапов: от анализа бизнес-модели до запуска деятельности с привлечением участников. Модель учитывает актуальную редакцию Закона РФ № 3085-1, статьи 123.1–123.8 Гражданского кодекса и практику Федеральной налоговой службы. Ни одна организация, созданная по модели С500, не была ликвидирована по решению ФНС.",
    },
    {
      icon: "🎓",
      color: "blue",
      title: "Методы обучения: интерактив, практика, индивидуальный подход",
      desc: "Образовательная программа Школы построена на трёх столпах: видеоуроки, живые консультации и документальный конструктор. Тринадцать базовых видео-уроков бесплатно доступны сразу после регистрации и покрывают все ключевые темы — от основ законодательства до нормами взаимодействия с банками. Каждый урок снабжён практическими примерами из реальной практики Школы: случаи из более чем 120 реализованных проектов позволяют увидеть, как теоретические положения работают в конкретных жизненных ситуациях. Для тех, кто выбирает полный курс обучения «Потребительский кооператив по модели С500», предусмотрена расширенная программа. Она включает восемь модулей по два-три занятия в каждом: основы законодательства, устав и учредительные документы, целевые программы, бухгалтерский учёт, работа с банками, налоговые проверки, набор участников, расширение деятельности. Все занятия проводятся онлайн в формате онлайн уроков и живых вебинаров с возможностью задавать вопросы и разбирать собственные ситуации. Записи вебинаров остаются доступными в течение всего периода поддержки — двенадцати месяцев с момента начала обучения. Индивидуальные и групповые консультации дополняют основную программу. За один час Велеслав Старков разбирает конкретную ситуацию предпринимателя: оценивает риски текущей бизнес-модели, предлагает оптимальную структуру паевых взносов, готовит аргументы для общения с налоговой. Более 90% консультаций завершаются конкретным планом действий с указанием сроков и ответственных. Это формат, который экономит время и деньги — вместо месяцев самостоятельного изучения законодательства предприниматель получает чёткую дорожную карту.",
    },
    {
      icon: "📋",
      color: "green",
      title: "Комплекс услуг для ПК под ключ",
      desc: "Школа — это не только обучение, но и полный спектр юридических услуг для тех, кто создаёт или уже ведёт потребительское общество. Аудит устава — самая востребованная услуга для действующих потребительских обществ. Многие предприниматели скачивают бесплатные шаблоны уставов из интернета, не учитывая региональную специфику и изменения законодательства. Регистрация «под ключ» включает разработку индивидуального устава, протокола учредительного собрания, заявления о государственной регистрации и целевой потребительской программы. Сопровождение при налоговых проверках — услуга, которая становится всё более актуальной по мере роста популярности паевой модели. ФНС усиливает контроль за некоммерческими организациями, и грамотное сопровождение помогает избежать доначислений. Отдельное направление — создание «кооперативного сайта» под ключ. Для привлечения пайщиков и формирования доверия требуется профессиональный интернет-ресурс: лендинг с описанием преимуществ, личный кабинет для участников, блог с полезными материалами. Рынок образовательных услуг в сфере некоммерческого права крайне фрагментирован. Школа отличается комплексным подходом: обучение, консалтинг, юридическое сопровождение и техническая поддержка в одном месте. Постоянное обновление материалов — законодательство в сфере некоммерческих организаций регулярно меняется, и Школа первой адаптирует курсы и документы к новым требованиям.",
    },
    {
      icon: "🏆",
      color: "beige",
      title: "Почему предприниматели выбирают Школу Потребительской кооперации",
      desc: "Школа поддерживает активное сообщество участников и кооператоров. В закрытых каналах участники обмениваются опытом, обсуждают сложные кейсы и получают поддержку от единомышленников из разных регионов России. За десять лет работы Школа стала ведущей платформой обучения кооперации в России. Более 120 предпринимателей уже открыли свои ПК с нашей помощью. Школа поддерживает активное сообщество — более 500 участников из 40 регионов России. Законодательство в сфере некоммерческих организаций меняется регулярно, и команда отслеживает все изменения в Законе № 3085-1, ГК РФ и фискальном законодательстве. Традиционные методики создания некоммерческих организаций опирались на бумажные регламенты и устаревшие шаблоны. Школа предлагает принципиально иной подход. Основной фокус направлен на цифровизацию процессов и адаптацию уставных документов к реалиям 2025–2026 годов. Каждая целевая потребительская программа разрабатывается индивидуально, с учётом конкретного ОКВЭД, региональной налоговой практики и судебных прецедентов последних лет. Это позволяет минимизировать риски при проверках ФНС и обеспечить документальное подтверждение деятельности с первого дня работы организации. Модель учитывает изменённую редакцию Закона РФ № 3085-1, статьи 123.1–123.3 Гражданского кодекса и актуальную практику Федеральной налоговой службы. В отличие от готовых шаблонов из интернета, которые часто содержат противоречия и устаревшие формулировки, каждый документ в рамках модели С500 проходит экспертную проверку на соответствие действующему законодательству.",
    },
  ];

  const faqItems = [
    {q:"Что такое потребительский кооператив?", a:"Потребительский кооператив (ПК) — некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников. В отличие от ООО, ПК не преследует извлечение прибыли, освобождён от НДС, налога на прибыль и НДФЛ с паевых взносов (Закон РФ № 3085-1)."},
    {q:"Сколько времени занимает создание ПК под ключ?", a:"Полный цикл занимает от 3 до 7 рабочих дней. Включает разработку устава, протокол учредительного собрания, целевую программу. Регистрация в ФНС — 3-5 рабочих дней. Итого от обращения до ЕГРЮЛ-записи — 10-14 дней."},
    {q:"Какие налоги платит потребительский кооператив?", a:"ПК по Закону № 3085-1 освобождён от НДС (ст. 149 НК РФ), налога на прибыль, НДФЛ с доходов от паевых взносов. Уплачиваются: госпошлина при регистрации, налог на имущество, земельный и транспортный налог."},
    {q:"Правда ли что налоги могут быть 0%?", a:"Да, это законно. НДС, налог на прибыль, НДФЛ и социальные платежи могут быть 0% при правильной организации деятельности ПК. Кооперативная цена равна себестоимости — налоговая база равна нулю."},
    {q:"Как ПК защищает имущество?", a:"ПК не отвечает по долгам пайщиков, а пайщики не отвечают по долгам ПК (субсидиарная ответственность ограничена размером паевого взноса). Имущество кооператива принадлежит ему как юридическому лицу."},
    {q:"Что такое модель С500?", a:"Авторская методика Велеслава Старкова, структурирующая весь процесс создания и ведения потребительского общества в пять этапов: от анализа бизнес-модели до запуска деятельности. Ни один ПК, созданный по модели С500, не был ликвидирован по решению ФНС."},
  ];

  // === ДИНАМИЧЕСКИЕ ДАННЫЕ ИЗ PAYLOAD (с fallback на хардкод) ===
  const heroData = homeData?.hero || null;
  const quoteData = homeData?.quote || null;
  const advantagesData = (homeData?.advantages && homeData.advantages.length > 0)
    ? homeData.advantages
    : advantages;
  const statsData = (homeData?.stats && homeData.stats.length > 0)
    ? homeData.stats
    : stats;
  const howStepsData = (homeData?.howSteps && homeData.howSteps.length > 0)
    ? homeData.howSteps.map((s, i) => ({ ...s, color: (["orange","green","blue"])[i % 3] }))
    : howSteps;
  const aboutCardsData = (homeData?.aboutCards && homeData.aboutCards.length > 0)
    ? homeData.aboutCards.map((c, i) => ({
        ...c,
        desc: c.desc,
        color: (["orange","blue","green","beige"])[i % 4],
      }))
    : aboutCards;
  const servicesData = (homeData?.services && homeData.services.length > 0)
    ? homeData.services
    : [
        // fallback services (hardcoded)
        {icon:"📋", title:"Аудит и доработка устава ПК", price:"от 15 000 ₽", desc:"Проверю ваш устав на соответствие Закону № 3085-1 и статьям 123.1–123.8 ГК РФ.", href:"/uslugi/audit-ustava"},
        {icon:"📝", title:"Готовый ПК «под ключ»", price:"90 000 ₽", desc:"Полная подготовка и регистрация потребительского кооператива.", href:"/konsultacii"},
        {icon:"📦", title:"Пакет документов для подтверждения деятельности ПК", price:"25 000 ₽", desc:"Готовый пакет документов для подтверждения деятельности кооператива.", href:"/uslugi"},
        {icon:"🎯", title:"Разработка целевой потребительской программы", price:"25 000 ₽", desc:"Создам документально оформленный план расходов объединения.", href:"/uslugi"},
        {icon:"🛡️", title:"Сопровождение при проверках налоговой", price:"15 000 ₽", desc:"Анализ рисков, подготовка пояснений и возражений.", href:"/uslugi"},
        {icon:"🌐", title:"Создание «кооперативного сайта» под ключ", price:"50 000 ₽", desc:"Сайт для ПК с учётом специфики: лендинг, личный кабинет, блог.", href:"/uslugi"},
      ];
  const faqData = (homeData?.faqItems && homeData.faqItems.length > 0)
    ? homeData.faqItems
    : faqItems;
  const ctaData = homeData?.cta || null;
  const contactsData = homeData?.contacts || null;
  const aboutVeleslavData = homeData?.aboutVeleslav || null;
  



  const S:React.CSSProperties = {padding:"4rem 0"};
  const I:React.CSSProperties = {maxWidth:"var(--container-max,1600px)",margin:"0 auto",padding:"0 var(--container-px,clamp(1rem,4vw,4rem))"};

  return (
    <>
      <BlogParticles />
      <CursorLight />
      <Header />

      {/* ===== HERO ===== */}
      <section id="hero" style={{minHeight:"60vh",display:"flex",alignItems:"center",background:"transparent",paddingTop:"calc(var(--header-h,72px) + 1rem)",position:"relative",overflow:"hidden"}}>
        <div className="hero__ambient" />
        <div style={{...I,width:"100%",position:"relative",zIndex:2}}>
          <Reveal>
            <div className="hero-grid">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="pulse-dot" /> Потребительский кооператив — защита активов и ставка 0%
                </div>
                <h1 className="hero-title heading-sweep">
                  <span className="text-accent">{heroData?.titleLine1 || "Потребительский кооператив"}</span>
                  <span aria-hidden="true" style={{display:"none"}}> — </span>
                  <br/>
                  {heroData?.titleLine2 || "защита активов и ставка 0%"}
                </h1>
                <p className="hero-desc">
                  {heroData?.description || "НДС, налог на прибыль и соц.платежи — 0% по закону РФ № 3085-1. Обучим работе с некоммерческими организациями. Защитите имущество от взысканий, обнулите налоги и работайте легально — более 120 предпринимателей уже открыли свои ПК с нашей помощью."}
                </p>
                <div className="hero-actions">
                  <Link href={heroData?.ctaPrimaryLink || "/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn"} className="btn-primary">{heroData?.ctaPrimaryText || "Выбрать курс"}</Link>
                  <Link href={heroData?.ctaSecondaryLink || "/konsultacii"} className="btn-secondary">{heroData?.ctaSecondaryText || "Бесплатная консультация"}</Link>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero__logo-glow" />
                <div className="hero__logo-ring" style={{width:560,height:560}} />
                <div className="hero__logo-ring" style={{width:720,height:720,animationDelay:"-3s"}} />
                <img src="/images/hero-logo.webp" alt="Потребительский кооператив — защита активов и ставка 0%. Школа ПК" width={400} height={400} className="hero__logo-img" fetchPriority="high" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-bar section--light reveal">
        <div style={I}>
          <div className="stats-grid">
            {statsData.map((s,i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADVANTAGES (TABLE) ===== */}
      <section id="advantages" style={{...S,background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div className="section-label">Преимущества</div>
            <h2 className="section-title heading-sweep" data-text="Преимущества">Преимущества</h2>
            <p className="section-subtitle">Предприниматели теряют миллионы на налогах и рискуют имуществом. Но есть другой путь.</p>
          </Reveal>
          <Reveal delay={2}>
            <div style={{overflowX:"auto", borderRadius:14, border:"1px solid rgba(214,198,178,0.12)", background:"rgba(214,198,178,0.02)"}}>
              <table style={{width:"100%", borderCollapse:"collapse", minWidth:600}}>
                <thead>
                  <tr style={{background:"linear-gradient(135deg, rgba(230,136,99,0.15), rgba(214,198,178,0.05))"}}>
                    <th style={{padding:"1rem 1.25rem", textAlign:"left", fontSize:"0.78rem", fontWeight:600, color:"#E68863", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid rgba(230,136,99,0.2)", width:60}}>№</th>
                    <th style={{padding:"1rem 1.25rem", textAlign:"left", fontSize:"0.78rem", fontWeight:600, color:"#E68863", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid rgba(230,136,99,0.2)", width:100}}>Знак</th>
                    <th style={{padding:"1rem 1.25rem", textAlign:"left", fontSize:"0.78rem", fontWeight:600, color:"#E68863", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid rgba(230,136,99,0.2)", width:"30%"}}>Преимущество</th>
                    <th style={{padding:"1rem 1.25rem", textAlign:"left", fontSize:"0.78rem", fontWeight:600, color:"#E68863", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid rgba(230,136,99,0.2)"}}>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {advantagesData.map((a,i) => (
                    <tr key={i} style={{transition:"background 0.25s"}} onMouseEnter={e => {e.currentTarget.style.background="rgba(230,136,99,0.05)";}} onMouseLeave={e => {e.currentTarget.style.background="transparent";}}>
                      <td style={{padding:"1rem 1.25rem", color:"rgba(214,198,178,0.97)", fontSize:"0.95rem", borderBottom:"1px solid rgba(214,198,178,0.06)", fontWeight:600}}>{String(i+1).padStart(2,"0")}</td>
                      <td style={{padding:"1rem 1.25rem", fontSize:"1.8rem", borderBottom:"1px solid rgba(214,198,178,0.06)", lineHeight:1}}>{a.icon}</td>
                      <td style={{padding:"1rem 1.25rem", color:"#E7DCCF", fontSize:"1rem", fontWeight:600, borderBottom:"1px solid rgba(214,198,178,0.06)"}}>{a.title}</td>
                      <td style={{padding:"1rem 1.25rem", color:"rgba(214,198,178,0.97)", fontSize:"0.9rem", lineHeight:1.6, borderBottom:"1px solid rgba(214,198,178,0.06)"}}>{a.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ===== HOW ===== */}
      <section id="how" style={S}>
        <div style={I}>
          <Reveal>
            <h2 className="section-title heading-sweep">Устал выживать один? <span className="text-accent">Пора кооперироваться!</span></h2>
          </Reveal>
          <div className="how-grid">
            {howStepsData.map((s,i) => (
              <Reveal key={i}>
                <div className={`how-card glass-2 how-${s.color}`}>
                  <div className={`how-num how-num-${s.color}`}>{s.num}</div>
                  <h3 className="how-title">{s.title}</h3>
                  <p className="how-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUOTE ===== */}
      <section style={{padding:"2rem 0", background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <blockquote className="quote-block">
            <p className="quote-text">{quoteData?.text || "«Кооперация — это не бизнес-модель. Это архитектура доверия.»"}</p>
            <cite className="quote-author">— {quoteData?.author || "Велеслав Старков"}</cite>
          </blockquote>
        </div>
      </section>

      {/* ===== ABOUT SCHOOL ===== */}
      <section id="about" style={{...S,background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div className="section-label">О Школе</div>
            <h2 className="section-title heading-sweep" data-text="О Школе">О Школе</h2>
            <p style={{fontSize:"1.05rem", color:"rgba(214,198,178,0.97)", lineHeight:1.8, maxWidth:800, margin:"1.5rem auto 2rem", textAlign:"center"}}>
              Первая онлайн Школа потребительской кооперации — образовательный проект, запущенный в 2015 году Велеславом Старковым. За десять лет работы Школа стала крупнейшим в России центром подготовки предпринимателей к ведению деятельности через паевую модель. Более 120 учеников открыли собственные Кооперативы и успешно ведут бизнес по всей стране.
            </p>
          </Reveal>
          <div className="about-accordion">
            {aboutCardsData.map((card,i) => (
              <div key={i} className="about-accordion-item">
                <button className={`about-accordion-btn ${aboutOpen===i?"open":""}`} onClick={() => setAboutOpen(aboutOpen===i?null:i)}>
                  <span className={`about-accordion-icon adv-${card.color}`}>{card.icon}</span>
                  <span className="about-accordion-title">{card.title}</span>
                  <span className={`about-accordion-chevron ${aboutOpen===i?"open":""}`}>+</span>
                </button>
                <div className={`about-accordion-panel ${aboutOpen===i?"open":""}`}>
                  <div className="about-accordion-inner" dangerouslySetInnerHTML={{__html: typeof card.desc === "string" ? card.desc : richTextToHtml(card.desc)}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== ABOUT VELESLAV ===== */}
      <section id="about-veleslav" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={{...I, maxWidth:1000}}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">О ПРЕПОДАВАТЕЛЕ</div>
              <h2 className="section-title heading-sweep" data-text="С кем будете трудиться?">С кем будете трудиться?</h2>
            </div>
          </Reveal>
          <div className="veleslav-grid">
            <Reveal>
              <div style={{position:"relative", borderRadius:16, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", border:"1px solid rgba(230,136,99,0.2)"}}>
                <img
                  src="/images/veleslav/starkov-veleslav.webp"
                  alt="Старков Велеслав Владимирович — основатель Первей онлайн Школы Потребительской кооперации"
                  width={400}
                  height={600}
                  loading="lazy"
                  style={{width:"100%", height:"auto", display:"block", aspectRatio:"2/3", objectFit:"cover"}}
                />
                <div style={{position:"absolute", bottom:0, left:0, right:0, padding:"1rem 1.25rem", background:"linear-gradient(to top, rgba(20,18,16,0.95), transparent)", color:"#E7DCCF"}}>
                  <div style={{fontWeight:600, fontSize:"1rem"}}>Велеслав Старков</div>
                  <div style={{fontSize:"0.82rem", color:"rgba(214,198,178,0.97)", marginTop:"0.15rem"}}>Председатель Правления ПК с 2015 года</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div style={{fontSize:"1.05rem", color:"rgba(214,198,178,0.97)", lineHeight:1.9, textAlign:"left"}}>
                <p style={{marginBottom:"1.25rem"}}>
                  Меня зовут <strong style={{color:"#E7DCCF"}}>Велеслав Старков</strong>. Учу предпринимателей кооперативной модели.
                </p>
                <p style={{marginBottom:"1.25rem"}}>То есть:</p>
                <ul style={{listStyle:"none", padding:0, marginBottom:"1.25rem", paddingLeft:"1.25rem", borderLeft:"2px solid rgba(230,136,99,0.4)"}}>
                  <li style={{marginBottom:"0.6rem", paddingLeft:"0.5rem"}}>помогаю открыть Кооператив;</li>
                  <li style={{marginBottom:"0.6rem", paddingLeft:"0.5rem"}}>получить законную налоговую ставку 0% для своего бизнеса;</li>
                  <li style={{marginBottom:"0.6rem", paddingLeft:"0.5rem"}}>защитить активы от притязаний любой третьей стороны (банки, приставы, суды, бывшие жёны/мужья);</li>
                  <li style={{marginBottom:"0.6rem", paddingLeft:"0.5rem"}}>настроить работу с контрагентами, банками, налоговой через проработанные скрипты.</li>
                </ul>
                <p style={{marginBottom:"1.25rem"}}>
                  Председатель Правления Потребительского кооператива с 2015 года.
                  Веду свой проект «Первая онлайн Школа Потребительской кооперации».
                </p>
                <p style={{marginBottom:"1.25rem"}}>
                  Мои ученики открыли уже более 120 Кооперативов.
                </p>
                <p>
                  Имею красный диплом Пермского Института коммерции
                  и Московского университета экономики статистики и информатики.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">УСЛУГИ</div>
              <h2 className="section-title heading-sweep" data-text="Услуги для Потребительских кооперативов">Услуги для Потребительских кооперативов</h2>
              <p style={{color:"rgba(214,198,178,0.95)", marginTop:"1rem", fontSize:"1.05rem", maxWidth:700, margin:"1rem auto 0"}}>Полное юридическое сопровождение ПК: от аудита устава до регистрации «под ключ»</p>
            </div>
          </Reveal>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:"1.5rem"}}>
            {[
              {icon:"📋", title:"Аудит и доработка устава ПК", price:"от 15 000 ₽", desc:"Проверю ваш устав на соответствие Закону № 3085-1 и статьям 123.1–123.8 ГК РФ. Выявлю риски субсидиарной ответственности, устраню противоречия, подготовлю пакет изменений.", href:"/uslugi/audit-ustava"},
              {icon:"📝", title:"Готовый ПК «под ключ»", price:"90 000 ₽", desc:"Полная подготовка и регистрация потребительского кооператива: устав под ваши задачи, протокол учредительного собрания, все учредительные документы, помощь с внесением в ЕГРЮЛ.", href:"/konsultacii"},
              {icon:"📦", title:"Пакет документов для подтверждения деятельности ПК", price:"25 000 ₽", desc:"Готовый пакет документов для подтверждения деятельности кооператива перед налоговой: положение о паевом фонде, целевая программа, протоколы, реестр пайщиков.", href:"/uslugi"},
              {icon:"🎯", title:"Разработка целевой потребительской программы", price:"25 000 ₽", desc:"Создам документально оформленный план расходов объединения на конкретные нужды участников — ключевой документ для подтверждения деятельности ПК перед налоговой.", href:"/uslugi"},
              {icon:"🛡️", title:"Сопровождение при проверках налоговой", price:"15 000 ₽", desc:"Анализ рисков, подготовка пояснений и возражений, представление интересов в переписке с ФНС, корректировка документов. Не даю налоговой закрыть ваше объединение.", href:"/uslugi"},
              {icon:"🌐", title:"Создание «кооперативного сайта» под ключ", price:"50 000 ₽", desc:"Сайт для ПК с учётом специфики: лендинг для привлечения новых членов, личный кабинет, блог. Всё, чтобы ваш сайт выглядел профессионально и привлекал новых участников.", href:"/uslugi"},
            ].map((s, i) => (
              <Reveal key={i} delay={i + 1}>
                <Link href={s.href} style={{display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"1.75rem", background:"rgba(214,198,178,0.03)", border:"1px solid rgba(214,198,178,0.08)", borderRadius:14, textDecoration:"none", color:"inherit", transition:"all 0.3s", minHeight:280}} onMouseEnter={e => {e.currentTarget.style.borderColor="rgba(230,136,99,0.3)"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,0.3)"}} onMouseLeave={e => {e.currentTarget.style.borderColor="rgba(214,198,178,0.08)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"}}>
                  <div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem"}}>
                      <span style={{fontSize:"2rem", lineHeight:1}}>{s.icon}</span>
                      <span style={{fontSize:"0.95rem", fontWeight:600, color:"#E68863", background:"rgba(230,136,99,0.1)", padding:"0.25rem 0.75rem", borderRadius:8, whiteSpace:"nowrap"}}>{s.price}</span>
                    </div>
                    <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0.6rem", lineHeight:1.3}}>{s.title}</h3>
                    <p style={{fontSize:"0.88rem", color:"rgba(214,198,178,0.95)", lineHeight:1.6}}>{s.desc}</p>
                  </div>
                  <div style={{marginTop:"1rem", fontSize:"0.85rem", color:"#E68863", fontWeight:500}}>Подробнее →</div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={8}>
            <div style={{textAlign:"center", marginTop:"2.5rem"}}>
              <Link href="/uslugi" className="btn-primary" style={{display:"inline-block", padding:"0.85rem 2rem", fontSize:"1rem", textDecoration:"none"}}>Все услуги для ПК</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== LATEST BLOG POSTS ===== */}
      <section id="latest-materials" style={{...S, display:"flex", justifyContent:"center"}}>
        <div style={I}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">БЛОГ</div>
              <h2 className="section-title heading-sweep" data-text="Последние полезные материалы">Последние полезные материалы</h2>
              <p style={{color:"rgba(214,198,178,0.95)", marginTop:"0.5rem"}}>Свежие статьи о потребительской кооперации</p>
            </div>
          </Reveal>
          <LatestBlogPosts />
        </div>
      </section>

      {/* ===== COURSE C500 ===== */}
      <section id="course-c500" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div style={{maxWidth:800, margin:"0 auto", textAlign:"center", padding:"2rem"}}>
              <div className="section-label">ОБУЧЕНИЕ</div>
              <h2 className="section-title heading-sweep" data-text="Обучающий курс по модели С500">Обучающий курс по модели С500</h2>
              <p style={{color:"rgba(214,198,178,0.97)", fontSize:"1.1rem", lineHeight:1.8, marginTop:"1.5rem", marginBottom:"2rem"}}>
                Авторская методика Велеслава Старкова — пять этапов от анализа бизнес-модели до запуска деятельности.
                Ни один ПК, созданный по модели С500, не был ликвидирован по решению ФНС.
              </p>
              <div className="c500-grid" style={{marginTop:"2rem", marginBottom:"2rem"}}>
                {/* Консультации */}
                <div className="c500-card c500-card-1">
                  <div className="c500-icon">💬</div>
                  <h3 className="c500-title">Консультации</h3>
                  <p className="c500-desc">Индивидуально или группой. Онлайн. Разбор вашей ситуации с цифрами и кейсами</p>
                  <div className="c500-price">1 час — 6 000 ₽</div>
                  <Link href="/konsultacii" className="c500-btn c500-btn-primary">Записаться →</Link>
                </div>
                {/* Бесплатные видео-уроки */}
                <div className="c500-card c500-card-2">
                  <div className="c500-icon">🎬</div>
                  <h3 className="c500-title">Бесплатные видео-уроки</h3>
                  <p className="c500-desc">13 базовых уроков. Понимание основ кооперации. Доступ сразу после регистрации</p>
                  <div className="c500-price">Бесплатно</div>
                  <Link href="/besplatno" className="c500-btn c500-btn-secondary">Смотреть →</Link>
                </div>
                {/* Обучающий курс — ЯРКИЙ */}
                <div className="c500-card c500-card-featured">
                  <div className="c500-badge">⭐ ПОПУЛЯРНОЕ</div>
                  <div className="c500-icon c500-icon-featured">🎓</div>
                  <h3 className="c500-title c500-title-featured">Обучающий курс С500</h3>
                  <p className="c500-desc c500-desc-featured">Полное открытие ПК под ключ. Документы и скрипты. Консалтинг 12 месяцев. Защита имущества. Оптимизация налогов</p>
                  <ul className="c500-features">
                    <li>✅ Индивидуальный устав под ваш бизнес</li>
                    <li>✅ Полный пакет документов для регистрации</li>
                    <li>✅ Скрипты для общения с банками и ФНС</li>
                    <li>✅ 12 месяцев поддержки</li>
                    <li>✅ Доступ к закрытому сообществу</li>
                  </ul>
                  <Link href="/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" className="c500-btn c500-btn-featured">Подробнее →</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
{/* ===== CTA ===== */}
            {/* ===== AI CONSULTANT ===== */}
      <section id="ai-consultant" style={{padding:"2rem 0",background:"rgba(214,198,178,0.02)"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 var(--container-px,clamp(1rem,4vw,4rem))",textAlign:"center"}}>
          <Reveal>
            <div style={{marginBottom:"2.5rem"}}>
              <div className="section-label">AI-АССИСТЕНТ</div>
              <h2 className="section-title heading-sweep" data-text="Задайте вопрос AI-ассистенту">🤖 Задайте вопрос AI-ассистенту</h2>
              <p style={{fontSize:"1rem",color:"rgba(214,198,178,0.7)",maxWidth:600,margin:"1rem auto 0"}}>
                Наш AI-помощник специально натренирован на потребительскую кооперацию и законодательство РФ
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div style={{padding:"1.5rem",background:"rgba(214,198,178,0.04)",border:"1px solid rgba(230,136,99,0.2)",borderRadius:16,maxWidth:600,margin:"0 auto"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem"}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg, #C96E4D, #E68863)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem"}}>🤖</div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontWeight:600,color:"#E7DCCF"}}>Ассистент Школы Кооперативов</div>
                  <div style={{fontSize:"0.8rem",color:"#6DB89A"}}>● Онлайн</div>
                </div>
              </div>
              <p style={{color:"rgba(214,198,178,0.9)",fontSize:"0.95rem",lineHeight:1.6,marginBottom:"1.5rem",textAlign:"left"}}>
                Привет! Я AI-ассистент Школы Кооперативов. Помогу разобраться с потребительской кооперацией — просто и понятно. Спрашивай!
              </p>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",justifyContent:"center"}}>
                <span style={{padding:"0.5rem 0.9rem",background:"rgba(230,136,99,0.1)",border:"1px solid rgba(230,136,99,0.2)",borderRadius:8,fontSize:"0.85rem",color:"#E68863",cursor:"pointer"}}>💰 Как обнулить НДС?</span>
                <span style={{padding:"0.5rem 0.9rem",background:"rgba(109,184,154,0.1)",border:"1px solid rgba(109,184,154,0.2)",borderRadius:8,fontSize:"0.85rem",color:"#6DB89A",cursor:"pointer"}}>🤔 Что такое ПК?</span>
                <span style={{padding:"0.5rem 0.9rem",background:"rgba(91,141,170,0.1)",border:"1px solid rgba(91,141,170,0.2)",borderRadius:8,fontSize:"0.85rem",color:"#5B8DAA",cursor:"pointer"}}>💬 Сколько стоит?</span>
                <span style={{padding:"0.5rem 0.9rem",background:"rgba(201,177,154,0.1)",border:"1px solid rgba(201,177,154,0.2)",borderRadius:8,fontSize:"0.85rem",color:"#CAB19A",cursor:"pointer"}}>📝 Как зарегистрировать ПК?</span>
              </div>
              <div style={{marginTop:"1rem",display:"flex",gap:"0.5rem"}}>
                <input
                  type="text"
                  placeholder="Ваш вопрос..."
                  style={{flex:1,padding:"0.75rem 1rem",background:"rgba(214,198,178,0.05)",border:"1px solid rgba(214,198,178,0.15)",borderRadius:10,color:"#E7DCCF",fontSize:"0.9rem",outline:"none"}}
                />
                <button
                  style={{padding:"0.75rem 1.5rem",background:"linear-gradient(135deg, #C96E4D, #E68863)",border:"none",borderRadius:10,color:"#0D0C0A",fontWeight:600,cursor:"pointer",fontSize:"0.9rem"}}
                >
                  Отправить →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="cta reveal" id="cta-form" style={{...S}}>
        <div style={{...I, maxWidth:1000, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem", alignItems:"center"}}>
          <div>
            <h3 style={{fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:700, color:"#D6C6B2", marginBottom:"1rem"}}>Готовы начать?</h3>
            <p style={{color:"rgba(214,198,178,0.88)", lineHeight:1.7}}>Запишитесь на бесплатную консультацию — разберём вашу ситуацию и подберём оптимальный формат</p>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* ===== QUOTE 2 ===== */}

            {/* ===== FAQ ===== */}
      <section id="seo-text" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={{...I, maxWidth:900}}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">FAQ</div>
              <h2 className="section-title heading-sweep" data-text="Частые вопросы">Частые вопросы</h2>
            </div>
          </Reveal>
          <FAQAccordion items={faqData} />
        </div>
      </section>




      {/* ===== TAG CLOUD ===== */}
      <section id="tags" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">ТЕМЫ</div>
              <h2 className="section-title heading-sweep" data-text="Облако тегов">Облако тегов</h2>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div style={{display:"flex", flexWrap:"wrap", gap:"0.6rem", justifyContent:"center", maxWidth:800, margin:"0 auto"}}>
              {[
                {label:"Потребительский кооператив", size:1.3, color:"#E68863"},
                {label:"Обнуление НДС", size:1.2, color:"#E68863"},
                {label:"Защита активов", size:1.25, color:"#6DB89A"},
                {label:"Паевой взнос", size:1.1, color:"#BCA891"},
                {label:"Закон 3085-1", size:1.2, color:"#E68863"},
                {label:"Налоги 0%", size:1.3, color:"#E68863"},
                {label:"Устав ПК", size:1.05, color:"#BCA891"},
                {label:"Регистрация кооператива", size:1.15, color:"#6DB89A"},
                {label:"Пайщик", size:1.1, color:"#BCA891"},
                {label:"Субсидиарная ответственность", size:1.0, color:"#8A7F74"},
                {label:"ФНС", size:1.0, color:"#8A7F74"},
                {label:"Некоммерческая организация", size:1.05, color:"#BCA891"},
                {label:"НДФЛ", size:1.0, color:"#8A7F74"},
                {label:"Кооперативные выплаты", size:1.0, color:"#6DB89A"},
                {label:"Модель С500", size:1.1, color:"#E68863"},
                {label:"Аудит устава", size:1.0, color:"#8A7F74"},
                {label:"ЕГРЮЛ", size:0.9, color:"#8A7F74"},
                {label:"Целевая программа", size:1.0, color:"#BCA891"},
                {label:"Кооперация", size:1.15, color:"#E68863"},
                {label:"Налоговая оптимизация", size:1.1, color:"#6DB89A"},
                {label:"Онлайн-касса не нужна", size:1.0, color:"#BCA891"},
                {label:"Потребительское общество", size:1.05, color:"#BCA891"},
                {label:"Ставка 0%", size:1.2, color:"#E68863"},
                {label:"Возврат пая", size:1.0, color:"#8A7F74"},
                {label:"Паевой фонд", size:0.95, color:"#8A7F74"},
                {label:"Общее собрание", size:0.95, color:"#8A7F74"},
                {label:"Правление ПК", size:0.9, color:"#8A7F74"},
                {label:"Ревизионная комиссия", size:0.9, color:"#8A7F74"},
                {label:"Резервный фонд", size:0.9, color:"#8A7F74"},
                {label:"Кооперативный возврат", size:0.95, color:"#6DB89A"},
              ].map((tag, i) => (
                <span key={i} style={{
                  fontSize: tag.size + "rem",
                  padding: "0.4rem 0.9rem",
                  borderRadius: 999,
                  border: "1px solid " + tag.color + "33",
                  background: tag.color + "0D",
                  color: tag.color,
                  cursor: "default",
                  transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                  display:"inline-block",
                }}
                onMouseEnter={e => {e.currentTarget.style.borderColor=tag.color+"99"; e.currentTarget.style.background=tag.color+"1A"; e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e => {e.currentTarget.style.borderColor=tag.color+"33"; e.currentTarget.style.background=tag.color+"0D"; e.currentTarget.style.transform="translateY(0)"}}
                >{tag.label}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== LEAD FORM ===== */}
            <section id="lead-form" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={{...I, maxWidth:600}}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">ЗАЯВКА</div>
              <h2 className="section-title heading-sweep" data-text="Оставьте заявку">Оставьте заявку</h2>
              <p style={{color:"rgba(214,198,178,0.7)", marginTop:"0.5rem"}}>Заполните форму — перезвоним в течение рабочего дня</p>
            </div>
          </Reveal>
          <LeadForm />
        </div>
      </section>

      {/* ===== DYNAMIC BLOCKS FROM PAYLOAD ADMIN ===== */}
      {homeData?.blocks && Array.isArray(homeData.blocks) && homeData.blocks.length > 0 && (
        <BlockRenderer blocks={homeData.blocks} />
      )}

      {/* ===== AI CHAT WIDGET — lazy по кнопке ===== */}
      <LazyAIChatButton />
    </>
  );
}

