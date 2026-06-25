"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

interface FAQItem { q: string; a: string; }

const faqItems: FAQItem[] = [
  { q: "Сколько учредителей нужно для создания ПК?", a: "Минимум 5 человек — физических лиц с 16-летнего возраста или юридических лиц. Все 5 учредителей автоматически становятся пайщиками кооператива с момента государственной регистрации." },
  { q: "Сколько времени занимает создание кооператива?", a: "Разработка документов — 15–25 рабочих дней (зависит от тарифа). Регистрация в ФНС — 3 рабочих дня. Итого: 18–28 рабочих дней от заявки до ЕГРЮЛ." },
  { q: "Нужно ли лично идти в налоговую?", a: "Нет. Подача документов в ФНС осуществляется дистанционно: через личный кабинет налогоплательщика на госуслугах или через МФЦ по нотариальной доверенности. Госпошлина при электронной подаче — 0 рублей." },
  { q: "Какие налоги платит кооператив?", a: "ПК не платит: НДС (ст. 149 НК РФ), налог на прибыль, НДФЛ с паевых взносов. ПК платит: налог на имущество, земельный и транспортный налог, государственную пошлину при регистрации." },
  { q: "Что такое кооперативные выплаты?", a: "Кооперативные выплаты — это часть доходов кооператива, которая распределяется между пайщиками пропорционально их участию в хозяйственной деятельности. Это не дивиденды и не облагается НДФЛ." },
  { q: "Можно ли изменить Устав после регистрации?", a: "Да, изменения вносятся по решению Общего собрания (3/4 голосов) и регистрируются в ФНС. Но лучше сразу сделать Устав правильно. Наш Устав рассчитан на 10+ лет работы без изменений." },
  { q: "Чем отличается тариф «Базовый» от «Персонифицированного»?", a: "«Базовый» (90 000 ₽) — Устав по шаблону, 25 документов. «Персонифицированный» (125 000 ₽) — индивидуальный Устав, 31 документ, 2 месяца консалтинга, 2 ЦПП." },
  { q: "Можно ли работать удалённо?", a: "Да, мы работаем по всей России. Все документы передаются в электронном виде, консультации — по видеосвязи, подача в ФНС — электронно." },
  { q: "Что будет, если пайщик выйдет из кооператива?", a: "При добровольном выходе пайщик получает паевой взнос обратно в течение 3 месяцев. При исключении — в течение 12 месяцев. Кооперативные выплаты выплачиваются по итогам года." },
  { q: "Даёте ли вы гарантию?", a: "Мы гарантируем: 100% успешная регистрация в ФНС, соответствие документов Закону 3085-1, 2 месяца консалтинговой поддержки. Если ФНС откажет в регистрации по нашей вине — вернём деньги." },
];

const benefits = [
  { icon: "💰", title: "НДС — 0%", desc: "Ст. 149 НК РФ. Кооперативная цена = себестоимость. Налоговая база равна нулю." },
  { icon: "📊", title: "Налог на прибыль — 0%", desc: "Ст. 251 НК РФ. Паевые взносы и кооперативные выплаты не являются доходом." },
  { icon: "🧾", title: "НДФЛ с паёв — 0%", desc: "Ст. 22 Закона № 3085-1. Кооперативные выплаты — это не дивиденды." },
  { icon: "🛡️", title: "Защита активов", desc: "ПК не отвечает по долгам пайщиков. Неделимый фонд не подлежит разделу." },
  { icon: "📋", title: "31 документ", desc: "Устав, 13 Положений, 2 ЦПП, 10 образцов. Полный пакет за 25 дней." },
  { icon: "✅", title: "120+ ПК создано", desc: "Ни один не ликвидирован ФНС. Ни один не получил доначислений." },
];

