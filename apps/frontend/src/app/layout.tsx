import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "./header-mobile.css";


const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
});

async function getSeoCode(): Promise<{ headCode: string | null; bodyCode: string | null }> {
  const empty = { headCode: null, bodyCode: null };
  try {
    const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";
    const res = await fetch(`${PAYLOAD_API_URL}/api/globals/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return empty;
    const data = await res.json();
    const seoCode = data?.seoCode || {};
    return {
      headCode: typeof seoCode.headCode === "string" && seoCode.headCode.trim() ? seoCode.headCode.trim() : null,
      bodyCode: typeof seoCode.bodyCode === "string" && seoCode.bodyCode.trim() ? seoCode.bodyCode.trim() : null,
    };
  } catch (e) {
    return empty;
  }
}

/**
 * Парсит мета-теги из HTML-строки и возвращает объект для metadata.other.
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

export async function generateMetadata(): Promise<Metadata> {
  const { headCode } = await getSeoCode();
  const metaTags = headCode ? parseMetaTags(headCode) : {};

  return {
    title: {
      default: "Потребительский кооператив | Школа ПК — Велеслав Старков",
      template: "%s | Школа ПК — Велеслав Старков",
    },
    description:
      "Потребительский кооператив — защита активов и ставка 0%. Обучение, услуги по закону РФ № 3085-1. Аудит устава ПК, регистрация под ключ, сопровождение при проверках ФНС.",
    keywords:
      "потребительский кооператив, кооперация, школа кооперативов, Велеслав Старков, регистрация кооператива, аудит устава, Закон 3085-1, обнуление НДС, паевой взнос",
    openGraph: {
      title: "Потребительский кооператив — защита активов и ставка 0%",
      description: "Первая онлайн Школа потребительской кооперации с 2015 года. Более 120 предпринимателей открыли свои ПК.",
      url: "https://велеслав.рус",
      siteName: "Школа ПК — Велеслав Старков",
      locale: "ru_RU",
      type: "website",
      images: [{ url: "https://велеслав.рус/images/og-preview.webp", width: 1200, height: 630, alt: "Первая онлайн школа ПК — Велеслав Старков" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Потребительский кооператив — защита активов и ставка 0%",
      description: "Первая онлайн Школа потребительской кооперации с 2015 года.",
      images: ["https://велеслав.рус/images/og-preview.webp"],
    },
    alternates: {
      canonical: "https://велеслав.рус",
      languages: {
        "ru-RU": "https://велеслав.рус",
        "ru": "https://велеслав.рус",
        "x-default": "https://велеслав.рус",
      },
    },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    // Мета-теги верификации из админки → попадают в <head>
    other: metaTags,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { bodyCode } = await getSeoCode();

  return (
    <html lang="ru" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <head>
        <meta name="twitter:label1" content="Телефон" />
        <meta name="twitter:data1" content="+7 (902) 472-07-38" />
        <meta name="twitter:label2" content="Telegram" />
        <meta name="twitter:data2" content="@Veles_ST" />
      </head>
      <body className="antialiased"><script dangerouslySetInnerHTML={{__html:"document.documentElement.classList.add('js')"}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Школа ПК — Первая онлайн Школа Потребительской кооперации",
          "alternateName": "Школа Кооперативов",
          "url": "https://велеслав.рус",
          "logo": "https://велеслав.рус/images/og-preview.webp",
          "description": "Первая онлайн Школа потребительской кооперации с 2015 года. Более 120 предпринимателей открыли свои ПК.",
          "foundingDate": "2015",
          "founder": {
            "@type": "Person",
            "name": "Велеслав Старков",
            "jobTitle": "Председатель Правления Потребительского кооператива",
            "url": "https://велеслав.рус"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "RU",
            "addressLocality": "Пермь",
            "streetAddress": "ул. Фонтанная, д. 1а/1"
          },
          "telephone": "+79024720738",
          "email": "boss@2980738.ru",
          "sameAs": [
            "https://t.me/Veles_ST"
          ]
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type": "Question", "name": "Что такое потребительский кооператив?", "acceptedAnswer": {"@type": "Answer", "text": "Потребительский кооператив (ПК) — некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников. Освобождён от НДС, налога на прибыль и НДФЛ с паевых взносов по Закону РФ № 3085-1."}},
            {"@type": "Question", "name": "Сколько времени занимает создание ПК под ключ?", "acceptedAnswer": {"@type": "Answer", "text": "Полный цикл занимает 10-14 дней: разработка устава, протокол учредительного собрания, целевая программа, регистрация в ФНС (3-5 рабочих дней)."}},
            {"@type": "Question", "name": "Какие налоги платит потребительский кооператив?", "acceptedAnswer": {"@type": "Answer", "text": "ПК освобождён от НДС (ст. 149 НК РФ), налога на прибыль, НДФЛ с паевых взносов. Уплачиваются: госпошлина при регистрации, налог на имущество, земельный и транспортный налог."}},
            {"@type": "Question", "name": "Правда ли что налоги могут быть 0%?", "acceptedAnswer": {"@type": "Answer", "text": "Да, это законно. Кооперативная цена равна себестоимости — налоговая база равна нулю. НДС, налог на прибыль, НДФЛ могут быть 0% при правильной организации деятельности ПК."}},
            {"@type": "Question", "name": "Как ПК защищает имущество?", "acceptedAnswer": {"@type": "Answer", "text": "ПК не отвечает по долгам пайщиков, а пайщики не отвечают по долгам ПК. Субсидиарная ответственность ограничена размером паевого взноса. Имущество кооператива принадлежит ему как юридическому лицу."}},
            {"@type": "Question", "name": "Что такое модель С500?", "acceptedAnswer": {"@type": "Answer", "text": "Авторская методика Велеслава Старкова, структурирующая процесс создания и ведения потребительского общества в пять этапов. Ни один ПК, созданный по модели С500, не был ликвидирован по решению ФНС."}}
          ]
        })}} />
{children}
        {bodyCode && <div dangerouslySetInnerHTML={{ __html: bodyCode }} />}
      </body>
    </html>
  );
}