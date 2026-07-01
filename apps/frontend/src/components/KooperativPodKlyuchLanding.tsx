"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

// ============================================================
// SEO 2026-2027: Key Takeaways (для AI Overviews / Яндекс Нейро)
// ============================================================
const keyTakeaways = [
  "Кооператив под ключ — это услуга создания потребительского кооператива (ПК) под регистрацию в ФНС: Устав, 13 Положений, 2 ЦПП, 10 образцов — 31 документ.",
  "ПК освобождён от НДС (ст. 149 НК РФ), налога на прибыль (ст. 251 НК РФ) и НДФЛ с паёв (ст. 217 НК РФ). Кооперативная цена = себестоимость = налоговая база 0 ₽.",
  "Срок создания: 25 рабочих дней (15 дней разработка документов + 3 дня регистрация в ФНС + резерв).",
  "Стоимость: от 90 000 ₽ (Базовый тариф) до 125 000 ₽ (Персонифицированный с консалтингом).",
  "120+ кооперативов создано с 2015 года. Ни один не ликвидирован ФНС. Ни один не получил доначислений.",
];

// ============================================================
// FAQ (expanded to 15+ questions for SEO + AI)
// ============================================================
interface FAQItem { q: string; a: string; }

const faqItems: FAQItem[] = [
  { q: "Что такое кооператив под ключ?", a: "Кооператив под ключ — это комплексная услуга, при которой исполнитель берёт на себя весь цикл создания потребительского кооператива: от сбора первичных данных до получения листа записи ЕГРЮЛ. Вы получаете 31 документ: Устав, 13 Положений, 2 Целевые потребительские программы, 10 образцов, Книгу регламентов." },
  { q: "Сколько учредителей нужно для создания ПК?", a: "Минимум 5 человек — физических лиц с 16-летнего возраста или юридических лиц. Все 5 учредителей автоматически становятся пайщиками кооператива с момента государственной регистрации (ст. 11 Закона № 3085-1)." },
  { q: "Сколько времени занимает создание кооператива?", a: "Разработка документов — 15–25 рабочих дней (зависит от тарифа). Регистрация в ФНС — 3 рабочих дня. Итого: 18–28 рабочих дней от заявки до ЕГРЮЛ. Это дольше, чем регистрация ООО (3–5 дней), потому что пакет документов существенно больше." },
  { q: "Сколько стоит кооператив под ключ?", a: "Тариф «Базовый» — 90 000 ₽ (25 документов, 15 дней). Тариф «Персонифицированный» — 125 000 ₽ (31 документ, 25 дней, 2 месяца консалтинга). Госпошлина при электронной подаче — 0 ₽. Для сравнения: налоговая экономия ПК с оборотом 10 млн ₽/мес — около 2 млн ₽/мес. Пакет окупается за 1 неделю." },
  { q: "Нужно ли лично идти в налоговую?", a: "Нет. Подача документов в ФНС осуществляется дистанционно: через личный кабинет налогоплательщика на госуслугах или через МФЦ по нотариальной доверенности. Госпошлина при электронной подаче — 0 рублей." },
  { q: "Какие налоги платит кооператив?", a: "ПК НЕ платит: НДС (ст. 149 НК РФ), налог на прибыль (ст. 251 НК РФ — паевые взносы не являются доходом), НДФЛ с паёв (ст. 217 НК РФ). ПК ПЛАТИТ: налог на имущество, земельный и транспортный налог, государственную пошлину при регистрации (при электронной подаче — 0 ₽)." },
  { q: "Что такое кооперативные выплаты?", a: "Кооперативные выплаты — это часть доходов кооператива, которая распределяется между пайщиками пропорционально их участию в хозяйственной деятельности. Это не дивиденды и не облагаются НДФЛ (ст. 22 Закона № 3085-1). Размер выплат определяется Общим собранием пайщиков." },
  { q: "Можно ли изменить Устав после регистрации?", a: "Да, изменения вносятся по решению Общего собрания (3/4 голосов) и регистрируются в ФНС. Но лучше сразу сделать Устав правильно — каждая перерегистрация стоит 5–15 тыс. ₽ и занимает 1–2 недели. Наш Устав рассчитан на 10+ лет работы без изменений." },
  { q: "Чем отличается тариф «Базовый» от «Персонифицированного»?", a: "«Базовый» (90 000 ₽) — Устав по шаблону (адаптированный под ваш бизнес), 25 документов, 15 дней. «Персонифицированный» (125 000 ₽) — индивидуальный Устав с нуля, 31 документ, 2 Целевые потребительские программы, 2 месяца консалтинга, приоритетная обработка." },
  { q: "Можно ли работать удалённо?", a: "Да, мы работаем по всей России — от Калининграда до Владивостока. Все документы передаются в электронном виде, консультации — по видеосвязи, подача в ФНС — электронно. Личного присутствия не требуется." },
  { q: "Что будет, если пайщик выйдет из кооператива?", a: "При добровольном выходе пайщик получает паевой взнос обратно в течение 3 месяцев (ст. 14 Закона № 3085-1). При исключении — в течение 12 месяцев. Кооперативные выплаты выплачиваются по итогам года. Процедура выхода описана в Уставе и Положении о членстве." },
  { q: "Даёте ли вы гарантию?", a: "Мы гарантируем: 100% успешная регистрация в ФНС, соответствие документов Закону 3085-1, 2 месяца консалтинговой поддержки. Если ФНС откажет в регистрации по нашей вине — вернём деньги и устраним ошибки бесплатно. За 10 лет — 0 отказов." },
  { q: "Чем ПК отличается от ООО?", a: "ПК — некоммерческая организация, цель которой — удовлетворение потребностей пайщиков, а не извлечение прибыли. ООО — коммерческая организация. ПК: НДС 0%, налог на прибыль 0%, НДФЛ с паёв 0%, ответственность ограничена паем, неделимый фонд защищает активы. ООО: НДС 20%, налог на прибыль 20%, НДФЛ с дивидендов 13%, ответственность всем имуществом." },
  { q: "Законно ли вообще не платить налоги через кооператив?", a: "Да, это законно. Налоговые льготы для ПК прямо прописаны в Налоговом кодексе РФ (ст. 149, 251, 217 НК РФ) и Законе № 3085-1. Это не «серая схема» — это прямые нормы закона, которые работают при условии реальной деятельности кооператива и правильного оформления документов. 120+ созданных нами кооперативов работают легально с 2015 года." },
  { q: "Может ли ФНС признать кооператив «схемой»?", a: "Может, если кооператив оформлен неправильно. 7 признаков «схемы»: кооператив для 1-2 связанных пайщиков, деятельность не по Уставу, непропорциональные выплаты, использование неделимого фонда на текущие расходы, нерыночные сделки, фиктивная регистрация, отсутствие протоколов. Мы избегаем всех 7 признаков — поэтому ни один наш кооператив не получил доначислений." },
  { q: "Что такое Целевая потребительская программа (ЦПП)?", a: "ЦПП — это документ, описывающий конкретный вид деятельности кооператива: какие товары/услуги предоставляются пайщикам, как формируется цена, как распределяются кооперативные выплаты. Без ЦПП кооператив не может вести деятельность. Мы разрабатываем 2 ЦПП под ваш бизнес." },
  { q: "Можно ли использовать кооператив для защиты активов?", a: "Да, это законно. ПК не отвечает по долгам пайщиков, пайщики не отвечают по долгам ПК (ответственность ограничена паевым взносом — ст. 13 Закона № 3085-1). Неделимый фонд кооператива не подлежит разделу. Это позволяет законно защитить активы от кредиторов и субсидиарной ответственности." },
];

