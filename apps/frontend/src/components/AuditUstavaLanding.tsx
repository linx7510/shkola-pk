"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ExpressAuditForm from "@/components/ExpressAuditForm"
import Breadcrumbs from "@/components/Breadcrumbs";

// ============================================================
// SEO 2026-2027: Key Takeaways (для AI Overviews / Яндекс Нейро)
// ============================================================
const keyTakeaways = [
  "Аудит устава потребительского кооператива — это проверка всех положений Устава на соответствие Закону № 3085-1, ГК РФ и НК РФ.",
  "Главная цель аудита — выявить ошибки, которые могут привести к ликвидации ПК через суд или доначислениям от ФНС.",
  "Срок аудита: 5–7 рабочих дней. Стоимость: от 15 000 ₽.",
  "В результате аудита вы получаете отчёт с перечнем ошибок, рекомендациями по исправлению и готовыми формулировками для новой редакции Устава.",
  "120+ проверенных уставов с 2015 года. Ни один кооператив с нашим аудитом не получил предписания от ФНС.",
];

// ============================================================
// FAQ (expanded for SEO + AI)
// ============================================================
interface FAQItem { q: string; a: string; }

const faqItems: FAQItem[] = [
  { q: "Что такое аудит устава потребительского кооператива?", a: "Аудит устава ПК — это юридическая проверка всех положений Устава на соответствие Закону № 3085-1, ГК РФ, НК РФ и иным нормативным актам. Цель — выявить ошибки, неточности и устаревшие нормы, которые могут привести к ликвидации кооператива, доначислениям или спорам с ФНС." },
  { q: "Зачем нужен аудит устава?", a: "Аудит нужен, если: 1) Устав составлялся по шаблону из интернета; 2) Кооператив работает более 2 лет без проверки документов; 3) ФНС прислала запрос или предписание; 5) Планируется привлечение новых пайщиков или заёмных средств; 6) Вы не уверены в юридической чистоте документов." },
  { q: "Сколько стоит аудит устава ПК?", a: "Базовый аудит — 15 000 ₽ (проверка по 30 критериям, отчёт с рекомендациями). Расширенный аудит — 25 000 ₽ (проверка по 60 критериям + готовые формулировки для новой редакции Устава). Сопровождение перерегистрации — +15 000 ₽." },
  { q: "Сколько времени занимает аудит устава?", a: "Базовый аудит — 5 рабочих дней. Расширенный аудит — 7 рабочих дней. Сопровождение перерегистрации в ФНС — дополнительно 3–5 рабочих дней. Срочный аудит (2 дня) — +50% к стоимости." },
  { q: "Какие ошибки чаще всего находят в Уставе ПК?", a: "Топ-7 ошибок: 1) Неправильное описание кооперативных выплат; 2) Отсутствие регулирования заёмной деятельности; 3) Устаревшие нормы (до 2022 года); 4) Нет описания новации паевого взноса; 5) Неправильный порядок выхода пайщика; 6) Отсутствие неделимого фонда; 7) Несоответствие Положениям." },
  { q: "Что входит в отчёт по аудиту?", a: "Отчёт включает: 1) Перечень выявленных ошибок с указанием норм закона; 2) Уровень риска каждой ошибки (критический/высокий/средний/низкий); 3) Рекомендации по исправлению; 4) Готовые формулировки для новой редакции Устава (в расширенном аудите); 5) Чек-лист для самопроверки в будущем." },
  { q: "Можно ли исправить Устав самостоятельно?", a: "Можно, но рискованно. Без юридической специализации в кооперативном праве легко внести новые ошибки. Изменения в Устав регистрируются в ФНС (3–5 рабочих дней, госпошлина 800 ₽ при бумажной подаче, 0 ₽ при электронной). Лучше доверить перерегистрацию специалистам." },
  { q: "Что будет, если не исправить ошибки в Уставе?", a: "Последствия зависят от типа ошибки: критические — ликвидация ПК через суд (ст. 61 ГК РФ); высокие — доначисления от ФНС, споры с пайщиками; средние — предписания от ФНС; низкие — риск при проверке. Рекомендуем исправлять все ошибки, особенно критические и высокие." },
  { q: "Чем аудит устава отличается от аудита бухгалтерии?", a: "Аудит устава — это юридическая проверка документов на соответствие закону. Аудит бухгалтерии — проверка финансовой отчётности. Это разные услуги. Мы проводим именно юридический аудит устава и Положений кооператива." },
  { q: "Даёте ли вы гарантию после аудита?", a: "Мы гарантируем: 1) Полноту проверки по всем критериям; 2) Соответствие рекомендаций Закону № 3085-1; 3) Бесплатные консультации по исправлению ошибок в течение 1 месяца. Если после нашего аудита и внесённых изменений ФНС найдёт ошибку — повторный аудит бесплатно." },
  { q: "Можно ли провести аудит удалённо?", a: "Да, мы работаем по всей России. Вы присылаете скан Устава и Положений, мы проводим аудит и присылаем отчёт в электронном виде. Консультации — по видеосвязи. Личного присутствия не требуется." },
  { q: "Как часто нужно проверять Устав?", a: "Рекомендуем проводить аудит: 1) При создании кооператива (если Устав составлял не специалист); 2) Каждые 2–3 года (законы меняются); 3) Перед привлечением новых пайщиков; 4) При получении запроса от ФНС; 5) Перед получением займов или инвестиций." },
];