const steps = [
  { num: "1", title: "Бриф", days: "день 1–3", desc: "Анализ бизнеса, целей, рисков. Определяем структуру, количество пайщиков, ЦПП." },
  { num: "2", title: "Устав", days: "день 4–8", desc: "Разработка под ваш бизнес. Учитывает отрасль, заёмную деятельность, защиту активов." },
  { num: "3", title: "Учредительные", days: "день 9–11", desc: "Протокол №1, заявление Р11001. Оформление для электронной подачи в ФНС." },
  { num: "4", title: "Положения + ЦПП", days: "день 12–20", desc: "13 Положений и 2 Целевые потребительские программы. Детализация всех аспектов." },
  { num: "5", title: "Образцы + ФНС", days: "день 21–25", desc: "10 образцов документов. Подача в ФНС электронно. Госпошлина — 0 ₽." },
];

const objections = [
  { q: "«Это слишком дорого — 125 000 ₽»", a: "Налоговая экономия кооператива с оборотом 8 млн ₽/мес — 2,4 млн ₽/мес. Пакет окупается за 1,5 дня." },
  { q: "«Мой юрист сделает дешевле»", a: "Юрист без специализации сделает Устав с ошибками. Одна ошибка — ликвидация через суд. Издержки — от 500 000 ₽." },
  { q: "«А вдруг ФНС откажет?»", a: "Мы подаём электронно. Отказ возможен только при ошибках в Р11001. 100% успешных регистраций." },
  { q: "«А вдруг кооператив закроют?»", a: "120+ кооперативов с 2015 года. Ни один не ликвидирован. Причина — правильные документы." },
  { q: "«Боюсь, что вы пропадёте»", a: "Велеслав Старков. Telegram @Veles_ST, YouTube, VK. Телефон +7 (902) 472-07-38. Я на виду." },
  { q: "«Можно сначала самому?»", a: "Можно. Но через год, когда ФНС придёт с проверкой — стоимость будет 300 000+ вместо 125 000 ₽." },
];