// ============================================================
// Real case studies (E-E-A-T — реальный опыт)
// ============================================================
const caseStudies = [
  {
    industry: "Сельское хозяйство",
    title: "Кооператив для фермеров Краснодарского края",
    result: "8 пайщиков, оборот 4.2 млн ₽/мес",
    description: "Создали ПК для совместной переработки и реализации сельхозпродукции. НДС 0% позволил снизить цену на 20% и выйти на новые рынки сбыта.",
    timeline: "22 дня",
    documents: "31 документ"
  },
  {
    industry: "Строительство",
    title: "Кооператив строительных подрядчиков",
    result: "12 пайщиков, экономия 1.8 млн ₽/мес на налогах",
    description: "Объединение 12 строительных компаний для совместных закупок материалов и координации объектов. Кооперативные выплаты распределяются по итогам квартала.",
    timeline: "25 дней",
    documents: "31 документ + 3 доп. Положения"
  },
  {
    industry: "Услуги",
    title: "Кооператив консалтинговых услуг",
    result: "5 пайщиков, 0% НДС на консультации",
    description: "Группа независимых консультантов создала ПК для юридической и бухгалтерской поддержки клиентов. Освобождение от НДС повысило конкурентоспособность.",
    timeline: "18 дней",
    documents: "25 документов"
  },
];

// ============================================================
// People Also Ask (PAA) — для AI Overviews
// ============================================================
const paaQuestions = [
  { q: "Сколько стоит создать кооператив?", a: "От 90 000 ₽ (Базовый тариф, 25 документов) до 125 000 ₽ (Персонифицированный, 31 документ + консалтинг). Госпошлина при электронной регистрации — 0 ₽." },
  { q: "Сколько времени регистрируется кооператив?", a: "25 рабочих дней: 15 дней разработка документов + 3 дня регистрация в ФНС + резерв. Это дольше ООО (3–5 дней) из-за большего объёма документов." },
  { q: "Какие документы нужны для кооператива?", a: "31 документ: Устав, Протокол №1, Заявление Р11001, 13 Положений, 2 Целевые потребительские программы, 10 образцов, Книга регламентов, реестр пайщиков." },
  { q: "Какие налоги платит потребительский кооператив?", a: "ПК освобождён от НДС (ст. 149 НК РФ), налога на прибыль (ст. 251 НК РФ), НДФЛ с паёв (ст. 217 НК РФ). Платит: налог на имущество, земельный, транспортный." },
  { q: "Можно ли не платить налоги через кооператив?", a: "Да, законно. Налоговые льготы для ПК прямо прописаны в Налоговом кодексе. Это не «серая схема», а прямые нормы закона при условии реальной деятельности и правильного оформления." },
];