// ============================================================
// Real case studies (E-E-A-T — реальный опыт)
// ============================================================
const caseStudies = [
  {
    industry: "Сельское хозяйство",
    title: "Аудит устава 5-летнего кооператива",
    result: "Найдено 8 критических ошибок, 12 высоких",
    description: "Кооператив работал 5 лет по шаблонному Уставу. Нашли 8 критических ошибок (неправильные кооперативные выплаты, отсутствие неделимого фонда). После перерегистрации — 0 предписаний от ФНС за 2 года.",
    timeline: "7 дней",
    documents: "Отчёт 28 страниц + новая редакция Устава"
  },
  {
    industry: "Строительство",
    title: "Аудит перед привлечением займов",
    result: "Устранены 5 ошибок в регулировании заёмной деятельности",
    description: "Кооператив планировал привлечь заёмные средства от пайщиков. Аудит выявил 5 ошибок в Положении о заёмной деятельности. После исправления — успешное привлечение 3 млн ₽ без рисков.",
    timeline: "5 дней",
    documents: "Отчёт 18 страниц + исправленное Положение"
  },
  {
    industry: "Услуги",
    title: "Аудит после запроса ФНС",
    result: "Исправлены 3 критические ошибки, избежали ликвидации",
    description: "ФНС прислала запрос о несоответствии Устава Закону 3085-1. Срочный аудит выявил 3 критические ошибки. После перерегистрации — запрос ФНС снят, кооператив продолжает работу.",
    timeline: "2 дня (срочный)",
    documents: "Отчёт 22 страницы + новая редакция Устава"
  },
];

// ============================================================
// People Also Ask (PAA) — для AI Overviews
// ============================================================
const paaQuestions = [
  { q: "Сколько стоит аудит устава кооператива?", a: "От 15 000 ₽ (базовый аудит по 30 критериям) до 25 000 ₽ (расширенный по 60 критериям с готовыми формулировками). Срочный аудит (2 дня) — +50%." },
  { q: "Сколько времени занимает аудит устава?", a: "Базовый — 5 рабочих дней, расширенный — 7 рабочих дней, срочный — 2 дня. Сопровождение перерегистрации в ФНС — дополнительно 3–5 дней." },
  { q: "Что входит в аудит устава кооператива?", a: "Проверка Устава и Положений на соответствие Закону № 3085-1, ГК РФ, НК РФ. Отчёт с перечнем ошибок, уровнем риска, рекомендациями и готовыми формулировками." },
  { q: "Зачем нужен аудит устава кооператива?", a: "Чтобы выявить ошибки, которые могут привести к ликвидации ПК, доначислениям от ФНС или спорам с пайщиками. Особенно важен, если Устав составлялся по шаблону или кооператив работает более 2 лет без проверки." },
  { q: "Можно ли исправить Устав самостоятельно?", a: "Можно, но рискованно. Без специализации в кооперативном праве легко внести новые ошибки. Лучше доверить перерегистрацию специалистам — стоимость ошибки значительно выше стоимости аудита." },
];

