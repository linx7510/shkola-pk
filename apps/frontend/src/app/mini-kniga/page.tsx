import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs, { breadcrumbJsonLd } from "@/components/Breadcrumbs";

export const revalidate = 3600; // ISR: раз в час

const PAGE_URL = "https://велеслав.рус/mini-kniga";
const PAGE_TITLE = "Мини-книга «10 причин открыть ПК» — PDF бесплатно | Школа ПК";
const PAGE_DESCRIPTION = "10 причин открыть потребительский кооператив по модели С500: обнуление НДС, оборотные средства без кредитов, кейсы с 2015 года. PDF бесплатно за подписку.";
const PAGE_IMAGE = "https://велеслав.рус/mini-kniga-cover-v2.webp";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  keywords: [
    "мини-книга потребительский кооператив",
    "книга 10 причин открыть ПК",
    "скачать книгу про потребительский кооператив бесплатно",
    "потребительский кооператив по модели С500 книга",
    "обнуление НДС через ПК книга",
    "аффилированные ООО и кооператив",
    "10 причин создать потребительский кооператив",
    "Школа Кооперативов Велеслав Старков книга",
    "книга про кооперацию для бизнеса PDF",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "велеслав.рус — Школа потребительской кооперации",
    locale: "ru_RU",
    type: "article",
    images: [{ url: PAGE_IMAGE, width: 700, height: 955, alt: "Обложка мини-книги «10 причин, почему бизнес открывает потребительский кооператив»" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [PAGE_IMAGE],
  },
};

const REASONS = [
  { n: 1, title: "Оцифровка клиентской базы через ПК", text: "Клиенты становятся пайщиками — база принадлежит вашему кооперативу, а не менеджерам, которые могут уйти к конкурентам." },
  { n: 2, title: "Оборотные средства без банковских процентов", text: "Паевые взносы пайщиков работают вместо кредита: беспроцентная оборотка, кейс мебельной фабрики — 15 млн ₽." },
  { n: 3, title: "Обнуление исходящего НДС в связке «производитель + ПК»", text: "Паевой взнос — не реализация (пп. 4 п. 3 ст. 39 НК РФ): наценки ПК нет, а бизнес сохраняет свою маржу — исходящий НДС обнуляется законно." },
  { n: 4, title: "Инструменты развития, недоступные обычному бизнесу", text: "Целевые потребительские программы, складчина на инфраструктуру, коллективные закупки." },
  { n: 5, title: "Снижение себестоимости в длинных цепочках", text: "Технологические цепочки замыкаются внутри кооперации — посредники выпадают вместе со своими наценками." },
  { n: 6, title: "Экономия на сертификации и стандартизации", text: "Сертификация «в складчину» силами кооператива — расходы делятся на всех пайщиков." },
  { n: 7, title: "Законная альтернатива отделу сбыта", text: "Пайщики сами — ваши клиенты и адвокаты продукта: сбыт встроен в членство." },
  { n: 8, title: "Снижение налоговой нагрузки — законное", text: "НДС, налог на прибыль, НДФЛ с возврата пая: каждая льгота — с точной статьёй НК РФ в книге." },
  { n: 9, title: "Лёгкость запуска и контроля", text: "Пайщики — не наёмные работники: мотивация совпадает, субсидиарные риски ограничены уставом." },
  { n: 10, title: "ПК на УСН: целевые поступления вне лимитов", text: "Паевые, членские и целевые взносы не доход НКО (ст. 251 НК РФ) и не съедают лимиты УСН." },
];

const BONUSES = [
  "Цифровой контур кооператива: сайт, личный кабинет пайщика, ИИ-ассистент",
  "Сквозной расчёт «пять лет жизни завода с ПК» — с цифрами по годам",
  "Дорожная карта первых 90 дней",
  "5 ошибок, которые дорого стоят",
  "FAQ: десять частых вопросов",
  "Таблица самопроверки: 7 утверждений книги",
  "Семь мифов о кооперативах — разбор",
  "Словарик для предпринимателя",
];

const FOUNDATIONS = [
  {
    icon: "🏛️",
    title: "Потребительский кооператив по модели С500",
    text: "Эталонный Устав редакции 27-7: трёхэлементный пай, возврат дополнительной части без выхода, новация обязательства по ст. 414 ГК РФ, кооператив живёт на членских взносах — без наценки.",
    href: "/blog/potrebitelskiy-kooperativ-kak-biznes",
    hrefLabel: "Разбор модели С500",
  },
  {
    icon: "📉",
    title: "Обнуление НДС через ПК",
    text: "Механика связки «производитель + ПК»: почему паевой взнос — не реализация (пп. 4 п. 3 ст. 39 НК РФ), где проходит граница законности и чему учит дело GOLDEN AXIS с доначислениями 7,3 млн ₽.",
    href: "/blog/obnulenie-nds-cherez-potrebitelskiy-kooperativ",
    hrefLabel: "Как обнуляется НДС",
  },
  {
    icon: "🏢",
    title: "Аффилированные ООО",
    text: "Как действующее ООО уживается с кооперативом в одной группе компаний: разделение функций, взаимозависимость и её границы, что переписать в договорах, чтобы ФНС не собрала всё в единый бизнес.",
    href: "/blog/nalogi-potrebitelskogo-kooperativa",
    hrefLabel: "Налоги связки ПК + ООО",
  },
];

const BENEFITS = [
  { icon: "🔢", title: "Механика, а не теория", text: "Каждая из десяти причин — с работой механизма, живыми цифрами и расчётом эффекта для реального бизнеса." },
  { icon: "📅", title: "Расчёт на 5 лет вперёд", text: "Сквозной расчёт «пять лет жизни завода с ПК»: виден весь путь — от первого паевого взноса до стабильной экономии." },
  { icon: "⚖️", title: "Ссылки на закон с точностью до статьи", text: "Ст. 39, 41, 146, 251 НК РФ, ст. 414 ГК РФ, Закон № 3085-1 — проверяйте каждую цифру по первоисточнику." },
  { icon: "🏭", title: "Реальные кейсы, а не гипотезы", text: "Завод газобетона — 895 000 ₽ экономии в год, торговая компания — 2,87 млн ₽, фермеры — +33% к цене реализации." },
  { icon: "☕", title: "Соседский язык", text: "Без академического сухаря: читается за вечер с карандашом — где узнали свой бизнес, ставьте галочку." },
  { icon: "✅", title: "План действий", text: "Дорожная карта первых 90 дней, чек-лист самопроверки и 5 ошибок — переход от чтения к практике." },
];

const FAQ = [
  {
    q: "Мини-книга действительно бесплатная?",
    a: "Да. Книга — подарок подписчикам рассылки Школы Кооперативов: оставьте email и подтвердите подписку — часть 1 придёт письмом сразу, часть 2 — следующими письмами. Рассылка выходит 1–2 раза в неделю, отписка одним кликом.",
  },
  {
    q: "Кто автор книги?",
    a: "Велеслав Старков — председатель правления потребительского кооператива, основатель Школы Кооперативов. С 2015 года собирает практику: 200+ успешных кейсов, более 100 уставов, десятки целевых программ. Книга написана по этой практике, соседским языком.",
  },
  {
    q: "Что за модель С500, на которой построена книга?",
    a: "С500 — модель устройства потребительского кооператива: кооператив не зарабатывает на пайщиках, а живёт на членских взносах; паевый взнос не капитализируется; главная выгода рождается в связке «производитель + ПК» — обнулением исходящего НДС. Эталон — Устав редакции 27-7.",
  },
  {
    q: "Чем книга отличается от статей блога?",
    a: "Статьи разбирают отдельные инструменты, книга — сводит всё в одну систему: десять причин от клиентской базы до УСН, сквозной расчёт на пять лет, дорожную карту запуска и чек-листы самопроверки. Это квинтессенция всех материалов Школы по инструментам ПК.",
  },
  {
    q: "Что такое «аффилированные ООО» в контексте книги?",
    a: "В модели С500 аффилированное ООО — это дочернее общество, на 100% принадлежащее потребительскому кооперативу: кооператив работает с пайщиками, «дочка» выполняет коммерческие функции. НК РФ даёт такой связке особые преференции: дивиденды, которые ООО перечисляет материнскому ПК, облагаются налогом на прибыль по ставке 0% при доле от 50% (пп. 1 п. 3 ст. 284 НК РФ), паевые взносы не облагаются НДС и НДФЛ (ст. 39, 41 НК РФ), а целевые поступления не включаются в доход (ст. 251 НК РФ). В книге показано, как выстроить эту структуру законно.",
  },
  {
    q: "В каком формате выходит книга и сколько её читать?",
    a: "Две части в PDF (в сумме около 50 страниц). Часть 1 — «Экономика»: пять причин фундамента. Часть 2 — «Рост и практика»: причины 6–10, сквозной расчёт, дорожная карта и приложения. Читается за один-два вечера.",
  },
];

export default function MiniKnigaPage() {
  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Бесплатно", href: "/besplatno" },
    { label: "Мини-книга «10 причин»" },
  ];

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "10 причин, почему бизнес открывает потребительский кооператив. Как связанные компании экономят легально: модель С500",
    author: {
      "@type": "Person",
      name: "Велеслав Старков",
      url: "https://велеслав.рус/about-us",
    },
    publisher: {
      "@type": "EducationalOrganization",
      name: "Школа потребительской кооперации — велеслав.рус",
      url: "https://велеслав.рус",
    },
    url: PAGE_URL,
    image: PAGE_IMAGE,
    numberOfPages: 48,
    inLanguage: "ru",
    bookFormat: "https://schema.org/EBook",
    isAccessibleForFree: true,
    datePublished: "2026-10",
    abstract: PAGE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      url: "https://велеслав.рус/besplatno#minibook-1",
    },
    about: "Потребительская кооперация, модель С500, обнуление НДС, налоговая оптимизация бизнеса",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, "https://велеслав.рус")) }} />
      <Header />
      <Breadcrumbs items={crumbs} />

      <main>
        {/* ═══ HERO ═══ */}
        <section style={{ padding: "1rem 1.5rem 3rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem" }}>
              БЕСПЛАТНЫЕ МАТЕРИАЛЫ · МИНИ-КНИГА ШКОЛЫ КООПЕРАТИВОВ
            </div>
            <h1
              className="heading-sweep"
              data-text="10 причин, почему бизнес открывает потребительский кооператив"
              style={{ fontSize: "clamp(1.6rem,3.6vw,2.5rem)", color: "#E7DCCF", fontWeight: 700, marginBottom: "1rem" }}
            >
              10 причин, почему бизнес открывает потребительский кооператив
            </h1>
            <p style={{ maxWidth: 800, margin: "0 auto 0.7rem", fontSize: "1.05rem", lineHeight: 1.75, color: "rgba(214,198,178,0.9)" }}>
              С 2015 года Школа Кооперативов собирает опыт и навыки: <strong style={{ color: "#E68863" }}>200+ успешных кейсов</strong>,{" "}
              <strong style={{ color: "#E68863" }}>более 100 уставов</strong>, десятки положений и целевых программ.
              Перед вами квинтессенция этой пользы — обзорная книга по всем инструментам потребительского кооператива,
              сжатая до десяти причин с механикой, цифрами и ссылками на Налоговый кодекс.
            </p>
            <p style={{ maxWidth: 760, margin: "0 auto 2rem", fontSize: "0.92rem", lineHeight: 1.7, color: "rgba(214,198,178,0.65)" }}>
              Автор — Велеслав Старков. Две части, ~50 страниц, соседским языком. Бесплатно — за подписку на рассылку.
            </p>
            <div style={{ display: "flex", gap: "0.9rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/besplatno#minibook-1"
                style={{
                  display: "inline-block",
                  padding: "0.95rem 1.9rem",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#C06030,#E68863)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                Скачать бесплатно за подписку
              </a>
              <Link
                href="#soderzhanie"
                style={{
                  display: "inline-block",
                  padding: "0.95rem 1.9rem",
                  borderRadius: 12,
                  border: "1px solid rgba(214,198,178,0.3)",
                  color: "#E7DCCF",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                Что внутри
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ О КНИГЕ ═══ */}
        <section style={{ padding: "1rem 1.5rem 3.5rem" }} aria-labelledby="about-h">
          <div
            style={{
              maxWidth: 940,
              margin: "0 auto",
              padding: "2rem 1.8rem",
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(192,96,48,0.14), rgba(214,198,178,0.03))",
              border: "1px solid rgba(230,136,99,0.28)",
              display: "flex",
              gap: "1.8rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <img
              src="/mini-kniga-cover-v2.webp"
              alt="Обложка мини-книги «10 причин, почему бизнес открывает потребительский кооператив» — модель С500"
              width={230}
              height={314}
              style={{ width: 230, height: "auto", borderRadius: 12, flex: "0 0 230px", boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}
            />
            <div style={{ flex: 1, minWidth: 280 }}>
              <h2 id="about-h" style={{ fontSize: "1.5rem", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.8rem" }}>
                Книга, которую писали десять лет практикой
              </h2>
              <p style={{ color: "rgba(214,198,178,0.88)", lineHeight: 1.75, fontSize: "0.96rem", margin: "0 0 0.8rem" }}>
                Двадцать лет назад автор считал, что для бизнеса существуют две формы — ИП и ООО. Потом построил первый
                потребительский кооператив, второй, десятый — и сегодня утверждает: ПК — самый недооценённый
                бизнес-инструмент в России. Закон № 3085-1, которому тридцать с лишним лет, позволяет делать то, о чём
                не рассказывают ни бизнес-школы, ни курсы «по оптимизации».
              </p>
              <p style={{ color: "rgba(214,198,178,0.88)", lineHeight: 1.75, fontSize: "0.96rem", margin: 0 }}>
                «10 причин» — не пересказ закона, а выжимка практики: каждая причина с механикой, цифрами и цитатами из
                Налогового кодекса. Читайте с карандашом: где узнаете свой бизнес — ставьте галочку.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1.1rem" }}>
                {["2 части · PDF", "~50 страниц", "Октябрь 2026", "Читается за вечер"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.32rem 0.75rem",
                      borderRadius: 999,
                      border: "1px solid rgba(214,198,178,0.25)",
                      color: "rgba(214,198,178,0.75)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ В ОСНОВЕ КНИГИ ═══ */}
        <section style={{ padding: "2.5rem 1.5rem", background: "rgba(214,198,178,0.02)" }} aria-labelledby="base-h">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="section-label">НА ЧЁМ ПОСТРОЕНА</div>
            <h2 id="base-h" className="section-title heading-sweep" data-text="В основе книги — три кита Школы ПК" style={{ fontSize: "clamp(1.35rem,2.8vw,1.9rem)", color: "#E7DCCF", margin: "0.6rem 0 0.8rem" }}>
              В основе книги — три кита Школы ПК
            </h2>
            <p style={{ maxWidth: 780, margin: "0 0 1.8rem", color: "rgba(214,198,178,0.8)", fontSize: "0.96rem", lineHeight: 1.7 }}>
              Книга написана по трём профильным материалам Школы — каждый раскрывает свой инструмент потребительской
              кооперации. Темы сквозные: они проходят через все десять причин.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1rem" }}>
              {FOUNDATIONS.map((f) => (
                <div
                  key={f.title}
                  style={{
                    padding: "1.4rem 1.5rem",
                    borderRadius: 14,
                    background: "rgba(214,198,178,0.04)",
                    border: "1px solid rgba(214,198,178,0.12)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: "1.7rem", marginBottom: "0.55rem" }} aria-hidden>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: "1.06rem", fontWeight: 700, color: "#E68863", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.89rem", lineHeight: 1.65, color: "rgba(214,198,178,0.8)", margin: "0 0 0.9rem", flex: 1 }}>{f.text}</p>
                  <Link href={f.href} style={{ color: "#E68863", fontWeight: 600, fontSize: "0.87rem", textDecoration: "none" }}>
                    {f.hrefLabel} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ СОДЕРЖАНИЕ: 10 ПРИЧИН ═══ */}
        <section style={{ padding: "3.5rem 1.5rem" }} aria-labelledby="soderzhanie">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="section-label">СОДЕРЖАНИЕ</div>
            <h2 id="soderzhanie" className="section-title heading-sweep" data-text="Десять причин — десять инструментов" style={{ fontSize: "clamp(1.35rem,2.8vw,1.9rem)", color: "#E7DCCF", margin: "0.6rem 0 1.8rem" }}>
              Десять причин — десять инструментов
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "0.9rem" }}>
              {REASONS.map((r) => (
                <div
                  key={r.n}
                  style={{
                    display: "flex",
                    gap: "0.95rem",
                    padding: "1.1rem 1.25rem",
                    borderRadius: 14,
                    background: "rgba(214,198,178,0.04)",
                    border: "1px solid rgba(214,198,178,0.1)",
                  }}
                >
                  <div
                    style={{
                      flex: "0 0 40px",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#C06030,#E68863)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden
                  >
                    {r.n}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#E7DCCF", marginBottom: "0.35rem" }}>{r.title}</h3>
                    <p style={{ fontSize: "0.86rem", lineHeight: 1.6, color: "rgba(214,198,178,0.78)", margin: 0 }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* бонус-главы */}
            <div
              style={{
                marginTop: "1.4rem",
                padding: "1.4rem 1.5rem",
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(192,96,48,0.12), rgba(214,198,178,0.03))",
                border: "1px solid rgba(230,136,99,0.22)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#E68863", margin: "0 0 0.8rem" }}>
                Плюс практический контур — 8 бонус-блоков
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.45rem" }}>
                {BONUSES.map((b) => (
                  <li key={b} style={{ fontSize: "0.88rem", color: "rgba(214,198,178,0.82)", display: "flex", gap: "0.5rem", lineHeight: 1.55 }}>
                    <span style={{ color: "#E68863" }} aria-hidden>▸</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ ВЫГОДЫ ═══ */}
        <section style={{ padding: "3.5rem 1.5rem", background: "rgba(214,198,178,0.02)" }} aria-labelledby="benefits-h">
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div className="section-label">ЧТО ВЫ ПОЛУЧИТЕ</div>
            <h2 id="benefits-h" className="section-title heading-sweep" data-text="Выгоды: что даёт эта книга" style={{ fontSize: "clamp(1.35rem,2.8vw,1.9rem)", color: "#E7DCCF", margin: "0.6rem 0 1.8rem" }}>
              Выгоды: что даёт эта книга
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1rem" }}>
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  style={{
                    padding: "1.35rem 1.45rem",
                    borderRadius: 14,
                    background: "linear-gradient(160deg, rgba(192,96,48,0.1), rgba(214,198,178,0.03))",
                    border: "1px solid rgba(230,136,99,0.18)",
                  }}
                >
                  <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }} aria-hidden>
                    {b.icon}
                  </div>
                  <h3 style={{ fontSize: "1.03rem", fontWeight: 700, color: "#E68863", marginBottom: "0.45rem" }}>{b.title}</h3>
                  <p style={{ fontSize: "0.89rem", lineHeight: 1.65, color: "rgba(214,198,178,0.8)", margin: 0 }}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ padding: "3.5rem 1.5rem" }} aria-labelledby="cta-h">
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: "2rem 1.8rem",
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(192,96,48,0.18), rgba(214,198,178,0.04))",
              border: "1px solid rgba(230,136,99,0.3)",
            }}
          >
            <h2 id="cta-h" style={{ fontSize: "1.5rem", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.9rem" }}>
              Как получить книгу — три шага
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", margin: "0 0 1.5rem" }}>
              {[
                { n: "1", t: "Подпишитесь на рассылку", d: "Оставьте email на странице «Бесплатно» — 1–2 письма в неделю, отписка одним кликом." },
                { n: "2", t: "Подтвердите подписку", d: "Письмо-подтверждение приходит мгновенно — это защита от спама по 152-ФЗ." },
                { n: "3", t: "Скачайте часть 1", d: "Ссылка на PDF — в письме. Часть 2 (причины 6–10 и расчёт) придёт следующими письмами." },
              ].map((s) => (
                <div
                  key={s.n}
                  style={{
                    padding: "1.15rem 1.25rem",
                    borderRadius: 12,
                    background: "rgba(214,198,178,0.05)",
                    border: "1px solid rgba(214,198,178,0.12)",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C06030,#E68863)", color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.6rem" }} aria-hidden>
                    {s.n}
                  </div>
                  <div style={{ fontWeight: 700, color: "#E7DCCF", fontSize: "0.95rem", marginBottom: "0.4rem" }}>{s.t}</div>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "rgba(214,198,178,0.78)", margin: 0 }}>{s.d}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
              <a
                href="/besplatno#minibook-1"
                style={{
                  display: "inline-block",
                  padding: "0.95rem 1.9rem",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#C06030,#E68863)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                Получить книгу за подписку
              </a>
              <Link
                href="/besplatno"
                style={{
                  display: "inline-block",
                  padding: "0.95rem 1.9rem",
                  borderRadius: 12,
                  border: "1px solid rgba(214,198,178,0.3)",
                  color: "#E7DCCF",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                Все бесплатные материалы
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section style={{ padding: "1rem 1.5rem 3.5rem" }} aria-labelledby="faq-h">
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div className="section-label">ВОПРОС — ОТВЕТ</div>
            <h2 id="faq-h" className="section-title heading-sweep" data-text="О мини-книге" style={{ fontSize: "clamp(1.35rem,2.8vw,1.9rem)", color: "#E7DCCF", margin: "0.6rem 0 1.8rem" }}>
              О мини-книге
            </h2>
            {FAQ.map((f) => (
              <details
                key={f.q}
                style={{
                  marginBottom: "0.8rem",
                  padding: "1.05rem 1.3rem",
                  borderRadius: 12,
                  background: "rgba(214,198,178,0.04)",
                  border: "1px solid rgba(214,198,178,0.1)",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 700, color: "#E7DCCF", fontSize: "1rem" }}>{f.q}</summary>
                <p style={{ margin: "0.7rem 0 0", color: "rgba(214,198,178,0.8)", fontSize: "0.92rem", lineHeight: 1.7 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ SEO-текст ═══ */}
        <section style={{ padding: "0 1.5rem 3.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.25rem", color: "#E7DCCF", marginBottom: "1rem" }}>
              Книга о потребительском кооперативе для бизнеса в 2026 году
            </h2>
            <p style={{ color: "rgba(214,198,178,0.75)", lineHeight: 1.8, fontSize: "0.93rem" }}>
              С 2015 года Школа Кооперативов помогает предпринимателям открывать и вести потребительские кооперативы:
              за это время собраны сотни кейсов из производственной, торговой и сервисной практики. Мини-книга «10
              причин, почему бизнес открывает потребительский кооператив» — квинтессенция этого опыта: обзор всех
              инструментов ПК, от <Link href="/blog/potrebitelskiy-kooperativ-kak-biznes">модели С500</Link> до{" "}
              <Link href="/blog/obnulenie-nds-cherez-potrebitelskiy-kooperativ">обнуления исходящего НДС</Link> и
              построения связки с <strong style={{ color: "rgba(214,198,178,0.85)" }}>аффилированными ООО</strong>.
              Если вы выбираете форму для нового дела — начните с{" "}
              <Link href="/blog/kak-otkryt-kooperativ-v-2026">как открыть кооператив в 2026 году</Link>, сверьте
              термины по <Link href="/glossary">глоссарию кооперации</Link>, задайте живой вопрос{" "}
              <Link href="/ai-konsultant">ИИ-консультанту по ПК</Link>, а для разбора вашей ситуации запишитесь на{" "}
              <Link href="/potrebitelskiy-kooperativ-konsultatsii">консультацию Велеслава Старкова</Link>. Книга
              бесплатна: <a href="/besplatno#minibook-1" style={{ color: "#E68863" }}>скачайте PDF за подписку</a> и
              проверьте каждую цифру по статьям Налогового кодекса — так делаем мы сами.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
