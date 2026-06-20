import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

// === ИМПОРТ ВСЕХ 18 БЛОКОВ для layout.blocks[] ===
import { HeroBlock } from '../blocks/HeroBlock'
import { FeaturesBlock } from '../blocks/FeaturesBlock'
import { CtaBlock } from '../blocks/CtaBlock'
import { ContentBlock } from '../blocks/ContentBlock'
import { FaqBlock } from '../blocks/FaqBlock'
import { GalleryBlock } from '../blocks/GalleryBlock'
import { PricingBlock } from '../blocks/PricingBlock'
import { TestimonialsBlock } from '../blocks/TestimonialsBlock'
import { StatsBlock } from '../blocks/StatsBlock'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { StepsBlock } from '../blocks/StepsBlock'
import { CardsBlock } from '../blocks/CardsBlock'
import { ContactBlock } from '../blocks/ContactBlock'
import { DividerBlock } from '../blocks/DividerBlock'
import { QuoteBlock } from '../blocks/QuoteBlock'
import { TableBlock } from '../blocks/TableBlock'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublished', 'updatedAt'],
    group: 'Контент',
    listSearchableFields: ['title', 'slug'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'URL-слаг', admin: { position: 'sidebar' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, label: 'Опубликована', admin: { position: 'sidebar' } },

    // === HERO ===
    {
      name: 'hero',
      type: 'group',
      label: 'Hero — главный экран',
      fields: [
        { name: 'titleLine1', type: 'text', label: 'Заголовок (первая строка)', defaultValue: 'Потребительский кооператив' },
        { name: 'titleLine2', type: 'text', label: 'Заголовок (вторая строка)', defaultValue: 'защита активов и ставка 0%' },
        { name: 'description', type: 'textarea', label: 'Описание', defaultValue: 'НДС, налог на прибыль и соц.платежи — 0% по закону РФ № 3085-1. Обучим работе с некоммерческими организациями. Защитите имущество от взысканий, обнулите налоги и работайте легально — более 120 предпринимателей уже открыли свои ПК с нашей помощью.' },
        { name: 'ctaPrimaryText', type: 'text', label: 'Текст основной кнопки', defaultValue: 'Выбрать курс' },
        { name: 'ctaPrimaryLink', type: 'text', label: 'Ссылка основной кнопки', defaultValue: '/kursy' },
        { name: 'ctaSecondaryText', type: 'text', label: 'Текст второй кнопки', defaultValue: 'Бесплатная консультация' },
        { name: 'ctaSecondaryLink', type: 'text', label: 'Ссылка второй кнопки', defaultValue: '/konsultacii' },
      ],
    },

    // === QUOTE ===
    {
      name: 'quote',
      type: 'group',
      label: 'Цитата',
      fields: [
        { name: 'text', type: 'textarea', label: 'Текст цитаты', defaultValue: '«Кооперация — это не бизнес-модель. Это архитектура доверия.»' },
        { name: 'author', type: 'text', label: 'Автор', defaultValue: 'Велеслав Старков' },
      ],
    },

    // === ADVANTAGES (таблица) ===
    {
      name: 'advantages',
      type: 'array',
      label: 'Преимущества (таблица)',
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)', required: true },
        { name: 'title', type: 'text', label: 'Название', required: true },
        { name: 'desc', type: 'textarea', label: 'Описание', required: true },
      ],
      defaultValue: [
        { icon: '0%', title: 'Налоги 0%', desc: 'НДС 0% (ст. 149 НК РФ), налог на прибыль 0%, НДФЛ с паевых взносов 0%. Налоговая база равна нулю' },
        { icon: '🛡️', title: 'Защита имущества', desc: 'ПК не отвечает по долгам пайщиков, а пайщики не отвечают по долгам кооператива (субсидиарная ответственность ограничена размером паевого взноса)' },
        { icon: '✅', title: 'Никаких проверок', desc: 'Пожарные, СЭС, Роспотребнадзор не вмешиваются — Закон РФ № 3085-1' },
        { icon: '💰', title: 'Возврат пая — не доход', desc: 'Возврат паевого взноса при выходе из кооператива не облагается НДФЛ' },
        { icon: '💳', title: 'Онлайн-касса не нужна', desc: 'Онлайн-касса не требуется — нет продаж, есть возврат паёв' },
        { icon: '🗳️', title: 'Один пайщик — один голос', desc: 'Демократическое управление: каждый пайщик имеет один голос независимо от размера паевого взноса' },
      ],
    },

    // === STATS ===
    {
      name: 'stats',
      type: 'array',
      label: 'Статистика',
      fields: [
        { name: 'value', type: 'text', label: 'Значение', required: true },
        { name: 'label', type: 'text', label: 'Подпись', required: true },
      ],
      defaultValue: [
        { value: '2015', label: 'Работаем с 2015 года' },
        { value: '100+', label: 'успешных кейсов' },
        { value: '4', label: 'пакета обучения' },
        { value: '12 мес', label: 'Поддержка до 12 месяцев' },
      ],
    },

    // === HOW STEPS ===
    {
      name: 'howSteps',
      type: 'array',
      label: '3 шага к кооперативу',
      fields: [
        { name: 'num', type: 'text', label: 'Номер', required: true },
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'desc', type: 'textarea', label: 'Описание', required: true },
      ],
      defaultValue: [
        { num: '1', title: 'Объединяетесь с партнёрами', desc: 'Минимум 5 участников — физических лиц с 16 лет или юридических лиц. Вносите паевые взносы и формируете паевой фонд кооператива.' },
        { num: '2', title: 'Регистрируете кооператив', desc: 'Разрабатываете устав, протокол учредительного собрания, целевую программу. Подаете документы в ФНС и получаете запись в ЕГРЮЛ.' },
        { num: '3', title: 'Ведёте деятельность без фискальной нагрузки', desc: 'Кооперативная цена равна себестоимости — налоговая база равна нулю. НДС 0%, налог на прибыль 0%, НДФЛ 0%.' },
      ],
    },

    // === ABOUT SCHOOL (аккордеон) ===
    {
      name: 'aboutCards',
      type: 'array',
      label: 'О Школе (аккордеон)',
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)', required: true },
        { name: 'title', type: 'text', label: 'Заголовок секции', required: true },
        { name: 'desc', type: 'richText', label: 'Текст секции', required: true },
      ],
    },

    // === ABOUT VELESLAV ===
    {
      name: 'aboutVeleslav',
      type: 'group',
      label: 'О Велеславе',
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'С кем будете трудиться?' },
        { name: 'photo', type: 'upload', relationTo: 'media', label: 'Фото Велеслава' },
        {
          name: 'paragraphs',
          type: 'array',
          label: 'Параграфы текста',
          fields: [
            { name: 'text', type: 'textarea', label: 'Текст параграфа', required: true },
          ],
        },
      ],
    },

    // === SERVICES ===
    {
      name: 'services',
      type: 'array',
      label: 'Услуги',
      fields: [
        { name: 'icon', type: 'text', label: 'Иконка (emoji)', required: true },
        { name: 'title', type: 'text', label: 'Название', required: true },
        { name: 'price', type: 'text', label: 'Цена', required: true },
        { name: 'desc', type: 'textarea', label: 'Описание', required: true },
        { name: 'href', type: 'text', label: 'Ссылка', defaultValue: '/uslugi' },
      ],
      defaultValue: [
        { icon: '📋', title: 'Аудит и доработка устава ПК', price: 'от 15 000 ₽', desc: 'Проверю ваш устав на соответствие Закону № 3085-1 и статьям 123.1–123.8 ГК РФ. Выявлю риски субсидиарной ответственности, устраню противоречия, подготовлю пакет изменений.', href: '/uslugi/audit-ustava' },
        { icon: '📝', title: 'Готовый ПК «под ключ»', price: '90 000 ₽', desc: 'Полная подготовка и регистрация потребительского кооператива: устав под ваши задачи, протокол учредительного собрания, все учредительные документы, помощь с внесением в ЕГРЮЛ.', href: '/konsultacii' },
        { icon: '📦', title: 'Пакет документов для подтверждения деятельности ПК', price: '25 000 ₽', desc: 'Готовый пакет документов для подтверждения деятельности кооператива перед налоговой: положение о паевом фонде, целевая программа, протоколы, реестр пайщиков.', href: '/uslugi' },
        { icon: '🎯', title: 'Разработка целевой потребительской программы', price: '25 000 ₽', desc: 'Создам документально оформленный план расходов объединения на конкретные нужды участников — ключевой документ для подтверждения деятельности ПК перед налоговой.', href: '/uslugi' },
        { icon: '🛡️', title: 'Сопровождение при проверках налоговой', price: '15 000 ₽', desc: 'Анализ рисков, подготовка пояснений и возражений, представление интересов в переписке с ФНС, корректировка документов. Не даю налоговой закрыть ваше объединение.', href: '/uslugi' },
        { icon: '🌐', title: 'Создание «кооперативного сайта» под ключ', price: '50 000 ₽', desc: 'Сайт для ПК с учётом специфики: лендинг для привлечения новых членов, личный кабинет, блог. Всё, чтобы ваш сайт выглядел профессионально и привлекал новых участников.', href: '/uslugi' },
      ],
    },

    // === FAQ ===
    {
      name: 'faqItems',
      type: 'array',
      label: 'Частые вопросы',
      fields: [
        { name: 'q', type: 'text', label: 'Вопрос', required: true },
        { name: 'a', type: 'textarea', label: 'Ответ', required: true },
      ],
    },

    // === CTA ===
    {
      name: 'cta',
      type: 'group',
      label: 'CTA — призыв к действию',
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Готовы начать?' },
        { name: 'subtitle', type: 'textarea', label: 'Подзаголовок' },
        { name: 'buttonText', type: 'text', label: 'Текст кнопки', defaultValue: 'Бесплатная консультация' },
        { name: 'buttonLink', type: 'text', label: 'Ссылка', defaultValue: '/konsultacii' },
      ],
    },

    // === CONTACTS ===
    {
      name: 'contacts',
      type: 'group',
      label: 'Контакты',
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон', defaultValue: '+7 (902) 472-07-38' },
        { name: 'phoneHref', type: 'text', label: 'Ссылка телефона', defaultValue: 'tel:+79024720738' },
        { name: 'email', type: 'email', label: 'Email', defaultValue: 'boss@2980738.ru' },
        { name: 'telegram', type: 'text', label: 'Telegram (с @)', defaultValue: '@Veles_ST' },
        { name: 'telegramLink', type: 'text', label: 'Ссылка Telegram', defaultValue: 'https://t.me/Veles_ST' },
        { name: 'address', type: 'textarea', label: 'Адрес', defaultValue: 'г. Пермь, ул. Фонтанная, д. 1а/1' },
        { name: 'legal', type: 'textarea', label: 'Юридическая информация', defaultValue: 'ИП Старков Велеслав Владимирович, ИНН 590415054646' },
      ],
    },

    // === SEO ===
    { name: 'content', type: 'richText', label: 'Содержание (SEO)' },

    // === LAYOUT: BLOCKS[] — гибкая компоновка страницы из 18 блоков ===
    // Редактор может добавлять блоки в любом порядке и количестве.
    // Каждый блок имеет свой blockType (hero, features, cta, faq, pricing,
    // testimonials, gallery, stats, content, text, image, video, steps,
    // cards, contact, divider, quote, table) и свои поля.
    // Frontend рендерит через BlockRenderer.tsx.
    // Используется для второстепенных страниц (курсы, услуги, faq, и т.д.),
    // где стандартная модель с фиксированными полями не подходит.
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Блоки страницы (гибкая компоновка)',
      admin: {
        description: 'Добавляйте блоки в любом порядке. Каждый блок — отдельная секция страницы. Используются для второстепенных страниц (курсы, услуги, faq, и т.д.). Доступно 18 типов блоков.',
      },
      blocks: [
        // Стандартные (9)
        HeroBlock,
        FeaturesBlock,
        CtaBlock,
        ContentBlock,
        FaqBlock,
        GalleryBlock,
        PricingBlock,
        TestimonialsBlock,
        StatsBlock,
        // Дополнительные (9)
        TextBlock,
        ImageBlock,
        VideoBlock,
        StepsBlock,
        CardsBlock,
        ContactBlock,
        DividerBlock,
        QuoteBlock,
        TableBlock,
      ],
    },
  ],
    hooks: createAuditHooks('page'),
  timestamps: true,
}