// ============================================================
// Benefits (преимущества ПК)
// ============================================================
const benefits = [
  { icon: "💰", title: "НДС — 0%", desc: "Ст. 149 НК РФ. Кооперативная цена = себестоимость. Налоговая база равна нулю." },
  { icon: "📊", title: "Налог на прибыль — 0%", desc: "Ст. 251 НК РФ. Паевые взносы и кооперативные выплаты не являются доходом." },
  { icon: "🧾", title: "НДФЛ с паёв — 0%", desc: "Ст. 217 НК РФ + ст. 22 Закона № 3085-1. Кооперативные выплаты — это не дивиденды." },
  { icon: "🛡️", title: "Защита активов", desc: "ПК не отвечает по долгам пайщиков. Неделимый фонд не подлежит разделу." },
  { icon: "📋", title: "31 документ", desc: "Устав, 13 Положений, 2 ЦПП, 10 образцов. Полный пакет за 25 дней." },
  { icon: "✅", title: "120+ ПК создано", desc: "Ни один не ликвидирован ФНС. Ни один не получил доначислений." },
];

// ============================================================
// Process steps
// ============================================================
const steps = [
  { num: "1", title: "Бриф", days: "день 1–3", desc: "Анализ бизнеса, целей, рисков. Определяем структуру, количество пайщиков, ЦПП." },
  { num: "2", title: "Устав", days: "день 4–8", desc: "Разработка под ваш бизнес. Учитывает отрасль, заёмную деятельность, защиту активов." },
  { num: "3", title: "Учредительные", days: "день 9–11", desc: "Протокол №1, заявление Р11001. Оформление для электронной подачи в ФНС." },
  { num: "4", title: "Положения + ЦПП", days: "день 12–20", desc: "13 Положений и 2 Целевые потребительские программы. Детализация всех аспектов." },
  { num: "5", title: "Образцы + ФНС", days: "день 21–25", desc: "10 образцов документов. Подача в ФНС электронно. Госпошлина — 0 ₽." },
];

// ============================================================
// Objections handling
// ============================================================
const objections = [
  { q: "«Это слишком дорого — 125 000 ₽»", a: "Налоговая экономия кооператива с оборотом 8 млн ₽/мес — 2,4 млн ₽/мес. Пакет окупается за 1,5 дня." },
  { q: "«Мой юрист сделает дешевле»", a: "Юрист без специализации сделает Устав с ошибками. Одна ошибка — ликвидация через суд. Издержки — от 500 000 ₽." },
  { q: "«А вдруг ФНС откажет?»", a: "Мы подаём электронно. Отказ возможен только при ошибках в Р11001. 100% успешных регистраций за 10 лет." },
  { q: "«А вдруг кооператив закроют?»", a: "120+ кооперативов с 2015 года. Ни один не ликвидирован. Причина — правильные документы." },
  { q: "«Боюсь, что вы пропадёте»", a: "Велеслав Старков. Telegram @Veles_ST, YouTube, VK. Телефон +7 (902) 472-07-38. Я на виду." },
  { q: "«Можно сначала самому?»", a: "Можно. Но через год, когда ФНС придёт с проверкой — стоимость будет 300 000+ вместо 125 000 ₽." },
];