// ============================================================
// Benefits
// ============================================================
const benefits = [
  { icon: "🔍", title: "60+ критериев", desc: "Полный аудит 60+ критериев: Закон 3085-1, ГК РФ, НК РФ, Положения ЦБ." },
  { icon: "⚠️", title: "Риски выявлены", desc: "Каждая ошибка с уровнем риска: критический, высокий, средний, низкий." },
  { icon: "📝", title: "Готовые формулировки", desc: "Не просто ошибки, а готовые формулировки для новой редакции Устава." },
  { icon: "🛡️", title: "Защита от ФНС", desc: "После аудита — 0 предписаний от ФНС. Гарантия 1 год." },
  { icon: "📊", title: "Отчёт 20+ стр.", desc: "Детальный отчёт с пояснениями, ссылками на закон, чек-листом." },
  { icon: "✅", title: "120+ аудитов", desc: "С 2015 года. Ни один кооператив не ликвидирован после нашего аудита." },
];

// ============================================================
// Audit criteria categories
// ============================================================
const auditCategories = [
  { name: "Соответствие Закону № 3085-1", count: 15, examples: "Цели и предмет деятельности, членство, паевые взносы, кооперативные выплаты, органы управления" },
  { name: "Соответствие ГК РФ", count: 10, examples: "Правоспособность, ответственность, реорганизация, ликвидация" },
  { name: "Налоговое соответствие", count: 8, examples: "НДС (ст. 149), налог на прибыль (ст. 251), НДФЛ (ст. 217)" },
  { name: "Заёмная деятельность", count: 7, examples: "Регулирование займов от пайщиков, проценты, обеспечение" },
  { name: "Защита активов", count: 6, examples: "Неделимый фонд, ответственность пайщиков, порядок выхода" },
  { name: "Положения кооператива", count: 14, examples: "13 Положений: о членстве, о паевых взносах, о выплатах, о фондах" },
];

// ============================================================
// Process steps
// ============================================================
const steps = [
  { num: "1", title: "Запрос", days: "день 1", desc: "Вы присылаете скан Устава и Положений. Мы подтверждаем получение и стоимость." },
  { num: "2", title: "Анализ", days: "день 2–5", desc: "Полный аудит 60+ критериев. Анализ соответствия Закону 3085-1, ГК РФ, НК РФ." },
  { num: "3", title: "Отчёт", days: "день 5–7", desc: "Готовим детальный отчёт: ошибки, риски, рекомендации, готовые формулировки." },
  { num: "4", title: "Консультация", days: "день 7", desc: "Видеоконсультация (60 мин): разбор ошибок, ответы на вопросы, план действий." },
  { num: "5", title: "Перерегистрация", days: "+3–5 дней", desc: "По желанию: подготовка новой редакции Устава и подача в ФНС электронно." },
];