const seoText = `<h2>Кооператив под ключ — что это и зачем нужно</h2>
<p>«Кооператив под ключ» — это услуга, при которой вы получаете полностью готовый к регистрации потребительский кооператив: Устав, все Положения, Целевые потребительские программы, образцы документов и сопровождение до момента внесения записи в ЕГРЮЛ. Вам не нужно разбираться в юридических терминах, читать Закон № 3085-1 или искать шаблоны в интернете.</p>
<p>Зачем это нужно? Потребительский кооператив — это некоммерческая организация, которая освобождена от НДС (ст. 149 НК РФ), налога на прибыль (ст. 251 НК РФ) и НДФЛ с паевых взносов (ст. 217 НК РФ). Кооперативная цена равна себестоимости — налоговая база равна нулю. Но чтобы эта конструкция работала законно, каждый документ должен быть составлен безупречно.</p>

<h2>Как снизить налоги законно через потребительский кооператив</h2>
<p>Предприниматель платит: 20% НДС + 20% налог на прибыль + 13% НДФЛ с дивидендов + страховые взносы. Итого — до 50-60% дохода уходит в налоги. Потребительский кооператив меняет эту математику: НДС — 0%, налог на прибыль — 0%, НДФЛ с паёв — 0%, страховые взносы с кооперативных выплат — 0%.</p>
<p>Важно: это не «серая схема». Это прямые нормы Налогового кодекса, которые работают при условии, что кооператив ведёт реальную деятельность и правильно оформляет документы.</p>

<h2>Риски кооператива — и как их избежать</h2>
<p>Многие боятся, что ФНС признает кооператив «схемой». Этот страх обоснован — в 2018-2022 годах было несколько резонансных дел. Но во всех случаях проблема была в том, как кооператив был оформлен. 7 признаков «схемы», которых мы избегаем: кооператив для 1-2 связанных пайщиков, деятельность не по Уставу, непропорциональные выплаты, использование неделимого фонда на текущие расходы, нерыночные сделки, фиктивная регистрация, отсутствие протоколов.</p>
<p>Мы гарантируем: реальное сообщество пайщиков, деятельность строго по Уставу, прозрачные кооперативные выплаты, неделимый фонд, протоколы собраний. 120+ созданных кооперативов — ни одной проверки с доначислениями.</p>

<h2>Устав потребительского кооператива — почему шаблон опасен</h2>
<p>«Скачаю шаблон Устава из интернета, заполню — и готово». Это самая опасная ошибка. Шаблон не учитывает специфику вашего бизнеса, не регулирует кооперативные выплаты, не описывает новацию паевого взноса, не регулирует заёмную деятельность, содержит устаревшие нормы. Одна ошибка в Уставе — ликвидация через суд, субсидиарная ответственность, потеря активов. Наш Устав разработан за 10 лет практики и протестирован в реальных судебных делах.</p>

<h2>Защита активов через кооператив — как это работает</h2>
<p>В ООО учредители отвечают всем имуществом. При банкротстве — субсидиарная ответственность. В потребительском кооперативе: ПК не отвечает по долгам пайщиков, пайщики не отвечают по долгам ПК (ответственность ограничена паевым взносом), неделимый фонд не подлежит разделу. Это законная защита активов, основанная на ГК РФ и Законе № 3085-1.</p>

<h2>Какие документы нужны для кооператива — 31 документ</h2>
<p>Пакет включает: Устав ПК (1 документ), Протокол №1 + Заявление Р11001 (2 документа), 13 Положений (о членстве, о паевых взносах, о кооперативных выплатах, о заёмной деятельности, о фондах, о дисциплине, о Книге регламентов, и т.д.), 2 Целевые потребительские программы, 10 образцов (заявление о приёме, паевая книжка, протокол собрания, и т.д.), Книга регламентов, реестр пайщиков, памятка для бухгалтера.</p>

<h2>Сколько стоит кооператив под ключ</h2>
<p>Тариф «Базовый» (90 000 ₽) — 25 документов, Устав по шаблону, 15 рабочих дней. Тариф «Персонифицированный» (125 000 ₽) — 31 документ, индивидуальный Устав, 2 ЦПП, 2 месяца консалтинга, 25 рабочих дней. Для сравнения: налоговая экономия кооператива с оборотом 10 млн ₽/мес составляет около 2 млн ₽/мес. Стоимость пакета окупается за первую неделю работы кооператива.</p>
`;