// ============================================================
// SEO long-form text (для organic search)
// ============================================================
const seoText = `<h2 id="chto-takoe">Что такое кооператив под ключ — определение</h2>
<p><strong>Кооператив под ключ</strong> — это комплексная услуга, при которой исполнитель берёт на себя весь цикл создания потребительского кооператива (ПК): от сбора первичных данных о бизнесе до получения листа записи ЕГРЮЛ. Вы не ходите в налоговую, не разбираетесь в юридических терминах, не читаете Закон № 3085-1. Вы получаете готовый пакет из 31 документа и сопровождение в течение 2 месяцев.</p>

<h2 id="zachem">Зачем нужен кооператив под ключ</h2>
<p>Потребительский кооператив — это некоммерческая организация, которая освобождена от НДС (ст. 149 НК РФ), налога на прибыль (ст. 251 НК РФ) и НДФЛ с паевых взносов (ст. 217 НК РФ). Кооперативная цена равна себестоимости — налоговая база равна нулю. Но чтобы эта конструкция работала законно, каждый документ должен быть составлен безупречно.</p>
<p>Самостоятельная регистрация ПК — это риск. Шаблонный Устав из интернета не учитывает специфику вашего бизнеса, не регулирует кооперативные выплаты, не описывает новацию паевого взноса. Одна ошибка — ликвидация через суд, субсидиарная ответственность, потеря активов.</p>

<h2 id="kak-snizit">Как снизить налоги законно через потребительский кооператив</h2>
<p>Предприниматель платит: 20% НДС + 20% налог на прибыль + 13% НДФЛ с дивидендов + страховые взносы. Итого — до 50–60% дохода уходит в налоги.</p>
<p>Потребительский кооператив меняет эту математику:</p>
<ul>
<li><strong>НДС — 0%</strong> (ст. 149 НК РФ)</li>
<li><strong>Налог на прибыль — 0%</strong> (ст. 251 НК РФ — паевые взносы не являются доходом)</li>
<li><strong>НДФЛ с паёв — 0%</strong> (ст. 217 НК РФ)</li>
<li><strong>Страховые взносы с кооперативных выплат — 0%</strong></li>
</ul>
<p><strong>Важно:</strong> это не «серая схема». Это прямые нормы Налогового кодекса, которые работают при условии, что кооператив ведёт реальную деятельность и правильно оформляет документы.</p>

<h2 id="riski">Риски кооператива — и как их избежать</h2>
<p>Многие боятся, что ФНС признает кооператив «схемой». Этот страх обоснован — в 2018–2022 годах было несколько резонансных дел. Но во всех случаях проблема была в том, как кооператив был оформлен.</p>
<p><strong>7 признаков «схемы», которых мы избегаем:</strong></p>
<ol>
<li>Кооператив для 1–2 связанных пайщиков</li>
<li>Деятельность не по Уставу</li>
<li>Непропорциональные кооперативные выплаты</li>
<li>Использование неделимого фонда на текущие расходы</li>
<li>Нерыночные сделки между пайщиками</li>
<li>Фиктивная регистрация (без реальной деятельности)</li>
<li>Отсутствие протоколов собраний</li>
</ol>
<p>Мы гарантируем: реальное сообщество пайщиков, деятельность строго по Уставу, прозрачные кооперативные выплаты, неделимый фонд, протоколы собраний. 120+ созданных кооперативов — ни одной проверки с доначислениями.</p>

<h2 id="ustav">Устав потребительского кооператива — почему шаблон опасен</h2>
<p>«Скачаю шаблон Устава из интернета, заполню — и готово». Это самая опасная ошибка. Шаблон не учитывает специфику вашего бизнеса, не регулирует кооперативные выплаты, не описывает новацию паевого взноса, не регулирует заёмную деятельность, содержит устаревшие нормы.</p>
<p>Одна ошибка в Уставе — ликвидация через суд, субсидиарная ответственность, потеря активов. Наш Устав разработан за 10 лет практики и протестирован в реальных судебных делах. Рассчитан на 10+ лет работы без изменений.</p>

<h2 id="zaschita">Защита активов через кооператив — как это работает</h2>
<p>В ООО учредители отвечают всем имуществом. При банкротстве — субсидиарная ответственность. В потребительском кооперативе:</p>
<ul>
<li><strong>ПК не отвечает по долгам пайщиков</strong> (ст. 13 Закона № 3085-1)</li>
<li><strong>Пайщики не отвечают по долгам ПК</strong> (ответственность ограничена паевым взносом)</li>
<li><strong>Неделимый фонд не подлежит разделу</strong> между пайщиками</li>
</ul>
<p>Это законная защита активов, основанная на ГК РФ и Законе № 3085-1.</p>

<h2 id="dokumenty">Какие документы нужны для кооператива — 31 документ</h2>
<p>Пакет включает:</p>
<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
<thead><tr style="background:rgba(184,149,106,0.1);"><th style="padding:0.75rem;text-align:left;border:1px solid rgba(184,149,106,0.2);">Категория</th><th style="padding:0.75rem;text-align:left;border:1px solid rgba(184,149,106,0.2);">Документы</th><th style="padding:0.75rem;text-align:center;border:1px solid rgba(184,149,106,0.2);">Кол-во</th></tr></thead>
<tbody>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Учредительные</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Устав ПК, Протокол №1, Заявление Р11001</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);">3</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Положения</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">О членстве, о паевых взносах, о кооп. выплатах, о заёмной деятельности, о фондах, о дисциплине, и др.</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);">13</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">ЦПП</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">2 Целевые потребительские программы</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);">2</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Образцы</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Заявление о приёме, паевая книжка, протокол собрания, и др.</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);">10</td></tr>
<tr><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Прочее</td><td style="padding:0.6rem 0.75rem;border:1px solid rgba(214,198,178,0.1);">Книга регламентов, реестр пайщиков, памятка для бухгалтера</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(214,198,178,0.1);">3</td></tr>
<tr style="background:rgba(184,149,106,0.05);font-weight:600;"><td colspan="2" style="padding:0.6rem 0.75rem;border:1px solid rgba(184,149,106,0.2);">Итого</td><td style="padding:0.6rem 0.75rem;text-align:center;border:1px solid rgba(184,149,106,0.2);color:#B8956A;">31</td></tr>
</tbody>
</table>

<h2 id="stoimost">Сколько стоит кооператив под ключ</h2>
<p>Тариф «Базовый» (90 000 ₽) — 25 документов, Устав по шаблону, 15 рабочих дней. Тариф «Персонифицированный» (125 000 ₽) — 31 документ, индивидуальный Устав, 2 ЦПП, 2 месяца консалтинга, 25 рабочих дней.</p>
<p>Для сравнения: налоговая экономика кооператива с оборотом 10 млн ₽/мес составляет около 2 млн ₽/мес. Стоимость пакета окупается за первую неделю работы кооператива.</p>

<h2 id="sravnenie">Кооператив vs ООО vs ИП — сравнение</h2>
<p>Потребительский кооператив выгодно отличается от ООО и ИП по налоговой нагрузке и защите активов:</p>
<ul>
<li><strong>НДС:</strong> ООО — 20%, ИП — 20% (или УСН 6–15%), ПК — 0%</li>
<li><strong>Налог на прибыль:</strong> ООО — 20%, ИП — НДФЛ 13%, ПК — 0%</li>
<li><strong>НДФЛ с распределения:</strong> ООО — 13%, ИП — 0% (но НДФЛ с дохода), ПК — 0%</li>
<li><strong>Ответственность:</strong> ООО — всем имуществом, ИП — всем имуществом, ПК — ограничена паём</li>
<li><strong>Защита активов:</strong> ООО — нет, ИП — нет, ПК — неделимый фонд</li>
<li><strong>Срок создания:</strong> ООО — 3–5 дней, ИП — 3 дня, ПК — 25 дней</li>
</ul>
<p>ПК создаётся дольше, но даёт существенно большую налоговую экономию и защиту активов в долгосрочной перспективе.</p>
`;