// ============================================================
// SEO long-form text
// ============================================================
const seoText = `<h2 id="chto-takoe">Что такое аудит устава потребительского кооператива — определение</h2>
<p><strong>Аудит устава потребительского кооператива</strong> — это юридическая проверка всех положений Устава и Положений кооператива на соответствие Закону РФ № 3085-1, Гражданскому кодексу РФ, Налоговому кодексу РФ и иным нормативным актам. Цель аудита — выявить ошибки, неточности и устаревшие нормы, которые могут привести к ликвидации кооператива, доначислениям от ФНС или спорам с пайщиками.</p>

<h2 id="zachem">Зачем нужен аудит устава ПК</h2>
<p>Аудит устава необходим в следующих случаях:</p>
<ul>
<li>Устав составлялся по шаблону из интернета (не специалистом)</li>
<li>Кооператив работает более 2 лет без проверки документов</li>
<li>ФНС прислала запрос или предписание</li>
<li>Планируется привлечение новых пайщиков или заёмных средств</li>
<li>Вы не уверены в юридической чистоте документов</li>
<li>Произошли изменения в законодательстве (законы меняются ежегодно)</li>
</ul>
<p>Регулярный аудит (раз в 2–3 года) — это профилактика, которая обходится значительно дешевле, чем ликвидация или доначисления.</p>

<h2 id="kriterii">Критерии аудита — 60+ проверок</h2>
<p>Мы проверяем Устав и Положения по 60+ критериям, сгруппированным в 6 категорий:</p>
<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
<thead><tr style="background:rgba(184,149,106,0.1);"><th style="padding:0.75rem;text-align:left;border:1px solid rgba(184,149,106,0.2);">Категория</th><th style="padding:0.75rem;text-align:center;border:1px solid rgba(184,149,106,0.2);">Проверок</th><th style="padding:0.75rem;text-align:left;border:1px solid rgba(184,149,106,0.2);">Примеры</th></tr></thead>
<tbody>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Закон № 3085-1</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);color:#B8956A;font-weight:600;">15</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Цели, членство, паи, выплаты, органы</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">ГК РФ</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);color:#B8956A;font-weight:600;">10</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Правоспособность, ответственность</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Налоги (НК РФ)</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);color:#B8956A;font-weight:600;">8</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">НДС, прибыль, НДФЛ</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Заёмная деятельность</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);color:#B8956A;font-weight:600;">7</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Займы, проценты, обеспечение</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Защита активов</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);color:#B8956A;font-weight:600;">6</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Неделимый фонд, ответственность</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">13 Положений</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);color:#B8956A;font-weight:600;">14</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">О членстве, о паях, о выплатах</td></tr>
<tr style="background:rgba(184,149,106,0.05);font-weight:600;"><td colspan="1" style="padding:0.6rem 0.75rem;border:1px solid rgba(184,149,106,0.2);">Итого</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(184,149,106,0.2);color:#B8956A;">60+</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(184,149,106,0.2);">Полная проверка</td></tr>
</tbody>
</table>

<h2 id="riski">Риски ошибок в Уставе — и как их избежать</h2>
<p>Ошибка в Уставе — это не формальность. Каждая ошибка имеет последствия:</p>
<ul>
<li><strong>Критические ошибки</strong> — ликвидация ПК через суд (ст. 61 ГК РФ). Пример: неправильное описание кооперативных выплат, отсутствие неделимого фонда.</li>
<li><strong>Высокие ошибки</strong> — доначисления от ФНС, споры с пайщиками. Пример: непропорциональные выплаты, нерыночные сделки.</li>
<li><strong>Средние ошибки</strong> — предписания от ФНС на исправление. Пример: устаревшие нормы, несоответствие Положениям.</li>
<li><strong>Низкие ошибки</strong> — риск при проверке. Пример: мелкие неточности в формулировках.</li>
</ul>
<p>Аудит выявляет все 4 типа ошибок и даёт рекомендации по исправлению.</p>

<h2 id="stoimost">Сколько стоит аудит устава ПК</h2>
<p>Стоимость аудита зависит от глубины проверки:</p>
<ul>
<li><strong>Базовый аудит — 15 000 ₽</strong> (5 дней, 30 критериев, отчёт с рекомендациями)</li>
<li><strong>Расширенный аудит — 25 000 ₽</strong> (7 дней, 60+ критериев, готовые формулировки для новой редакции)</li>
<li><strong>Сопровождение перерегистрации — +15 000 ₽</strong> (подготовка документов, подача в ФНС)</li>
<li><strong>Срочный аудит (2 дня) — +50%</strong> к стоимости</li>
</ul>
<p>Для сравнения: стоимость ликвидации кооператива через суд — от 300 000 ₽. Стоимость доначислений ФНС — от 500 000 ₽. Аудит за 15 000 ₽ — это страховка от потерь в 10–20 раз больше.</p>
`;