export default function KooperativPodKlyuchLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openObjection, setOpenObjection] = useState<number | null>(null);

  return (
    <main style={{ paddingTop: "5rem", minHeight: "60vh", background: "var(--color-bg-950, #0D0C0A)" }}>
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Услуги для ПК", href: "/uslugi-dlya-potrebitelskih-kooperativov" },
        { label: "Кооператив под ключ" }
      ]} />

      {/* HERO */}
      <section style={{ padding: "4rem 1.5rem 3rem", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(184,149,106,0.15)", border: "1px solid rgba(184,149,106,0.3)", borderRadius: 100, fontSize: "0.8rem", color: "#B8956A", fontWeight: 600, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          🔑 Услуга · Регистрация ПК
        </div>
        <h1 className="heading-sweep" data-text="Кооператив под ключ" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem", lineHeight: 1.2 }}>
          Кооператив под ключ —<br /><span style={{ color: "#B8956A" }}>законно, без рисков, за 25 дней</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "rgba(214,198,178,0.8)", maxWidth: 700, margin: "0 auto 2rem", lineHeight: 1.6 }}>
          31 документ. Устав, 13 Положений, Целевые программы. 0% НДС, 0% налог на прибыль. 120+ ПК создано с 2015 года. Ни один не ликвидирован ФНС.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="#cta" className="btn-primary" style={{ display: "inline-block", padding: "0.9rem 2rem", fontSize: "1rem", textDecoration: "none" }}>Получить консультацию</Link>
          <a href="#pricing" style={{ display: "inline-block", padding: "0.9rem 2rem", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", textDecoration: "none" }}>От 90 000 ₽</a>
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Что вы получаете" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2.5rem", fontWeight: 700 }}>Что вы получаете</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 14, padding: "1.75rem", transition: "all 0.3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,149,106,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(214,198,178,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{b.icon}</div>
              <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{b.title}</h3>
              <p style={{ color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", lineHeight: 1.5 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN → SOLUTION */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Какие проблемы решает кооператив" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Какие проблемы решает кооператив</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { pain: "Налоги душат бизнес — до 50% дохода уходит в налоги", solution: "ПК освобождён от НДС, налога на прибыль, НДФЛ с паёв. Кооперативная цена = себестоимость = налоговая база 0 ₽" },
            { pain: "Боитесь, что ФНС признает «схемой»", solution: "7 признаков «схемы», которых мы избегаем. 120+ ПК — ни одной проверки с доначислениями" },
            { pain: "Не знаете, с чего начать — 30+ документов", solution: "5 этапов от заявки до ЕГРЮЛ. Вы получаете готовый пакет из 31 документа" },
            { pain: "Боитесь ошибок в Уставе", solution: "Устав разработан за 10 лет практики, протестирован в судах. Рассчитан на 10+ лет без изменений" },
            { pain: "Имущество под угрозой при банкротстве", solution: "ПК не отвечает по долгам пайщиков. Неделимый фонд не подлежит разделу. Активы защищены" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", padding: "1.5rem", background: "rgba(214,198,178,0.02)", borderRadius: 12, border: "1px solid rgba(214,198,178,0.06)" }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: "rgba(230,136,99,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>⚠️</div>
              <div>
                <p style={{ color: "rgba(230,136,99,0.9)", fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 600 }}>{item.pain}</p>
                <p style={{ color: "rgba(184,149,106,0.9)", fontSize: "0.95rem" }}>✓ {item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 1000, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Как мы работаем" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2.5rem", fontWeight: 700 }}>Как мы работаем — 5 этапов</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative", padding: "1.75rem", background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.08)" }}>
              <div style={{ position: "absolute", top: -12, left: "1.75rem", width: 32, height: 32, borderRadius: "50%", background: "#B8956A", color: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem" }}>{s.num}</div>
              <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#B8956A", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.days}</span>
                <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", fontWeight: 700, margin: "0.3rem 0 0.5rem" }}>{s.title}</h3>
                <p style={{ color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Кооператив или ООО" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Кооператив или ООО — что выгоднее</h2>
        <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(214,198,178,0.12)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead><tr>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", background: "rgba(184,149,106,0.1)", color: "#E7DCCF", borderBottom: "1px solid rgba(184,149,106,0.2)" }}>Параметр</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", background: "rgba(214,198,178,0.05)", color: "rgba(214,198,178,0.5)", borderBottom: "1px solid rgba(214,198,178,0.1)" }}>ООО</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", background: "rgba(184,149,106,0.1)", color: "#B8956A", borderBottom: "1px solid rgba(184,149,106,0.2)" }}>ПК</th>
            </tr></thead>
            <tbody>
              {[["НДС","20%","0%"],["Налог на прибыль","20%","0%"],["НДФЛ с распределения","13%","0%"],["Ответственность","Всем имуществом","Ограничена паём"],["Защита активов","Нет","Неделимый фонд"],["Срок создания","3–5 дней","25 дней"]].map((row,i)=>(
                <tr key={i}>
                  <td style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "rgba(214,198,178,0.9)" }}>{row[0]}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "rgba(214,198,178,0.5)" }}>{row[1]}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "#B8956A", fontWeight: 600 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "3rem 1.5rem", maxWidth: 1000, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Тарифы" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2.5rem", fontWeight: 700 }}>Тарифы</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "2rem", background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.1)" }}>
            <h3 style={{ color: "#E7DCCF", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Базовый</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#D6C6B2", marginBottom: "0.25rem" }}>90 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.5)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>25 документов · 15 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "0.9rem", lineHeight: 2 }}>
              <li>✓ Устав по шаблону (адаптированный)</li><li>✓ Протокол №1 + Р11001</li><li>✓ 13 Положений по шаблону</li><li>✓ Базовая ЦПП</li><li>✓ 10 образцов документов</li>
            </ul>
          </div>
          <div style={{ padding: "2rem", background: "rgba(184,149,106,0.08)", borderRadius: 14, border: "2px solid rgba(184,149,106,0.3)", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20, padding: "0.25rem 0.75rem", background: "#B8956A", color: "#0D0C0A", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>РЕКОМЕНДУЕМ</div>
            <h3 style={{ color: "#B8956A", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Персонифицированный</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#E7DCCF", marginBottom: "0.25rem" }}>125 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.5)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>31 документ · 25 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "0.9rem", lineHeight: 2 }}>
              <li>✓ Индивидуальный Устав (с нуля)</li><li>✓ Протокол №1 + Р11001</li><li>✓ 13 Положений (индивидуальных)</li><li>✓ 2 Целевые потребительские программы</li><li>✓ 10 образцов документов</li><li>✓ 2 месяца консалтинга</li><li>✓ Приоритетная обработка (5 дней)</li>
            </ul>
          </div>
        </div>
        <p style={{ textAlign: "center", color: "rgba(214,198,178,0.5)", fontSize: "0.85rem", marginTop: "1.5rem" }}>Для сравнения: налоговая экономия кооператива с оборотом 10 млн ₽/мес — около 2 млн ₽/мес. Стоимость пакета окупается за первую неделю.</p>
      </section>

      {/* OBJECTIONS */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Возражения" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Возражения и честные ответы</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {objections.map((item, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", borderRadius: 10, border: "1px solid rgba(214,198,178,0.08)", overflow: "hidden" }}>
              <button onClick={() => setOpenObjection(openObjection === i ? null : i)} style={{ width: "100%", padding: "1rem 1.25rem", background: "transparent", border: "none", color: "#E7DCCF", fontSize: "0.95rem", fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.q}<span style={{ color: "#B8956A", fontSize: "1.2rem", transition: "transform 0.2s", transform: openObjection === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openObjection === i && <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* SEO TEXT (микс лонгрида) */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
        <div className="article-content" style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.05rem" }} dangerouslySetInnerHTML={{ __html: seoText }} />
      </section>

      {/* FAQ */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="FAQ" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Частые вопросы</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqItems.map((item, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", borderRadius: 10, border: "1px solid rgba(214,198,178,0.08)", overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "1rem 1.25rem", background: "transparent", border: "none", color: "#E7DCCF", fontSize: "0.95rem", fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.q}<span style={{ color: "#B8956A", fontSize: "1.2rem", transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{ padding: "3rem 1.5rem 5rem", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{ padding: "2.5rem 2rem", background: "rgba(184,149,106,0.08)", borderRadius: 16, border: "1px solid rgba(184,149,106,0.2)" }}>
          <h2 className="heading-sweep" data-text="Готовы начать?" style={{ color: "#E7DCCF", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Готовы начать?</h2>
          <p style={{ color: "rgba(214,198,178,0.7)", fontSize: "1rem", marginBottom: "1.5rem" }}>Запишитесь на бесплатную консультацию — отвечу на все вопросы и помогу определить, подходит ли вам кооператив.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+79024720738" className="btn-primary" style={{ display: "inline-block", padding: "0.85rem 2rem", fontSize: "1rem", textDecoration: "none" }}>📞 +7 (902) 472-07-38</a>
            <a href="https://t.me/Veles_ST" target="_blank" rel="noopener" style={{ display: "inline-block", padding: "0.85rem 2rem", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", textDecoration: "none" }}>💬 Telegram @Veles_ST</a>
          </div>
          <p style={{ color: "rgba(214,198,178,0.4)", fontSize: "0.8rem", marginTop: "1.5rem" }}>Велеслав Старков · 120+ ПК с 2015 года · Закон РФ № 3085-1</p>
        </div>
      </section>
    </main>
  );
}