// ============================================================
// Related articles (internal linking — Entity SEO)
// ============================================================
const relatedArticles = [
  { title: "Потребительский кооператив: что это, виды, закон 3085-1", href: "/blog/kooperativ-eto-nekommercheskaya-ili-kommercheskaya-organizatsiya" },
  { title: "Как работает потребительский кооператив в 2026", href: "/blog/kak-rabotaet-potrebitelskiy-kooperativ-2026" },
  { title: "11 видов потребительских кооперативов в России", href: "/blog/11-vidov-potrebitelskih-kooperativov-v-rossii" },
  { title: "Устав кооператива: как составить, образец 2026", href: "/blog/ustav-potrebitelskogo-kooperativa-kak-sostavit" },
  { title: "Субсидиарная ответственность пайщика: мифы и реальность", href: "/blog/subsidiarnaya-otvetstvennost-payschika-potrebitelskogo-kooperativa" },
  { title: "20 главных терминов кооперации", href: "/blog/20-glavnyh-terminov-kooperatsii" },
];

export default function KooperativPodKlyuchLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openObjection, setOpenObjection] = useState<number | null>(null);
  const [openPaa, setOpenPaa] = useState<number | null>(null);

  // ============================================================
  // SEO 2026: Inject Article + Service + FAQ schema (JSON-LD)
  // ============================================================
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": "Кооператив под ключ — регистрация потребительского кооператива",
          "description": "Комплексная услуга создания потребительского кооператива: 31 документ, регистрация в ФНС, 2 месяца консалтинга. От 90 000 ₽, 25 дней.",
          "provider": {
            "@type": "Organization",
            "name": "Школа ПК — Велеслав Старков",
            "url": "https://2980738.ru",
            "telephone": "+79024720738",
            "email": "boss@2980738.ru",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "RU",
              "addressLocality": "Пермь",
              "streetAddress": "ул. Фонтанная, д. 1а/1"
            }
          },
          "areaServed": { "@type": "Country", "name": "Россия" },
          "offers": [
            {
              "@type": "Offer",
              "name": "Базовый тариф",
              "price": "90000",
              "priceCurrency": "RUB",
              "description": "25 документов, Устав по шаблону, 15 рабочих дней"
            },
            {
              "@type": "Offer",
              "name": "Персонифицированный тариф",
              "price": "125000",
              "priceCurrency": "RUB",
              "description": "31 документ, индивидуальный Устав, 2 ЦПП, 2 месяца консалтинга, 25 рабочих дней"
            }
          ],
          "url": "https://2980738.ru/uslugi-dlya-potrebitelskih-kooperativov/kooperativ-pod-klyuch"
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
            { "@type": "ListItem", "position": 3, "name": "Кооператив под ключ" }
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
        { label: "Кооператив под ключ" }
      ]} />

      {/* ==================== HERO ==================== */}
      <section style={{ padding: "3rem 1.5rem 2rem", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(184,149,106,0.15)", border: "1px solid rgba(184,149,106,0.3)", borderRadius: 100, fontSize: "1rem", color: "#B8956A", fontWeight: 600, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          🔑 Услуга · Регистрация ПК
        </div>
        <h1 className="heading-sweep" data-text="Кооператив под ключ" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem", lineHeight: 1.2 }}>
          Кооператив под ключ —<br /><span style={{ color: "#B8956A" }}>законно, без рисков, за 25 дней</span>
        </h1>
        <p style={{ fontSize: "1.15rem", color: "rgba(214,198,178,0.8)", maxWidth: 700, margin: "0 auto 1rem", lineHeight: 1.6 }}>
          31 документ. Устав, 13 Положений, Целевые программы. 0% НДС, 0% налог на прибыль. 120+ ПК создано с 2015 года. Ни один не ликвидирован ФНС.
        </p>
        {/* E-E-A-T: Author + Last updated */}
        <p style={{ fontSize: "1.05rem", color: "rgba(214,198,178,0.8)", marginBottom: "2rem" }}>
          Автор: <Link href="/about-us" style={{ color: "#B8956A", textDecoration: "none" }}>Велеслав Старков</Link>, 10 лет практики · Обновлено: июнь 2026
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="#cta" className="btn-primary" style={{ display: "inline-block", padding: "0.9rem 2rem", fontSize: "1rem", textDecoration: "none" }}>Получить консультацию</Link>
          <a href="#pricing" style={{ display: "inline-block", padding: "0.9rem 2rem", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", textDecoration: "none" }}>От 90 000 ₽</a>
        </div>

      </section>

      {/* ==================== KEY TAKEAWAYS (для AI Overviews) ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ background: "rgba(184,149,106,0.05)", border: "1px solid rgba(184,149,106,0.2)", borderRadius: 14, padding: "2rem", display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 500px" }}>
            <h2 style={{ color: "#B8956A", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📌 Ключевые выводы</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {keyTakeaways.map((item, i) => (
                <li key={i} style={{ padding: "0.6rem 0", borderBottom: i < keyTakeaways.length - 1 ? "1px solid rgba(214,198,178,0.08)" : "none", color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.5, display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "#B8956A", fontWeight: 700 }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "0 0 350px", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0144.webp" 
              alt="Команда Школы ПК обсуждает создание потребительского кооператива под ключ — рукопожатие в офисе" 
              width={350} 
              height={350}
              loading="eager"
              style={{ maxWidth: 350, width: "100%", height: "auto", borderRadius: 14, border: "1px solid rgba(184,149,106,0.2)" }}
            />
          </div>
        </div>
      </section>

      {/* ==================== TABLE OF CONTENTS ==================== */}
      <section style={{ padding: "1.5rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <nav style={{ background: "rgba(214,198,178,0.03)", borderRadius: 12, padding: "1.25rem 1.5rem", border: "1px solid rgba(214,198,178,0.08)" }}>
          <p style={{ color: "#B8956A", fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Содержание</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.4rem" }}>
            <li><a href="#chto-takoe" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Что такое кооператив под ключ</a></li>
            <li><a href="#zachem" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Зачем нужен кооператив</a></li>
            <li><a href="#kak-snizit" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Как снизить налоги законно</a></li>
            <li><a href="#riski" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Риски и как их избежать</a></li>
            <li><a href="#ustav" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Устав ПК</a></li>
            <li><a href="#zaschita" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Защита активов</a></li>
            <li><a href="#dokumenty" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Документы (31 шт)</a></li>
            <li><a href="#stoimost" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Стоимость</a></li>
            <li><a href="#sravnenie" style={{ color: "rgba(214,198,178,0.8)", textDecoration: "none", fontSize: "1.05rem" }}>Сравнение ПК vs ООО vs ИП</a></li>
          </ul>
        </nav>
      </section>

      {/* ==================== BENEFITS ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 300px", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0146.webp" 
              alt="Совещание команды Школы ПК по разработке документов для потребительского кооператива" 
              width={300} 
              height={302}
              loading="lazy"
              style={{ maxWidth: 300, width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(214,198,178,0.1)" }}
            />
          </div>
          <div style={{ flex: "1 1 400px" }}>
            <h2 className="heading-sweep" data-text="Преимущества" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.5rem" }}>Преимущества потребительского кооператива</h2>
            <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1rem", lineHeight: 1.5 }}>Почему 120+ предпринимателей выбрали потребительский кооператив вместо ООО или ИП</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 14, padding: "1.75rem", transition: "all 0.3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,149,106,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(214,198,178,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{b.icon}</div>
              <h3 style={{ color: "#E7DCCF", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{b.title}</h3>
              <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.5 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PAIN → SOLUTION ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Какие проблемы решает" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Какие проблемы решает кооператив</h2>
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
                <p style={{ color: "rgba(230,136,99,0.9)", fontSize: "1.05rem", marginBottom: "0.5rem", fontWeight: 600 }}>{item.pain}</p>
                <p style={{ color: "rgba(184,149,106,0.9)", fontSize: "1.05rem" }}>✓ {item.solution}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ==================== STEPS ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px" }}>
            <h2 className="heading-sweep" data-text="Как мы работаем" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.5rem" }}>Как мы работаем — 5 этапов</h2>
            <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1rem", lineHeight: 1.5 }}>От первого звонка до записи в ЕГРЮЛ — 25 рабочих дней</p>
          </div>
          <div style={{ flex: "0 0 300px", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0147.webp" 
              alt="Специалисты Школы ПК на объекте клиента — обсуждение создания кооператива для строительной компании" 
              width={300} 
              height={300}
              loading="lazy"
              style={{ maxWidth: 300, width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(214,198,178,0.1)" }}
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

      {/* ==================== CASE STUDIES (E-E-A-T) ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 350px", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0148.webp" 
              alt="Рукопожатие — заключение договора на создание потребительского кооператива под ключ" 
              width={350} 
              height={351}
              loading="lazy"
              style={{ maxWidth: 350, width: "100%", height: "auto", borderRadius: 14, border: "1px solid rgba(184,149,106,0.15)" }}
            />
          </div>
          <div style={{ flex: "1 1 400px" }}>
            <h2 className="heading-sweep" data-text="Кейсы" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", fontWeight: 700, marginBottom: "0.5rem" }}>Реальные кейсы — 120+ кооперативов</h2>
            <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.05rem", lineHeight: 1.5 }}>Каждый кейс — реальный кооператив, созданный нами. Данные анонимизированы, но цифры реальные.</p>
          </div>
        </div>
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

      {/* ==================== COMPARISON TABLE ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Сравнение" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Кооператив vs ООО vs ИП — что выгоднее</h2>
        <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(214,198,178,0.12)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead><tr>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", background: "rgba(184,149,106,0.1)", color: "#E7DCCF", borderBottom: "1px solid rgba(184,149,106,0.2)" }}>Параметр</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", background: "rgba(214,198,178,0.05)", color: "rgba(214,198,178,0.8)", borderBottom: "1px solid rgba(214,198,178,0.1)" }}>ООО</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", background: "rgba(214,198,178,0.05)", color: "rgba(214,198,178,0.8)", borderBottom: "1px solid rgba(214,198,178,0.1)" }}>ИП</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", background: "rgba(184,149,106,0.1)", color: "#B8956A", borderBottom: "1px solid rgba(184,149,106,0.2)" }}>ПК</th>
            </tr></thead>
            <tbody>
              {[["НДС","20%","20% (или УСН)","0%"],["Налог на прибыль","20%","НДФЛ 13%","0%"],["НДФЛ с распределения","13%","—","0%"],["Ответственность","Всем имуществом","Всем имуществом","Ограничена паём"],["Защита активов","Нет","Нет","Неделимый фонд"],["Срок создания","3–5 дней","3 дня","25 дней"]].map((row,i)=>(
                <tr key={i}>
                  <td style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "rgba(214,198,178,0.9)" }}>{row[0]}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "rgba(214,198,178,0.8)" }}>{row[1]}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "rgba(214,198,178,0.8)" }}>{row[2]}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(214,198,178,0.06)", color: "#B8956A", fontWeight: 600 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ textAlign: "center", color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginTop: "1rem" }}>
          ПК создаётся дольше, но даёт существенно большую налоговую экономию и защиту активов в долгосрочной перспективе.
        </p>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" style={{ padding: "2rem 1.5rem", maxWidth: 1300, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Тарифы" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2.5rem", fontWeight: 700 }}>Тарифы</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "2rem", background: "rgba(214,198,178,0.03)", borderRadius: 14, border: "1px solid rgba(214,198,178,0.1)" }}>
            <h3 style={{ color: "#E7DCCF", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Базовый</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#D6C6B2", marginBottom: "0.25rem" }}>90 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>25 документов · 15 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 2 }}>
              <li>✓ Устав по шаблону (адаптированный)</li><li>✓ Протокол №1 + Р11001</li><li>✓ 13 Положений по шаблону</li><li>✓ Базовая ЦПП</li><li>✓ 10 образцов документов</li>
            </ul>
          </div>
          <div style={{ padding: "2rem", background: "rgba(184,149,106,0.08)", borderRadius: 14, border: "2px solid rgba(184,149,106,0.3)", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20, padding: "0.25rem 0.75rem", background: "#B8956A", color: "#0D0C0A", borderRadius: 100, fontSize: "1rem", fontWeight: 700 }}>РЕКОМЕНДУЕМ</div>
            <h3 style={{ color: "#B8956A", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Персонифицированный</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#E7DCCF", marginBottom: "0.25rem" }}>125 000 ₽</div>
            <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>31 документ · 25 рабочих дней</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 2 }}>
              <li>✓ Индивидуальный Устав (с нуля)</li><li>✓ Протокол №1 + Р11001</li><li>✓ 13 Положений (индивидуальных)</li><li>✓ 2 Целевые потребительские программы</li><li>✓ 10 образцов документов</li><li>✓ 2 месяца консалтинга</li><li>✓ Приоритетная обработка (5 дней)</li>
            </ul>
          </div>
        </div>
        <p style={{ textAlign: "center", color: "rgba(214,198,178,0.8)", fontSize: "1.05rem", marginTop: "1.5rem" }}>Для сравнения: налоговая экономия кооператива с оборотом 10 млн ₽/мес — около 2 млн ₽/мес. Стоимость пакета окупается за первую неделю.</p>
      </section>

      {/* ==================== OBJECTIONS ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Возражения" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Возражения и честные ответы</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {objections.map((item, i) => (
            <div key={i} style={{ background: "rgba(214,198,178,0.03)", borderRadius: 10, border: "1px solid rgba(214,198,178,0.08)", overflow: "hidden" }}>
              <button onClick={() => setOpenObjection(openObjection === i ? null : i)} style={{ width: "100%", padding: "1rem 1.25rem", background: "transparent", border: "none", color: "#E7DCCF", fontSize: "1.05rem", fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.q}<span style={{ color: "#B8956A", fontSize: "1.2rem", transition: "transform 0.2s", transform: openObjection === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openObjection === i && <div style={{ padding: "0 1.25rem 1rem", color: "rgba(214,198,178,0.8)", fontSize: "1rem", lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PEOPLE ALSO ASK (для AI Overviews) ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
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

      {/* ==================== SEO LONG-FORM TEXT ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <div className="article-content" style={{ color: "#D6C6B2", lineHeight: 1.8, fontSize: "1.05rem" }} dangerouslySetInnerHTML={{ __html: seoText }} />
      </section>

      {/* ==================== FAQ (расширенный) ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
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

      {/* ==================== RELATED ARTICLES (internal linking) ==================== */}
      <section style={{ padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="heading-sweep" data-text="Похожие материалы" style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#E7DCCF", marginBottom: "2rem", fontWeight: 700 }}>Похожие материалы</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {relatedArticles.map((article, i) => (
            <Link key={i} href={article.href} style={{ display: "block", padding: "1.25rem", background: "rgba(214,198,178,0.03)", borderRadius: 10, border: "1px solid rgba(214,198,178,0.08)", color: "#D6C6B2", textDecoration: "none", fontSize: "1rem", lineHeight: 1.4, transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,149,106,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(184,149,106,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(214,198,178,0.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(214,198,178,0.03)"; }}>
              📄 {article.title}
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section id="cta" style={{ padding: "2rem 1.5rem 5rem", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ padding: "2.5rem 2rem", background: "rgba(184,149,106,0.08)", borderRadius: 16, border: "1px solid rgba(184,149,106,0.2)" }}>
          <h2 className="heading-sweep" data-text="Готовы начать?" style={{ color: "#E7DCCF", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Готовы начать?</h2>
          <p style={{ color: "rgba(214,198,178,0.8)", fontSize: "1rem", marginBottom: "1.5rem" }}>Запишитесь на бесплатную консультацию — отвечу на все вопросы и помогу определить, подходит ли вам кооператив.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+79024720738" className="btn-primary" style={{ display: "inline-block", padding: "0.85rem 2rem", fontSize: "1rem", textDecoration: "none" }}>📞 +7 (902) 472-07-38</a>
            <a href="https://t.me/Veles_ST" target="_blank" rel="noopener" style={{ display: "inline-block", padding: "0.85rem 2rem", fontSize: "1rem", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", textDecoration: "none" }}>💬 Telegram @Veles_ST</a>
          </div>
          {/* Trust signals */}
          {/* SEO 2026: People image in CTA — emotional connection, centered */}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
            <img 
              src="/api/media/file/0149.webp" 
              alt="Группа пайщиков потребительского кооператива под ключ — вход в офис кооператива" 
              width={350} 
              height={351}
              loading="lazy"
              style={{ maxWidth: 350, width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(184,149,106,0.15)" }}
            />
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(214,198,178,0.1)", display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", fontSize: "1rem", color: "rgba(214,198,178,0.8)" }}>
            <span>✅ 120+ ПК создано</span>
            <span>✅ 10 лет практики</span>
            <span>✅ 0 отказов ФНС</span>
            <span>✅ Закон РФ № 3085-1</span>
          </div>
          <p style={{ color: "rgba(214,198,178,0.65)", fontSize: "1rem", marginTop: "1.5rem" }}>Велеслав Старков · 120+ ПК с 2015 года · Закон РФ № 3085-1</p>

        </div>
      </section>
    </main>
  );
}
