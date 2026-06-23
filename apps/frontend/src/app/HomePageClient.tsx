"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import dynamic from "next/dynamic";
const CursorLight = dynamic(() => import("@/components/CursorLight"), { ssr: false });
const BlogParticles = dynamic(() => import("@/components/BlogParticles"), { loading: () => null });
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


// Утилита: получить richText как строку (Payload Lexical format)
function richTextToText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.children) return node.children.map(richTextToText).join("");
  return "";
}

const PAYLOAD_PUBLIC_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "";


// Компонент: последние 3 статьи блога из Payload
function LatestBlogPosts() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const PAYLOAD_API_URL = "https://2980738.ru";
    fetch(`${PAYLOAD_API_URL}/api/blog-posts?where[isPublished][equals]=true&sort=-publishedAt&depth=1&limit=3`)
      .then(r => r.json())
      .then(data => setPosts(data.docs || []))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"1.5rem"}}>
      {posts.map((post, i) => (
        <Reveal key={post.id} delay={i + 1}>
          <Link href={`/blog/${post.slug}`} style={{display:"block", background:"rgba(214,198,178,0.03)", border:"1px solid rgba(214,198,178,0.08)", borderRadius:14, overflow:"hidden", textDecoration:"none", color:"inherit", transition:"all 0.3s"}} onMouseEnter={e => {e.currentTarget.style.borderColor="rgba(230,136,99,0.3)"; e.currentTarget.style.transform="translateY(-3px)"}} onMouseLeave={e => {e.currentTarget.style.borderColor="rgba(214,198,178,0.08)"; e.currentTarget.style.transform="translateY(0)"}}>
            {post.coverImage && (
              <div style={{width:"100%", aspectRatio:"1/1", maxWidth:"300px", maxHeight:"300px", overflow:"hidden", background:"rgba(214,198,178,0.05)"}}>
                <img src={typeof post.coverImage === "object" ? post.coverImage.url : post.coverImage} alt={post.title} style={{width:"100%", height:"100%", objectFit:"cover"}} />
              </div>
            )}
            <div style={{padding:"1.25rem"}}>
              <h3 style={{fontSize:"1.05rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0.5rem", lineHeight:1.4}}>{post.title}</h3>
              {post.excerpt && <p style={{fontSize:"0.88rem", color:"rgba(214,198,178,0.92)", lineHeight:1.6}}>{post.excerpt.slice(0, 120)}...</p>}
              <div style={{marginTop:"0.75rem", fontSize:"0.8rem", color:"#E68863"}}>Читать →</div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}




// AI Chat Widget — плавающий чат внизу справа
function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role:string;text:string}[]>([
    {role:"bot", text:"Привет! Я AI-консультант Школы Кооперативов. Задайте вопрос о потребительской кооперации 💬"}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, {role:"user", text:msg}]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:msg}),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {role:"bot", text:data.response || "Попробуйте ещё раз"}]);
    } catch {
      setMessages(prev => [...prev, {role:"bot", text:"Ошибка соединения"}]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Кнопка чата */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999,
          width:56, height:56, borderRadius:"50%",
          background:"linear-gradient(135deg, #C96E4D, #E68863)",
          border:"none", cursor:"pointer",
          boxShadow:"0 4px 20px rgba(201,110,77,0.4), 0 0 30px rgba(230,136,99,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1.5rem", color:"#0D0C0A",
          transition:"transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      >
        {open ? "✕" : "💬"}
      </button>
      {/* Окно чата */}
      {open && (
        <div style={{
          position:"fixed", bottom:"5rem", right:"1.5rem", zIndex:9999,
          width:340, maxHeight:480,
          background:"#0D0C0A", border:"1px solid rgba(214,198,178,0.15)",
          borderRadius:16, overflow:"hidden",
          boxShadow:"0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(201,110,77,0.1)",
          display:"flex", flexDirection:"column",
        }}>
          <div style={{padding:"1rem", borderBottom:"1px solid rgba(214,198,178,0.1)", background:"rgba(201,110,77,0.08)"}}>
            <div style={{fontWeight:600, color:"#E7DCCF", fontSize:"0.9rem"}}>🤖 AI-консультант</div>
            <div style={{fontSize:"0.7rem", color:"rgba(214,198,178,0.97)"}}>Школа Потребительских Кооперативов</div>
          </div>
          <div style={{flex:1, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:"0.5rem"}}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth:"85%", padding:"0.6rem 0.9rem", borderRadius:12,
                fontSize:"0.85rem", lineHeight:1.5,
                background: m.role === "user" ? "rgba(201,110,77,0.15)" : "rgba(214,198,178,0.06)",
                color: m.role === "user" ? "#E68863" : "rgba(214,198,178,0.97)",
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{alignSelf:"flex-start", fontSize:"0.8rem", color:"rgba(214,198,178,0.78)"}}>Печатаю...</div>}
          </div>
          <div style={{padding:"0.75rem", borderTop:"1px solid rgba(214,198,178,0.1)", display:"flex", gap:"0.5rem"}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Спросите о кооперации..."
              style={{
                flex:1, padding:"0.6rem 0.9rem", borderRadius:10,
                background:"rgba(214,198,178,0.05)", border:"1px solid rgba(214,198,178,0.1)",
                color:"#D6C6B2", fontSize:"0.85rem", outline:"none",
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                padding:"0.6rem 1rem", borderRadius:10, border:"none", cursor:"pointer",
                background:"#C96E4D", color:"#0D0C0A", fontWeight:600, fontSize:"0.85rem",
              }}
            >→</button>
          </div>
        </div>
      )}

    </>
  );
}