// ============================================================
// Related articles (internal linking — Entity SEO)
// ============================================================
const relatedArticles = [
  { title: "Устав кооператива: как составить, образец 2026", href: "/blog/ustav-potrebitelskogo-kooperativa-kak-sostavit" },
  { title: "Кооператив под ключ — регистрация ПК за 25 дней", href: "/uslugi-dlya-potrebitelskih-kooperativov/kooperativ-pod-klyuch" },
  { title: "Субсидиарная ответственность пайщика: мифы и реальность", href: "/blog/subsidiarnaya-otvetstvennost-payschika-potrebitelskogo-kooperativa" },
  { title: "Как работает потребительский кооператив в 2026", href: "/blog/kak-rabotaet-potrebitelskiy-kooperativ-2026" },
  { title: "11 видов потребительских кооперативов в России", href: "/blog/11-vidov-potrebitelskih-kooperativov-v-rossii" },
  { title: "20 главных терминов кооперации", href: "/blog/20-glavnyh-terminov-kooperatsii" },
];

export default function AuditUstavaLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openPaa, setOpenPaa] = useState<number | null>(null);

  // ============================================================
  // SEO 2026: Inject Service + FAQ schema (JSON-LD)
  // ============================================================
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": "Аудит устава потребительского кооператива",
          "description": "Юридическая проверка Устава и Положений ПК по 60+ критериям. Отчёт с ошибками, рисками и готовыми формулировками. От 15 000 ₽, 5–7 дней.",
          "provider": {
            "@type": "Organization",
            "name": "Школа ПК — Велеслав Старков",
            "url": "https://2980738.ru",
            "telephone": "+79024720738",
            "email": "boss@2980738.ru"
          },
          "areaServed": { "@type": "Country", "name": "Россия" },
          "offers": [
            {
              "@type": "Offer",
              "name": "Базовый аудит",
              "price": "15000",
              "priceCurrency": "RUB",
              "description": "Рекомендованные фразы, 5 дней, отчёт с рекомендациями"
            },
            {
              "@type": "Offer",
              "name": "Расширенный аудит",
              "price": "25000",
              "priceCurrency": "RUB",
              "description": "Аудит + новый Устав, 7 дней, готовые формулировки"
            }
          ],
          "url": "https://2980738.ru/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa"
        },
        {
          "@type": "FAQPage",
          "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
          }))
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://2980738.ru/" },
            { "@type": "ListItem", "position": 2, "name": "Услуги для ПК", "item": "https://2980738.ru/uslugi-dlya-potrebitelskih-kooperativov" },
            { "@type": "ListItem", "position": 3, "name": "Аудит устава ПК" }
          ]
        }
      ]
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main style={{ paddingTop: "0", minHeight: "60vh", background: "var(--color-bg-950, #0D0C0A)" }}>
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК", href: "/uslugi-dlya-potrebitelskih-kooperativov" },
        { label: "Аудит устава ПК" }
      ]} />

      {/* HERO */}
      <section style={{ padding: "3rem 1.5rem 2rem", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(184,149,106,0.15)", border: "1px solid rgba(184,149,106,0.3)", borderRadius: 100, fontSize: "1rem", color: "#B8956A", fontWeight: 600, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          🔍 Услуга · Юридический аудит
        </div>
        <h1 className="heading-sweep" data-text="Аудит устава ПК" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem", lineHeight: 1.2 }}>
          Аудит устава потребительского кооператива —<br /><span style={{ color: "#B8956A" }}>60+ проверок, 0 рисков</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "rgba(214,198,178,0.8)", maxWidth: 800, margin: "0 auto 1rem", lineHeight: 1.6 }}>
          Проверка Устава и Положений на соответствие Закону 3085-1, ГК РФ, НК РФ. Отчёт с ошибками, рисками и готовыми формулировками. 120+ аудитов с 2015 года.
        </p>
        <p style={{ fontSize: "1.05rem", color: "rgba(214,198,178,0.8)", marginBottom: "2rem" }}>
          Автор: <Link href="/about-us" style={{ color: "#B8956A", textDecoration: "none" }}>Велеслав Старков</Link>, 10 лет практики · Обновлено: июнь 2026
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="#cta" className="btn-primary" style={{ display: "inline-block", padding: "0.9rem 2rem", fontSize: "1rem", textDecoration: "none" }}>Заказать аудит</Link>
          <a href="#pricing" style={{ display: "inline-block", padding: "0.9rem 2rem", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", textDecoration: "none" }}>От 15 000 ₽</a>
        </div>
      </section>

      {/* KEY TAKEAWAYS */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ background: "rgba(184,149,106,0.05)", border: "1px solid rgba(184,149,106,0.2)", borderRadius: 14, padding: "2rem", display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 500px" }}>
            <h2 style={{ color: "#B8956A", fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📌 Ключевые выводы</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {keyTakeaways.map((item, i) => (
                <li key={i} style={{ padding: "0.6rem 0", borderBottom: i < keyTakeaways.length - 1 ? "1px solid rgba(214,198,178,0.08)" : "none", color: "rgba(214,198,178,0.9)", fontSize: "1.05rem", lineHeight: 1.5, display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "#B8956A", fontWeight: 700 }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "0 0 350px", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0128.webp" 
              alt="Юрист Школы ПК изучает Устав потребительского кооператива при проведении аудита" 
              width={350} 
              height={350}
              loading="eager"
              style={{ maxWidth: 350, width: "100%", height: "auto", borderRadius: 14, border: "1px solid rgba(184,149,106,0.2)" }}
            />
          </div>
        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      <section style={{ padding: "1.5rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <nav style={{ background: "rgba(214,198,178,0.03)", borderRadius: 12, padding: "1.25rem 1.5rem", border: "1px solid rgba(214,198,178,0.08)" }}>
          <p style={{ color: "#B8956A", fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Содержание</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.4rem" }}>
            <li><a href="#chto-takoe" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Что такое аудит устава</a></li>
            <li><a href="#zachem" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Зачем нужен аудит</a></li>
            <li><a href="#kriterii" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Критерии (60+ проверок)</a></li>
            <li><a href="#riski" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Риски ошибок</a></li>
            <li><a href="#stoimost" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Стоимость</a></li>
          </ul>
        </nav>
      </section>

      {/* EXPRESS AUDIT FORM — трипфайер */}
      <ExpressAuditForm />

      {/* BENEFITS */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 300px", display: "flex", justifyContent: "center", position: "relative", zIndex: 10 }}>
            <img
              src="/api/media/file/0129.webp"
              alt="Два специалиста Школы ПК проводят аудит Устава потребительского кооператива за рабочим столом"
              width={300}
              height={300}
              loading="lazy"
              style={{ maxWidth: 300, width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(214,198,178,0.1)", position: "relative", zIndex: 10 }}
            />
          </div>
          <div style={{ flex: "1 1 400px", position: "relative", zIndex: 1 }}>
            <h2 className="heading-sweep" data-text="Преимущества" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.5rem" }}>Преимущества аудита устава</h2>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.5 }}>Почему 120+ кооперативов прошли аудит у нас и ни один не получил предписания от ФНС</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 14, padding: "1.75rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{b.icon}</div>
              <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{b.title}</h3>
              <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.5 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT CATEGORIES */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Критерии" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Категории проверок — 60+ критериев</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
          {auditCategories.map((cat, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", borderRadius: 12, border: "1px solid rgba(214,198,178,0.08)", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ color: "#E7DCCF", fontSize: "1rem", fontWeight: 700 }}>{cat.name}</h3>
                <span style={{ padding: "0.2rem 0.6rem", background: "rgba(184,149,106,0.15)", borderRadius: 100, fontSize: "1rem", color: "#B8956A", fontWeight: 700 }}>{cat.count}</span>
              </div>
              <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.05rem", lineHeight: 1.5 }}>{cat.examples}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px", position: "relative", zIndex: 1 }}>
            <h2 className="heading-sweep" data-text="Как мы работаем" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.5rem" }}>Как мы работаем — 5 этапов</h2>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.5 }}>От запроса до отчёта с рекомендациями — 5–7 рабочих дней</p>
          </div>
          <div style={{ flex: "0 0 300px", display: "flex", justifyContent: "center", position: "relative", zIndex: 10 }}>
            <img
              src="/api/media/file/0130.webp"
              alt="Презентация результатов аудита Устава потребительского кооператива — специалист объясняет схему клиенту"
              width={300}
              height={302}
              loading="lazy"
              style={{ maxWidth: 300, width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(214,198,178,0.1)", position: "relative", zIndex: 10 }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative", padding: "1.75rem", background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.08)" }}>
              <div style={{ position: "absolute", top: -12, left: "1.75rem", width: 32, height: 32, borderRadius: "50%", background: "#B8956A", color: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem" }}>{s.num}</div>
              <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "1rem", color: "#B8956A", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.days}</span>
                <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", fontWeight: 700, margin: "0.3rem 0 0.5rem" }}>{s.title}</h3>
                <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CASE STUDIES */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Кейсы" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>Реальные кейсы — 120+ аудитов</h2>
        <p style={{ textAlign: "center", color: "rgba(214,198,178,0.75)", fontSize: "1.05rem", marginBottom: "2rem", maxWidth: 700, margin: "0 auto 2rem" }}>
          Каждый кейс — реальный кооператив, прошедший наш аудит. Данные анонимизированы, но результаты реальные.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {caseStudies.map((c, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.08)", padding: "1.75rem" }}>
              <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", background: "rgba(184,149,106,0.15)", borderRadius: 100, fontSize: "1rem", color: "#B8956A", fontWeight: 600, marginBottom: "0.75rem" }}>{c.industry}</span>
              <h3 style={{ color: "#E7DCCF", fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>{c.title}</h3>
              <p style={{ color: "#B8956A", fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>{c.result}</p>
              <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>{c.description}</p>
              <div style={{ display: "flex", gap: "1rem", fontSize: "1rem", color: "rgba(214,198,178,0.8)", borderTop: "1px solid rgba(214,198,178,0.08)", paddingTop: "0.75rem" }}>
                <span>⏱ {c.timeline}</span>
                <span>📄 {c.documents}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Тарифы" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2.5rem", fontWeight: 700 }}>Тарифы аудита</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "2rem", background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.1)" }}>
            <h3 style={{ color: "#E7DCCF", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Базовый</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#D6C6B2", marginBottom: "0.25rem" }}>15 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>Рекомендованные фразы в Устав · 5 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 2 }}>
              <li>✓ Рекомендованные фразы в Устав</li><li>✓ Отчёт с ошибками и рисками</li><li>✓ Рекомендации по исправлению</li><li>✓ Email-консультация</li>
            </ul>
          </div>
          <div style={{ padding: "2rem", background: "rgba(184,149,106,0.08)", borderRadius: 14, border: "2px solid rgba(184,149,106,0.3)", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20, padding: "0.25rem 0.75rem", background: "#B8956A", color: "#0D0C0A", borderRadius: 100, fontSize: "1rem", fontWeight: 700 }}>РЕКОМЕНДУЕМ</div>
            <h3 style={{ color: "#B8956A", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Расширенный</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#E7DCCF", marginBottom: "0.25rem" }}>25 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>Аудит + новый образец Устава · 7 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 2 }}>
              <li>✓ Полный аудит 60+ критериев</li><li>✓ Отчёт с ошибками и рисками</li><li>✓ Новый образец Устава под ваш ПК</li><li>✓ Видеоконсультация (60 мин)</li><li>✓ Чек-лист для самопроверки</li><li>✓ 1 месяц бесплатных консультаций</li>
            </ul>
          </div>
          <div style={{ padding: "2rem", background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.1)" }}>
            <h3 style={{ color: "#E7DCCF", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>+ Перерегистрация</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#D6C6B2", marginBottom: "0.25rem" }}>+15 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>Подача в ФНС · 3–5 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 2 }}>
              <li>✓ Подготовка новой редакции Устава</li><li>✓ Протокол Общего собрания</li><li>✓ Заявление Р13001</li><li>✓ Подача в ФНС электронно</li><li>✓ Госпошлина — 0 ₽</li>
            </ul>
          </div>
        </div>
        <p style={{ textAlign: "center", color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginTop: "1.5rem" }}>Для сравнения: ликвидация ПК через суд — от 300 000 ₽. Доначисления ФНС — от 500 000 ₽. Аудит за 15 000 ₽ — страховка от потерь в 10–20 раз больше.</p>
      </section>

      {/* PEOPLE ALSO ASK */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Люди также ищут" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Люди также ищут</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {paaQuestions.map((item, i) => (
            <div key={i} style={{ background: "rgba(184,149,106,0.03)", borderRadius: 10, border: "1px solid rgba(184,149,106,0.12)", overflow: "hidden" }}>
              <button onClick={() => setOpenPaa(openPaa === i ? null : i)} style={{ width: "100%", padding: "1rem 1.25rem", background: "transparent", border: "none", color: "#E7DCCF", fontSize: "1.05rem", fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.q}<span style={{ color: "#B8956A", fontSize: "1.2rem", transition: "transform 0.2s", transform: openPaa === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openPaa === i && <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.75)", fontSize: "1rem", lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* SEO TEXT */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <div className="article-content" style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.05rem" }} dangerouslySetInnerHTML={{ __html: seoText }} />
      </section>

      {/* FAQ */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="FAQ" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Частые вопросы ({faqItems.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqItems.map((item, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", borderRadius: 10, border: "1px solid rgba(214,198,178,0.08)", overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "1rem 1.25rem", background: "transparent", border: "none", color: "#E7DCCF", fontSize: "1.05rem", fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.q}<span style={{ color: "#B8956A", fontSize: "1.2rem", transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* RELATED ARTICLES */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Похожие материалы" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Похожие материалы</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {relatedArticles.map((article, i) => (
            <Link key={i} href={article.href} style={{ display: "block", padding: "1.25rem", background: "rgba(214,198,178,0.03)", borderRadius: 10, border: "1px solid rgba(214,198,178,0.08)", color: "#D6C6B2", textDecoration: "none", fontSize: "1rem", lineHeight: 1.4 }}>
              📄 {article.title}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{ padding: "2rem 1.5rem 5rem", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ padding: "2.5rem 2rem", background: "rgba(184,149,106,0.08)", borderRadius: 16, border: "1px solid rgba(184,149,106,0.2)" }}>
          <h2 className="heading-sweep" data-text="Заказать аудит" style={{ color: "#E7DCCF", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Заказать аудит устава</h2>
          <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", marginBottom: "1.5rem" }}>Пришлите скан Устава — проведём бесплатную предварительную оценку и назовём точную стоимость.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+79024720738" className="btn-primary" style={{ display: "inline-block", padding: "0.85rem 2rem", fontSize: "1rem", textDecoration: "none" }}>📞 +7 (902) 472-07-38</a>
            <a href="https://t.me/Veles_ST" target="_blank" rel="noopener" style={{ display: "inline-block", padding: "0.85rem 2rem", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", textDecoration: "none" }}>💬 Telegram @Veles_ST</a>
          </div>
          {/* SEO 2026: People image in CTA — emotional connection */}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0131.webp" 
              alt="Передача аудиторского заключения клиенту — подписание результатов аудита Устава потребительского кооператива" 
              width={350} 
              height={353}
              loading="lazy"
              style={{ maxWidth: 350, width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(184,149,106,0.15)" }}
            />
          </div>
          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(214,198,178,0.1)", display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", fontSize: "1rem", color: "rgba(214,198,178,0.8)" }}>
            <span>✅ 120+ аудитов</span>
            <span>✅ 10 лет практики</span>
            <span>✅ 0 предписаний ФНС</span>
            <span>✅ Закон РФ № 3085-1</span>
          </div>
          <p style={{ color: "rgba(214,198,178,0.65)", fontSize: "1rem", marginTop: "1.5rem" }}>Велеслав Старков · 120+ аудитов с 2015 года · Закон РФ № 3085-1</p>
        </div>
      </section>
    </main>
  );
}
