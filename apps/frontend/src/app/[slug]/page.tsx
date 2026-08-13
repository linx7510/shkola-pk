import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BlockRenderer } from '@/components/BlockRenderer'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CursorLightLazy from '@/components/CursorLightLazy'
import Breadcrumbs from '@/components/Breadcrumbs'
import { breadcrumbJsonLd } from '@/components/Breadcrumbs'
import DonateForm from '@/components/DonateForm'
import { cookies } from 'next/headers'

const PAYLOAD_API = process.env.PAYLOAD_API_URL
               || process.env.NEXT_PUBLIC_PAYLOAD_URL
               || 'http://localhost:3001'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://велеслав.рус'

export const dynamic = 'force-dynamic' // ISR отключён: нужен cookies() для video-gating

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.docs?.[0] ?? null
  } catch {
    return null
  }
}

interface Props {
  params: Promise<{ slug: string }>
}


/**
 * Парсит мета-теги из HTML-строки для metadata.other.
 * Next.js выведет их в <head> как <meta name="..." content="..." />
 */
function parseMetaTags(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    result[match[1]] = match[2];
  }
  return result;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await fetchPage(slug)
  if (!page) return { title: 'Страница не найдена' }

  const title = (page as any).meta?.title || (page as any).metaTitle || (page as any).title || 'Школа ПК'
  // Читаем seoHeadCode и headCode из БД — для произвольных мета-тегов
  const headCodeForMeta = (page as any).seoHeadCode || (page as any).headCode || ''
  const metaTags = headCodeForMeta ? parseMetaTags(headCodeForMeta) : {}
  const description = (page as any).meta?.description || (page as any).metaDescription || (page as any).excerpt || ''
  
  // Для about-us — используем фото Велеслава и type=profile
  const isAboutUs = slug === 'about-us'
  // Fallback description для about-us если не получен из БД
  const finalDescription = description || (isAboutUs 
    ? 'Велеслав Старков — председатель Правления ПК с 2015 года. Основатель Первой онлайн Школы потребительской кооперации. 120+ зарегистрированных ПК, регистрация под ключ, аудит устава, налоговая оптимизация.'
    : `Страница «${title}» — Школа Потребительской Кооперации. Обучение, услуги и консультации по созданию потребительских кооперативов по закону РФ № 3085-1.`)
  const defaultOgImage = isAboutUs 
    ? `${BASE_URL}/images/starkov_portrait.webp` 
    : `${BASE_URL}/images/og-preview.webp`
  const ogImage = (page as any).meta?.image?.url
    ? ((page as any).meta.image.url.startsWith('http')
        ? (page as any).meta.image.url
        : `${BASE_URL}${(page as any).meta.image.url}`)
    : defaultOgImage

  // Для about-us — используем полный title как на велеслав.рус
  // Для остальных страниц — добавляем бренд
  const finalTitle = isAboutUs
    ? 'О нас | Велеслав Старков — Первая онлайн школа Потребкооперации'
    : `${title} | велеслав.рус`

  return {
    title: {
      absolute: finalTitle,
    },
    description: finalDescription,
    keywords: 'потребительский кооператив, кооперация, онлайн-обучение, защита активов, налоговая оптимизация, Велеслав Старков, регистрация ПК, обнуление НДС, паевой взнос',
    openGraph: {
      title: isAboutUs ? 'Велеслав Старков — эксперт по потребительской кооперации | Школа ПК' : `${title} | велеслав.рус`,
      description: finalDescription,
      url: `${BASE_URL}/${slug}`,
      type: isAboutUs ? 'profile' : 'website',
      locale: 'ru_RU',
      siteName: 'Школа ПК — Велеслав Старков',
      images: [{ 
        url: ogImage, 
        width: isAboutUs ? 380 : 1200, 
        height: isAboutUs ? 507 : 630, 
        alt: isAboutUs ? 'Велеслав Старков — основатель Школы ПК' : `${title} | велеслав.рус`
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | велеслав.рус`,
      description: finalDescription,
      images: [{
        url: ogImage,
        alt: `${title} | велеслав.рус`,
      }],
      site: '@Veles_ST',
      creator: '@Veles_ST',
    },
    authors: isAboutUs ? [{ name: 'Велеслав Старков', url: `${BASE_URL}/about-us` }] : undefined,
    creator: isAboutUs ? 'Велеслав Старков' : undefined,
    publisher: 'Школа ПК — Первая онлайн Школа Потребительской Кооперации',
    alternates: {
      canonical: `${BASE_URL}/${slug}`,
      languages: {
        'ru-RU': `${BASE_URL}/${slug}`,
        'ru': `${BASE_URL}/${slug}`,
        'x-default': `${BASE_URL}/${slug}`,
      },
    },
    other: metaTags,
    robots: {
      // Тестовый домен — закрыть от индексации
      index: true,
      follow: true,
    },
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const page = await fetchPage(slug)

  if (!page) notFound()

  const blocks = (page as any).blocks || (page as any).layout || []
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0
  const pageContent = (page as any).content
  const hasContent = typeof pageContent === 'string' && pageContent.length > 0

  // GATING: вырезать videoUrl из steps-блоков для НЕзалогиненных.
  // Ловим лидов — видео доступно только после регистрации в ЛК.
  // cookies() автоматически делает роут dynamic (отказ от ISR) — это
  // намеренно: videoUrl не должен утекать в HTML/payload незалогиненным.
  const cookieStore = await cookies()
  const isAuthed = !!cookieStore.get('auth_token')?.value
  // Рекурсивно вырезать videoUrl из ЛЮБОГО блока (steps, video, cards и т.д.)
  function stripVideoUrls(obj: any): void {
    if (!obj || typeof obj !== "object") return
    if (Array.isArray(obj)) { obj.forEach(stripVideoUrls); return }
    if ("videoUrl" in obj) obj.videoUrl = undefined
    if ("thumbnailUrl" in obj) obj.thumbnailUrl = undefined
    // Ссылки-карточки на видео тоже gated (иначе videoUrl утекает через <a href>)
    if (typeof obj.link === "string" && /vkvideo\.ru/i.test(obj.link)) obj.link = undefined
    if (typeof obj.href === "string" && /vkvideo\.ru/i.test(obj.href)) obj.href = undefined
    for (const k of Object.keys(obj)) {
      if (obj[k] && typeof obj[k] === "object") stripVideoUrls(obj[k])
    }
  }
  if (!isAuthed && Array.isArray(blocks)) {
    stripVideoUrls(blocks)
  }

  // Для about-us: встраиваем контент из админки (page.content) ПЕРЕД блоком
  // "Моя философия". Ищем этот блок по заголовку.
  const isAboutUs = slug === 'about-us'
  let inlineContentIndex = -1
  if (isAboutUs && hasBlocks && hasContent) {
    inlineContentIndex = blocks.findIndex(
      (b: any) =>
        b?.blockType === 'text' &&
        typeof b?.title === 'string' &&
        b.title.trim() === 'Моя философия'
    )
  }
  const inlineBefore = inlineContentIndex > 0 ? blocks.slice(0, inlineContentIndex) : null
  const inlineAfter = inlineContentIndex > 0 ? blocks.slice(inlineContentIndex) : null

  // Рендер HTML-контента из админки в виде секции, стилистически совместимой
  // с остальной страницей.
  const renderInlineContent = () => (
    <section style={{ padding: '3rem 1.5rem', background: 'transparent' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div
          className="article-content"
          style={{ color: 'rgba(214,198,178,0.9)', lineHeight: 1.8, fontSize: '1rem' }}
          dangerouslySetInnerHTML={{ __html: pageContent }}
        />
      </div>
    </section>
  )

  return (
    <>
      <Header />
      <CursorLightLazy />
      <Breadcrumbs items={[
        { label: 'Главная', href: '/' },
        { label: (page as any).title || '' }
      ]} />
      <main style={{ paddingTop: '0', minHeight: '60vh' }}>
        {/* about-us: блоки -> контент -> блоки (разрез по "Моя философия") */}
        {isAboutUs && inlineBefore && inlineAfter ? (
          <>
            <BlockRenderer blocks={inlineBefore} />
            {renderInlineContent()}
            <BlockRenderer blocks={inlineAfter} />
          </>
        ) : (
          <>
            {hasBlocks && (
              <BlockRenderer blocks={blocks} />
            )}
            {hasContent && (
              <section style={{ padding: '0 1.5rem 4rem', maxWidth: 900, margin: '0 auto' }}>
                {!hasBlocks && (
                  <h1 className="heading-sweep" data-text={(page as any).title || ''} style={{ color: '#D6C6B2', marginBottom: '1.5rem', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>
                    {(page as any).title}
                  </h1>
                )}
                <div className="article-content" style={{ color: '#D6C6B2', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: pageContent }} />
              </section>
            )}
            {!hasBlocks && !hasContent && (
              <section style={{ padding: '0 1.5rem 4rem', maxWidth: 800, margin: '0 auto' }}>
                <h1 className="heading-sweep" data-text={(page as any).title || ''} style={{ color: '#D6C6B2', marginBottom: '1rem' }}>
                  {(page as any).title}
                </h1>
                <p style={{ color: 'rgba(214,198,178,0.75)', marginTop: '2rem', fontSize: '0.9rem' }}>
                  Страница пока не наполнена. Добавьте блоки в панели управления.
                </p>
              </section>
            )}
          </>
        )}
        {slug === 'pomosch-proektu' && (
          <section style={{ padding: '3rem 1.5rem 4rem' }}>
            <DonateForm />
          </section>
        )}
            <Footer />
    </main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { label: 'Главная', href: '/' },
        { label: (page as any).title || '' }
      ], 'https://велеслав.рус')) }} />

      {/* SEO Schema — только для about-us (E-E-A-T) */}
      {slug === 'about-us' && (
        <>
          {/* Person schema — Велеслав Старков */}
          <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            'name': 'Велеслав Старков',
            'jobTitle': 'Председатель Правления Потребительского кооператива',
            'worksFor': {
              '@type': 'Organization',
              'name': 'Школа ПК — Первая онлайн Школа Потребительской Кооперации',
            },
            'url': 'https://велеслав.рус/about-us',
            'image': 'https://велеслав.рус/images/starkov_portrait.webp',
            'telephone': '+79024720738',
            'email': 'boss@2980738.ru',
            'address': {
              '@type': 'PostalAddress',
              'addressCountry': 'RU',
              'addressLocality': 'Пермь',
              'streetAddress': 'ул. Фонтанная, д. 1а/1',
            },
            'knowsAbout': [
              'Потребительская кооперация',
              'Регистрация потребительского кооператива',
              'Аудит устава',
              'Налоговая оптимизация',
              'Защита активов',
              'Закон РФ № 3085-1',
              'ГК РФ ст. 123.1-123.3',
              'Целевые потребительские программы',
              'Паевые взносы',
              'Кооперативные выплаты',
            ],
            'sameAs': [
              'https://t.me/Veles_ST',
              'https://велеслав.рус',
            ],
            'alumniOf': {
              '@type': 'EducationalOrganization',
              'name': 'Самообразование в области потребительской кооперации',
            },
            'award': [
              '120+ зарегистрированных потребительских кооперативов',
              '10+ лет практики в потребительской кооперации',
              'Первая онлайн Школа потребительской кооперации в России',
            ],
            'description': 'Велеслав Старков — эксперт по потребительской кооперации с 2015 года. Председатель Правления ПК «ВМЕСТЕ Пермь». Создатель Первой онлайн Школы потребительской кооперации. 120+ зарегистрированных ПК, миллионы сэкономленных налогов, сотни защищённых активов.',
          }) }} />

          {/* FAQPage schema — расширенный */}
          <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'Кто такой Велеслав Старков?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Велеслав Старков — эксперт по потребительской кооперации с 2015 года, Председатель Правления ПК «ВМЕСТЕ Пермь», создатель Первой онлайн Школы потребительской кооперации в России. За 10+ лет практики зарегистрировал 120+ потребительских кооперативов.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Что такое Школа ПК?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Школа ПК (велеслав.рус) — Первая онлайн Школа потребительской кооперации в России. Платформа предлагает обучение, услуги по регистрации ПК под ключ, аудит устава, налоговую оптимизацию и защиту активов. Создана в 2015 году Велеславом Старковым.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Сколько стоит регистрация потребительского кооператива?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Стоимость регистрации ПК под ключ: тариф «Базовый» — 90 000 руб. (полный пакет документов, базовая Целевая программа), тариф «Персонифицированный» — 125 000 руб. (индивидуальная Целевая программа + 2 месяца консалтинга). Аудит устава: от 15 000 до 25 000 руб.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Сколько времени занимает создание ПК под ключ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Полный цикл занимает 25 рабочих дней: заполнение анкет (3 дня), разработка Устава (5-7 дней), подготовка 13 положений и 2 целевых программ (10 дней), регистрация в ФНС (3-5 рабочих дней). При тарифе «Персонифицированный» — приоритетная обработка до 5 рабочих дней.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Что входит в пакет «ПК под ключ»?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Полный пакет: индивидуальный Устав редакции 27-5, Протокол №1 учредительного собрания, заявление Р11001, 16 Положений (о паевых взносах, членстве, ЦПП, ревизионной комиссии и др.), 2 целевые потребительские программы (базовая + индивидуальная), 100+ рабочих документов (формы, журналы, акты, чек-листы). Плюс подача в ФНС, открытие счёта, выпуск ЭЦП.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Чем отличается тариф «Базовый» от «Персонифицированный»?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Тариф «Базовый» (90 000 руб.) включает полный пакет документов с базовой Целевой программой, без консалтингового сопровождения. Тариф «Персонифицированный» (125 000 руб.) дополнительно включает индивидуальную Целевую программу, разработанную под бизнес-план Заказчика, и 2 месяца консалтингового сопровождения деятельности ПК.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Какие налоги платит потребительский кооператив?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'ПК освобождён от НДС (ст. 149 НК РФ), налога на прибыль, НДФЛ с паевых взносов по Закону РФ № 3085-1. Уплачиваются: госпошлина при регистрации (0 руб. при электронной подаче), налог на имущество, земельный и транспортный налог. Кооперативная цена равна себестоимости — налоговая база может быть 0%.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Как начать работу с Школой ПК?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Зарегистрируйтесь в Личном кабинете на велеслав.рус, выберите услугу (ПК под ключ или Аудит устава), оплатите предоплату 50%. После этого скачайте 3 анкеты, заполните их и загрузите обратно. Исполнитель приступит к разработке документов в течение 1 рабочего дня.',
                },
              },
            ],
          }) }} />

          {/* WebPage schema */}
          <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            'name': 'О нас — Велеслав Старков и Школа ПК',
            'url': 'https://велеслав.рус/about-us',
            'description': 'Велеслав Старков — эксперт по потребительской кооперации с 2015 года. 120+ зарегистрированных ПК, первая онлайн Школа ПК.',
            'mainEntity': {
              '@type': 'Person',
              'name': 'Велеслав Старков',
            },
            'publisher': {
              '@type': 'EducationalOrganization',
              'name': 'Школа ПК',
              'url': 'https://велеслав.рус',
            },
          }) }} />
        </>
      )}
    </>
  )
}