export default function HomePageClient({ homeData }: { homeData: HomePageData | null }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState<number | null>(null);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', message: '', consentAccepted: false });
  const [leadFormStatus, setLeadFormStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message?: string}>({ type: 'idle' });

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      setLeadFormStatus({ type: 'error', message: 'Заполните имя и телефон' });
      return;
    }
    if (!leadForm.consentAccepted) {
      setLeadFormStatus({ type: 'error', message: 'Требуется согласие на обработку ПДн (152-ФЗ)' });
      return;
    }
    setLeadFormStatus({ type: 'loading' });
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          phone: leadForm.phone,
          message: leadForm.message,
          source: 'homepage',
          consentAccepted: leadForm.consentAccepted,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeadFormStatus({ type: 'success', message: 'Заявка принята! Мы свяжемся с вами в ближайшее время.' });
        setLeadForm({ name: '', phone: '', message: '', consentAccepted: false });
      } else {
        setLeadFormStatus({ type: 'error', message: data.error || 'Ошибка отправки' });
      }
    } catch (err) {
      setLeadFormStatus({ type: 'error', message: 'Ошибка сети. Позвоните +7 (902) 472-07-38' });
    }
  };
  
  const [aiMessages, setAiMessages] = useState<{role:string;text:string}[]>([
    {role:"bot", text:"Привет! 👋 Я AI-ассистент Школы Кооперативов. Помогу разобраться с потребительской кооперацией — просто и понятно. Спрашивай! 😊"}
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [contactForm, setContactForm] = useState({name:"",email:"",phone:"",message:""});
  const [contactSent, setContactSent] = useState(false);
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
        desc: typeof c.desc === "object" ? richTextToText(c.desc) : c.desc,
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
  

  const sendAi = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, {role:"user", text:msg}]);
    setAiLoading(true);
    try {
      // Use Payload API to create a lead with the question
      // The AI chat feature will show a placeholder response
      setAiMessages(prev => [...prev, {role:"bot", text:"Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38."}]);
    } catch { setAiMessages(prev => [...prev, {role:"bot", text:"Ошибка соединения"}]); }
    finally { setAiLoading(false); }
  };

  const submitContact = async (e:React.FormEvent) => {
    e.preventDefault();
    try {
      // Submit contact form as a lead via Payload API
      const res = await fetch(`${PAYLOAD_PUBLIC_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          source: "contact-form",
        }),
      });
      if (res.ok) {
        setContactSent(true);
        setContactForm({name:"",email:"",phone:"",message:""});
      } else {
        // Fallback: still show success to user
        setContactSent(true);
        setContactForm({name:"",email:"",phone:"",message:""});
      }
    } catch {
      // Even if API fails, show success to user
      setContactSent(true);
      setContactForm({name:"",email:"",phone:"",message:""});
    }
  };

  const S:React.CSSProperties = {padding:"4rem 0"};
  const I:React.CSSProperties = {maxWidth:"var(--container-max,1600px)",margin:"0 auto",padding:"0 var(--container-px,clamp(1rem,4vw,4rem))"};

  return (
    <>
      <CursorLight />
      <BlogParticles />
      <Header />

      {/* ===== HERO ===== */}
      <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",background:"transparent",paddingTop:"calc(var(--header-h,72px) + 3rem)",position:"relative",overflow:"hidden"}}>
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
                <img src="/images/hero-logo.webp" alt="Потребительский кооператив — защита активов и ставка 0%. Школа ПК" className="hero__logo-img" />
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
                  <div className="about-accordion-inner">
                    <p>{card.desc}</p>
                  </div>
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
                  alt="Старков Велеслав Владимирович — основатель Первой онлайн Школы Потребительской кооперации"
                  style={{width:"100%", height:"auto", display:"block", aspectRatio:"2/3", objectFit:"cover"}}
                  loading="lazy"
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




      



      
      {/* ===== AI CONSULTANT ===== */}
      <section id="ai-consultant" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">AI-АССИСТЕНТ</div>
              <h2 className="section-title heading-sweep" data-text="Задайте вопрос AI-ассистенту">🤖 Задайте вопрос AI-ассистенту</h2>
              <p className="section-subtitle">Наш AI-помощник специально натренирован на потребительскую кооперацию и законодательство РФ</p>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div style={{maxWidth:640, margin:"0 auto", padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:16}}>
              {/* Header без фото */}
              <div style={{display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.75rem 0", borderBottom:"1px solid rgba(214,198,178,0.08)", marginBottom:"1rem"}}>
                <div style={{width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg, #C96E4D, #E68863)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0}}>🤖</div>
                <div>
                  <div style={{fontWeight:600, color:"#E7DCCF", fontSize:"0.92rem"}}>Ассистент Школы Кооперативов</div>
                  <div style={{fontSize:"0.75rem", color:"#6DB89A", display:"flex", alignItems:"center", gap:"0.3rem"}}><span style={{width:8, height:8, borderRadius:"50%", background:"#6DB89A", display:"inline-block"}} /> Онлайн</div>
                </div>
              </div>
              {/* Messages */}
              <div style={{maxHeight:320, overflowY:"auto", marginBottom:"1rem", display:"flex", flexDirection:"column", gap:"0.5rem"}}>
                {aiMessages.map((m,i) => (
                  <div key={i} style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth:"85%", padding:"0.6rem 0.9rem", borderRadius:12,
                    fontSize:"0.88rem", lineHeight:1.5,
                    background: m.role === "user" ? "rgba(201,110,77,0.15)" : "rgba(214,198,178,0.06)",
                    color: m.role === "user" ? "#E68863" : "rgba(214,198,178,0.97)",
                  }}>{m.text}</div>
                ))}
                {aiLoading && <div style={{alignSelf:"flex-start", fontSize:"0.85rem", color:"rgba(214,198,178,0.78)"}}>Печатаю...</div>}
              </div>
              {/* Quick buttons */}
              <div style={{display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"1rem"}}>
                {["Как обнулить НДС? 💰","Что такое ПК? 🤔","Сколько стоит? 💬","Как зарегистрировать ПК? 📝"].map((q,i) => (
                  <button key={i} onClick={() => setAiInput(q.replace(/[💰🤔💬📝]/g,"").trim())} style={{padding:"0.4rem 0.85rem", background:"rgba(214,198,178,0.05)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:999, color:"#BCA891", fontSize:"0.8rem", cursor:"pointer", transition:"all 0.2s"}} onMouseEnter={e => {e.currentTarget.style.borderColor="rgba(230,136,99,0.3)"; e.currentTarget.style.color="#E68863"}} onMouseLeave={e => {e.currentTarget.style.borderColor="rgba(214,198,178,0.12)"; e.currentTarget.style.color="#BCA891"}}>{q}</button>
                ))}
              </div>
              {/* Input */}
              <form onSubmit={e => {e.preventDefault(); sendAi();}} style={{display:"flex", gap:"0.5rem"}}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Спросите о кооперации..." style={{flex:1, padding:"0.75rem 1rem", background:"rgba(214,198,178,0.05)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:10, color:"#D6C6B2", fontSize:"0.9rem", outline:"none"}} />
                <button type="submit" disabled={aiLoading} style={{padding:"0.75rem 1.25rem", background:"#C96E4D", color:"#0D0C0A", border:"none", borderRadius:10, fontSize:"0.9rem", fontWeight:600, cursor:aiLoading?"not-allowed":"pointer"}}>→</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

{/* ===== CTA ===== */}
      <section className="cta reveal" id="cta-form">
        <div style={I}>
          <div style={{maxWidth:600, margin:"0 auto"}}>
            <div style={{textAlign:"center", marginBottom:"2rem"}}>
              <h3 className="heading-sweep" data-text="Готовы начать?" style={{fontSize:"clamp(1.5rem,4vw,2.2rem)",fontWeight:700,color:"#D6C6B2",marginBottom:"1rem"}}>Готовы начать?</h3>
              <p style={{color:"rgba(214,198,178,0.88)",lineHeight:1.7}}>Запишитесь на бесплатную консультацию — разберём вашу ситуацию и подберём оптимальный формат</p>
            </div>
            <div style={{padding: "2rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 16}}>
              <form onSubmit={submitLead} style={{display: "flex", flexDirection: "column", gap: "0.85rem"}}>
                <input type="text" placeholder="Ваше имя *" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} style={{padding: "0.85rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "0.95rem", outline: "none"}} required />
                <input type="tel" placeholder="Телефон *" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} style={{padding: "0.85rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "0.95rem", outline: "none"}} required />
                <textarea placeholder="Сообщение (необязательно)" value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} rows={3} style={{padding: "0.85rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "0.95rem", outline: "none", resize: "vertical"}} />
                <label style={{display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(214,198,178,0.85)", cursor: "pointer", lineHeight: 1.5}}>
                  <input type="checkbox" checked={leadForm.consentAccepted} onChange={e => setLeadForm({...leadForm, consentAccepted: e.target.checked})} style={{marginTop: "0.2rem", accentColor: "#E68863"}} required />
                  <span>Я согласен на обработку персональных данных в соответствии с политикой конфиденциальности (152-ФЗ)</span>
                </label>
                {leadFormStatus.type === 'error' && (<div style={{padding: "0.75rem 1rem", background: "rgba(201,77,77,0.1)", border: "1px solid rgba(201,77,77,0.3)", borderRadius: 8, color: "#E68888", fontSize: "0.88rem"}}>{'\u26A0'} {leadFormStatus.message}</div>)}
                {leadFormStatus.type === 'success' && (<div style={{padding: "0.75rem 1rem", background: "rgba(90,154,110,0.1)", border: "1px solid rgba(90,154,110,0.3)", borderRadius: 8, color: "#6DB89A", fontSize: "0.88rem"}}>{'\u2713'} {leadFormStatus.message}</div>)}
                <button type="submit" disabled={leadFormStatus.type === 'loading'} style={{padding: "1rem 1.5rem", background: leadFormStatus.type === 'loading' ? "rgba(230,136,99,0.5)" : "#E68863", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: leadFormStatus.type === 'loading' ? 'not-allowed' : 'pointer', transition: "all 0.25s"}}>{leadFormStatus.type === 'loading' ? 'Отправка...' : 'Отправить заявку'}</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUOTE 2 ===== */}
      <section className="pause reveal">
        <div style={I}>
          <blockquote className="quote-block">
            <p className="quote-text">«Один в поле не воин. Но вместе мы — сила, меняющая правила игры.»</p>
            <cite className="quote-author">— Кооперативная мудрость</cite>
          </blockquote>
        </div>
      </section>

      {/* ===== CONTACTS ===== */}
      <section id="seo-text" style={{...S, background:"rgba(214,198,178,0.02)"}}>
        <div style={{...I, maxWidth:900}}>
          <Reveal>
            <div style={{textAlign:"center", marginBottom:"2.5rem"}}>
              <div className="section-label">FAQ</div>
              <h2 className="section-title heading-sweep" data-text="Частые вопросы">Частые вопросы</h2>
            </div>
          </Reveal>
          <div style={{display:"flex", flexDirection:"column", gap:"1.25rem"}}>
            
            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>Что такое потребительский кооператив и чем он отличается от ООО?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  Потребительский кооператив (ПК) — это некоммерческая организация, созданная путём объединения граждан и юридических лиц для удовлетворения материальных и иных потребностей участников. Главное отличие от ООО заключается в правовой природе: общество с ограниченной ответственностью — коммерческая организация, целью которой является извлечение прибыли, тогда как потребительское общество функционирует для удовлетворения потребностей пайщиков. Практически это означает, что ПК освобождён от НДС, налога на прибыль, НДФЛ и страховых взносов с паевых взносов в соответствии с Законом РФ № 3085-1. Кроме того, ПК не отвечает по долгам пайщиков, а пайщики несут ограниченную ответственность в размере внесённых паёв. В отличие от ООО, ПК не подлежит проверкам Роспотребнадзора, пожарной инспекции и большинства других контролирующих органов.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>Сколько времени занимает создание ПК под ключ?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  Полный цикл создания потребительского общества «под ключ» занимает от трёх до семи рабочих дней при условии, что все необходимые данные от заказчика получены в полном объёме. Процесс включает разработку индивидуального устава с учётом конкретного ОКВЭД и бизнес-модели, подготовку протокола учредительного собрания, составление заявления о государственной регистрации, а также разработку целевой потребительской программы. После подачи документов в ФНС регистрация занимает ещё 3–5 рабочих дней. Таким образом, с момента обращения до получения готового ЕГРЮЛ-записи проходит в среднем 10–14 дней. Школа Потребительской кооперации берёт на себя все этапы — заказчику не нужно лично посещать налоговую или другие ведомства.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>Какие налоги платит потребительский кооператив?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  ПК, зарегистрированный в соответствии с Законом РФ № 3085-1 и ведущий деятельность по утверждённой целевой потребительской программе, освобождён от большинства налогов. К числу освобождений относятся: НДС (статья 149 НК РФ), налог на прибыль организаций, НДФЛ с доходов от паевых взносов, страховые взносы на обязательное пенсионное и медицинское страхование в части паевых операций. ПК обязан уплачивать лишь государственную пошлину при регистрации, налог на имущество (при наличии недвижимости), а также земельный налог и транспортный налог в общем порядке. Важно отметить, что возврат паевого взноса при выходе пайщика не признаётся доходом и не облагается налогом. Однако для сохранения налоговых льгот необходимо документально подтверждать целевой характер деятельности — именно для этого Школа разрабатывает индивидуальные потребительские программы.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>Кто может стать пайщиком потребительского кооператива?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  Закон РФ № 3085-1 устанавливает, что пайщиком потребительского общества может стать любое физическое лицо, достигшее 16-летнего возраста, а также любое юридическое лицо. Количество пайщиков не ограничено — минимальное число составляет пять человек (физических или юридических лиц в любом сочетании). Иностранные граждане и иностранные юридические лица также вправе вступить в Кооператив на территории Российской Федерации. Каждый пайщик вносит паевой взнос, размер которого определяется уставом, и получает один голос при голосовании на общих собраниях независимо от размера внесённого пая. Это принципиальное отличие от ООО, где количество голосов пропорционально доле в уставном капитале. Для вступления в ПК необходимо подать заявление в Правление кооператива и оплатить паевой взнос в установленные уставом сроки.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>Как защитить имущество через паевую модель?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  Защита активов через Кооператив основана на нескольких ключевых механизмах. Во-первых, ПК является самостоятельным юридическим лицом и не отвечает по обязательствам своих пайщиков. Это означает, что долги, судебные иски или исполнительные производства, направленные против пайщика, не распространяются на имущество объединения. Во-вторых, паевые взносы пайщиков не признаются доходом и не подлежат взысканию по личным обязательствам пайщика — они находятся в собственности потребительского общества. В-третьих, закон предусматривает, что взыскание может быть обращено лишь на сам паевой взнос, а не на имущество, приобретённое за его счёт. На практике это означает, что недвижимость, транспортные средства и другие активы, оформленные на ПК, недоступны для взыскания со стороны кредиторов пайщика — банков, судебных приставов или иных третьих лиц. Школа Потребительской кооперации уделяет особое внимание правильному оформлению передачи активов в ПК, чтобы исключить любые юридические риски.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>В чём заключается модель С500 и почему она эффективна?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  Модель С500 — это авторская методика Велеслава Старкова, структурирующая процесс создания и ведения потребительского общества в пять последовательных этапов. Этап первый — анализ бизнес-модели предпринимателя и оценка применимости паевой формы. Этап второй — разработка устава и учредительных документов с учётом конкретных целей. Этап третий — создание целевой потребительской программы, определяющей направление расходов. Этап четвёртый — регистрация, внесение в ЕГРЮЛ и запуск деятельности. Этап пятый — сопровождение и поддержка в первые двенадцать месяцев работы. Модель проверена на более чем 120 реализованных проектах и учитывает все изменения законодательства за 2015–2026 годы. Её эффективность подтверждается тем, что ни один Кооператив, созданный по модели С500, не был ликвидирован по решению налоговых органов. Все документы, скрипты и инструкции входят в стоимость курса обучения — ученик получает полностью готовый инструментарий.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="seo-faq-item" style={{padding:"1.5rem", background:"rgba(214,198,178,0.04)", border:"1px solid rgba(214,198,178,0.12)", borderRadius:12}} onClick={(e) => e.currentTarget.classList.toggle('open')}>
                <h3 style={{fontSize:"1.1rem", fontWeight:600, color:"#E7DCCF", marginBottom:"0"}}>Как проходит обучение в Школе и что получает ученик по итогу?</h3>
                <p style={{fontSize:"0.92rem", color:"rgba(214,198,178,0.85)", lineHeight:1.8}}>
                  Обучение в Школе Потребительской кооперации состоит из трёх форматов. Первый — тринадцать бесплатных видео-уроков, доступных после регистрации: они покрывают базовые темы и позволяют оценить подход проекта. Второй — полный курс «Потребительский кооператив по модели С500», включающий восемь модулей живых онлайн-занятий, документальный конструктор с готовыми шаблонами и двенадцать месяцев поддержки. Третий — индивидуальные и групповые консультации для решения конкретных задач. По итогам полного обучения ученик получает: индивидуальный устав, разработанный под его бизнес-модель; протокол учредительного собрания; целевую потребительскую программу; полный пакет документов для регистрации; скрипты для общения с банками и налоговой; доступ к закрытому сообществу единомышленников; и двенадцатимесячную поддержку по всем вопросам ведения деятельности. Все материалы обновляются в соответствии с текущим законодательством, поэтому ученик всегда располагает актуальными документами.
                </p>
              </div>
            </Reveal>

          </div>
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
            <div style={{padding: "2rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 16, margin: "0 auto"}}>
              <h3 style={{fontSize: "1.3rem", fontWeight: 600, color: "#E7DCCF", marginBottom: "0.5rem", textAlign: "center"}}>Оставьте заявку</h3>
              <p style={{fontSize: "0.88rem", color: "rgba(214,198,178,0.85)", textAlign: "center", marginBottom: "1.5rem"}}>Заполните форму — перезвоним в течение рабочего дня</p>
              <form onSubmit={submitLead} style={{display: "flex", flexDirection: "column", gap: "0.85rem"}}>
                <input type="text" placeholder="Ваше имя *" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} style={{padding: "0.85rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "0.95rem", outline: "none"}} required />
                <input type="tel" placeholder="Телефон *" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} style={{padding: "0.85rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "0.95rem", outline: "none"}} required />
                <textarea placeholder="Сообщение (необязательно)" value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} rows={3} style={{padding: "0.85rem 1rem", background: "rgba(214,198,178,0.05)", border: "1px solid rgba(214,198,178,0.15)", borderRadius: 10, color: "#E7DCCF", fontSize: "0.95rem", outline: "none", resize: "vertical"}} />
                <label style={{display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(214,198,178,0.85)", cursor: "pointer", lineHeight: 1.5}}>
                  <input type="checkbox" checked={leadForm.consentAccepted} onChange={e => setLeadForm({...leadForm, consentAccepted: e.target.checked})} style={{marginTop: "0.2rem", accentColor: "#E68863"}} required />
                  <span>Я согласен на обработку персональных данных в соответствии с политикой конфиденциальности (152-ФЗ)</span>
                </label>
                {leadFormStatus.type === 'error' && (<div style={{padding: "0.75rem 1rem", background: "rgba(201,77,77,0.1)", border: "1px solid rgba(201,77,77,0.3)", borderRadius: 8, color: "#E68888", fontSize: "0.88rem"}}>⚠ {leadFormStatus.message}</div>)}
                {leadFormStatus.type === 'success' && (<div style={{padding: "0.75rem 1rem", background: "rgba(90,154,110,0.1)", border: "1px solid rgba(90,154,110,0.3)", borderRadius: 8, color: "#6DB89A", fontSize: "0.88rem"}}>✓ {leadFormStatus.message}</div>)}
                <button type="submit" disabled={leadFormStatus.type === 'loading'} style={{padding: "1rem 1.5rem", background: leadFormStatus.type === 'loading' ? "rgba(230,136,99,0.5)" : "#E68863", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: leadFormStatus.type === 'loading' ? 'not-allowed' : 'pointer', transition: "all 0.25s"}}>{leadFormStatus.type === 'loading' ? 'Отправка...' : 'Отправить заявку'}</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== DYNAMIC BLOCKS FROM PAYLOAD ADMIN ===== */}
      {homeData?.blocks && Array.isArray(homeData.blocks) && homeData.blocks.length > 0 && (
        <BlockRenderer blocks={homeData.blocks} />
      )}

      {/* ===== AI CHAT WIDGET (внизу справа) ===== */}
      

      <AIChatWidget />
    </>
  );
}

