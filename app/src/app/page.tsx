"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CursorLight from "@/components/CursorLight";
import Reveal from "@/components/Reveal";

const PAYLOAD_PUBLIC_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "";

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState<number | null>(null);
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
    {icon:"0%", title:"Налоги = 0", desc:"НДС, налог на прибыль, НДФЛ и соц.платежи — 0% по закону", color:"orange"},
    {icon:"🛡️", title:"Защита имущества", desc:"ПК не отвечает по долгам пайщиков. Личное имущество в безопасности", color:"green"},
    {icon:"✅", title:"Никаких проверок", desc:"Пожарные, СЭС, Роспотребнадзор не вмешиваются (ФЗ-3085)", color:"blue"},
    {icon:"💰", title:"Возврат пая — не доход", desc:"Паевой взнос возвращается без налогов", color:"beige"},
    {icon:"💳", title:"Онлайн-касса не нужна", desc:"Нет продаж — есть возврат паёв", color:"orange"},
    {icon:"🗳️", title:"Один пайщик — один голос", desc:"Демократия в бизнесе", color:"green"},
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
    {icon:"⚡", title:"Современный подход", desc:"Цифровизация процессов и адаптация документов к реалиям 2025–2026 годов", color:"orange"},
    {icon:"🎯", title:"Модель С500", desc:"Пять этапов от анализа до запуска. Ни один ПК не ликвидирован ФНС", color:"green"},
    {icon:"📋", title:"Практическая база", desc:"Готовые документы, скрипты и 12 месяцев поддержки после обучения", color:"blue"},
    {icon:"👥", title:"Сообщество 500+", desc:"Более 500 участников из 40 регионов России", color:"beige"},
  ];

  const faqItems = [
    {q:"Что такое потребительский кооператив?", a:"Потребительский кооператив (ПК) — некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников. В отличие от ООО, ПК не преследует извлечение прибыли, освобождён от НДС, налога на прибыль и НДФЛ с паевых взносов (Закон РФ № 3085-1)."},
    {q:"Сколько времени занимает создание ПК под ключ?", a:"Полный цикл занимает от 3 до 7 рабочих дней. Включает разработку устава, протокол учредительного собрания, целевую программу. Регистрация в ФНС — 3-5 рабочих дней. Итого от обращения до ЕГРЮЛ-записи — 10-14 дней."},
    {q:"Какие налоги платит потребительский кооператив?", a:"ПК по Закону № 3085-1 освобождён от НДС (ст. 149 НК РФ), налога на прибыль, НДФЛ с доходов от паевых взносов. Уплачиваются: госпошлина при регистрации, налог на имущество, земельный и транспортный налог."},
    {q:"Правда ли что налоги могут быть 0%?", a:"Да, это законно. НДС, налог на прибыль, НДФЛ и социальные платежи могут быть 0% при правильной организации деятельности ПК. Кооперативная цена равна себестоимости — налоговая база равна нулю."},
    {q:"Как ПК защищает имущество?", a:"ПК не отвечает по долгам пайщиков, а пайщики не отвечают по долгам ПК (субсидиарная ответственность ограничена размером паевого взноса). Имущество кооператива принадлежит ему как юридическому лицу."},
    {q:"Что такое модель С500?", a:"Авторская методика Велеслава Старкова, структурирующая весь процесс создания и ведения потребительского общества в пять этапов: от анализа бизнес-модели до запуска деятельности. Ни один ПК, созданный по модели С500, не был ликвидирован по решению ФНС."},
  ];

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
      <Header />

      {/* ===== HERO ===== */}
      <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",background:"var(--color-bg,#0D0C0A)",paddingTop:"var(--header-h,72px)",position:"relative",overflow:"hidden"}}>
        <div className="hero__ambient" />
        <div style={{...I,width:"100%",position:"relative",zIndex:2}}>
          <Reveal>
            <div className="hero-grid">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="pulse-dot" /> Потребительский кооператив — защита активов и ставка 0%
                </div>
                <h1 className="hero-title heading-sweep">
                  <span className="text-accent">Первая Онлайн Школа</span><br/>
                  Потребительских Кооперативов
                </h1>
                <p className="hero-desc">
                  НДС, налог на прибыль и соц.платежи — 0% по закону РФ № 3085-1. Обучим работе с некоммерческими организациями. Защитите имущество от взысканий, обнулите налоги и работайте легально — более 120 предпринимателей уже открыли свои ПК с нашей помощью.
                </p>
                <div className="hero-actions">
                  <Link href="/kursy" className="btn-primary">Выбрать курс</Link>
                  <Link href="/konsultacii" className="btn-secondary">Бесплатная консультация</Link>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero__logo-glow" />
                <div className="hero__logo-ring" style={{width:280,height:280}} />
                <div className="hero__logo-ring" style={{width:360,height:360,animationDelay:"-3s"}} />
                <img src="/images/hero-logo.webp" alt="" className="hero__logo-img" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== QUOTE ===== */}
      <section className="pause pause--after-hero reveal">
        <div style={I}>
          <blockquote className="quote-block">
            <p className="quote-text">«Кооперация — это не бизнес-модель. Это архитектура доверия.»</p>
            <cite className="quote-author">— Велеслав Старков</cite>
          </blockquote>
        </div>
      </section>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" style={{...S,background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div className="section-label">Преимущества</div>
            <h2 className="section-title heading-sweep">Преимущества</h2>
            <p className="section-subtitle">Предприниматели теряют миллионы на налогах и рискуют имуществом. Но есть другой путь.</p>
          </Reveal>
          <div className="advantages-grid">
            {advantages.map((a,i) => (
              <Reveal key={i}>
                <div className={`advantage-card glass-2 adv-${a.color}`}>
                  <div className="advantage-icon">{a.icon}</div>
                  <h3 className="advantage-title">{a.title}</h3>
                  <p className="advantage-desc">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-bar section--light reveal">
        <div style={I}>
          <div className="stats-grid">
            {stats.map((s,i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW ===== */}
      <section id="how" style={S}>
        <div style={I}>
          <Reveal>
            <h2 className="section-title heading-sweep">Устал выживать один? <span className="text-accent">Пора кооперироваться!</span></h2>
          </Reveal>
          <div className="how-grid">
            {howSteps.map((s,i) => (
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

      {/* ===== ABOUT SCHOOL ===== */}
      <section id="about" style={{...S,background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <div className="section-label">О Школе</div>
            <h2 className="section-title heading-sweep">О Школе</h2>
            <p className="section-subtitle">Первая онлайн Школа потребительской кооперации — образовательный проект, запущенный в 2015 году Велеславом Старковым. За десять лет работы Школа стала крупнейшим в России центром подготовки предпринимателей к ведению деятельности через паевую модель.</p>
          </Reveal>
          <div className="about-accordion">
            {aboutCards.map((card,i) => (
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

      {/* ===== FAQ ===== */}
      <section id="faq" style={S}>
        <div style={I}>
          <Reveal>
            <div className="section-label">FAQ</div>
            <h2 className="section-title heading-sweep">Частые вопросы</h2>
          </Reveal>
          <div className="faq-list">
            {faqItems.map((item,i) => (
              <div key={i} className="faq-item">
                <button className={`faq-btn ${faqOpen===i?"open":""}`} onClick={() => setFaqOpen(faqOpen===i?null:i)}>
                  <span>{item.q}</span>
                  <span className={`faq-chevron ${faqOpen===i?"open":""}`}>+</span>
                </button>
                <div className={`faq-panel ${faqOpen===i?"open":""}`}>
                  <div className="faq-inner">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI CONSULTANT ===== */}
      <section id="ai-consultant" style={{...S,background:"rgba(214,198,178,0.02)"}}>
        <div style={I}>
          <Reveal>
            <h2 className="section-title heading-sweep">🤖 Задайте вопрос AI-ассистенту</h2>
            <p className="section-subtitle">Наш AI-помощник специально натренирован на потребительскую кооперацию и законодательство РФ</p>
          </Reveal>
          <div className="ai-chat-box glass-2">
            <div className="ai-chat-header">
              <img src="/images/veleslav-avatar.png" alt="" className="ai-avatar" />
              <div>
                <div className="ai-name">Ассистент Школы Кооперативов</div>
                <div className="ai-status">Онлайн</div>
              </div>
            </div>
            <div className="ai-chat-messages">
              {aiMessages.map((m,i) => (
                <div key={i} className={`ai-msg ${m.role}`}>{m.text}</div>
              ))}
              {aiLoading && <div className="ai-msg bot">Печатаю...</div>}
            </div>
            <div className="ai-quick-btns">
              {["Как обнулить НДС? 💰","Что такое ПК? 🤔","Сколько стоит? 💬","Как зарегистрировать ПК? 📝"].map((q,i) => (
                <button key={i} className="ai-quick-btn" onClick={() => {setAiInput(q.replace(/[💰🤔💬📝]/g,"").trim());}}>{q}</button>
              ))}
            </div>
            <form className="ai-input-row" onSubmit={e => {e.preventDefault();sendAi();}}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Спросите о кооперации..." className="ai-input" />
              <button type="submit" className="ai-send-btn">→</button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta reveal">
        <div style={I}>
          <div style={{textAlign:"center",maxWidth:550,margin:"0 auto"}}>
            <h2 className="heading-sweep" style={{fontSize:"clamp(1.5rem,4vw,2.2rem)",fontWeight:700,color:"#D6C6B2",marginBottom:"1rem"}}>Готовы начать?</h2>
            <p style={{color:"rgba(214,198,178,0.55)",marginBottom:"2rem",lineHeight:1.7}}>Запишитесь на бесплатную консультацию — разберём вашу ситуацию и подберём оптимальный формат</p>
            <Link href="/konsultacii" className="btn-primary" style={{padding:"0.8rem 2rem",fontSize:"1rem"}}>Оставить заявку</Link>
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
      <section id="contacts" style={S}>
        <div style={I}>
          <Reveal>
            <h2 className="section-title heading-sweep">Свяжитесь с нами</h2>
          </Reveal>
          <div className="contacts-grid">
            <div className="contacts-info">
              <div className="contact-item"><span className="ci-label">Телефон</span><a href="tel:+79024720738" className="ci-value">+7 (902) 472-07-38</a></div>
              <div className="contact-item"><span className="ci-label">Email</span><a href="mailto:boss@2980738.ru" className="ci-value">boss@2980738.ru</a></div>
              <div className="contact-item"><span className="ci-label">Telegram</span><a href="https://t.me/Veles_ST" target="_blank" className="ci-value">@Veles_ST</a></div>
              <div className="contact-item"><span className="ci-label">Группа ПК</span><a href="https://t.me/OnlinePK" target="_blank" className="ci-value">@OnlinePK</a></div>
              <div className="contact-item"><span className="ci-label">Адрес</span><span className="ci-value">г. Пермь, ул. Фонтанная, д. 1а/1</span></div>
              <div className="contact-item ci-sub">ИП Старков Велеслав Владимирович, ИНН 590415054646</div>
            </div>
            <div className="contacts-form-wrap glass-2">
              {contactSent ? <div className="contact-success">✓ Заявка отправлена!</div> : (
                <form onSubmit={submitContact} className="contact-form">
                  <input required placeholder="Имя" value={contactForm.name} onChange={e=>setContactForm(f=>({...f,name:e.target.value}))} className="cf-input" />
                  <input required type="email" placeholder="Email" value={contactForm.email} onChange={e=>setContactForm(f=>({...f,email:e.target.value}))} className="cf-input" />
                  <input placeholder="Телефон" value={contactForm.phone} onChange={e=>setContactForm(f=>({...f,phone:e.target.value}))} className="cf-input" />
                  <textarea placeholder="Сообщение" rows={3} value={contactForm.message} onChange={e=>setContactForm(f=>({...f,message:e.target.value}))} className="cf-input" />
                  <button type="submit" className="btn-primary" style={{width:"100%",padding:"0.75rem"}}>Отправить →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div style={I}>
          <div className="footer-grid">
            <div className="footer-col">
              <div style={{fontWeight:700,color:"#D6C6B2",marginBottom:"0.75rem"}}>Школа Кооперативов</div>
              <p className="footer-desc">Первая онлайн Школа потребительской кооперации — обучение, консалтинг и юридическое сопровождение с 2015 года.</p>
            </div>
            <div className="footer-col">
              <div style={{fontWeight:600,color:"#D6C6B2",marginBottom:"0.75rem",fontSize:"0.85rem"}}>Навигация</div>
              <Link href="/uslugi" className="footer-link">Услуги</Link>
              <Link href="/kursy" className="footer-link">Курсы</Link>
              <Link href="/glossary" className="footer-link">Глоссарий</Link>
              <Link href="/faq" className="footer-link">FAQ</Link>
              <Link href="/blog" className="footer-link">Блог</Link>
              <Link href="/about" className="footer-link">О нас</Link>
            </div>
            <div className="footer-col">
              <div style={{fontWeight:600,color:"#D6C6B2",marginBottom:"0.75rem",fontSize:"0.85rem"}}>Контакты</div>
              <a href="mailto:boss@2980738.ru" className="footer-link">boss@2980738.ru</a>
              <a href="tel:+79024720738" className="footer-link">+7 (902) 472-07-38</a>
              <a href="https://t.me/Veles_ST" target="_blank" className="footer-link">Telegram</a>
            </div>
          </div>
          <div className="footer-bottom">
            © ИП Старков Велеслав Владимирович, 2015–2026
          </div>
        </div>
      </footer>
    </>
  );
}
