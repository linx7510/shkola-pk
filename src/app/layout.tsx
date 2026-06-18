import type { Metadata } from "next";
import "./globals.css";
import "./header-mobile.css";

export const metadata: Metadata = {
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
    url: "https://2980738.ru",
    siteName: "Школа ПК — Велеслав Старков",
    locale: "ru_RU",
    type: "website",
    images: [{ url: "https://2980738.ru/images/og-preview.webp", width: 1200, height: 630, alt: "Первая онлайн школа ПК — Велеслав Старков" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Потребительский кооператив — защита активов и ставка 0%",
    description: "Первая онлайн Школа потребительской кооперации с 2015 года.",
    images: ["https://2980738.ru/images/og-preview.webp"],
  },
  alternates: {
    canonical: "https://2980738.ru",
    languages: {
      "ru-RU": "https://2980738.ru",
      "ru": "https://2980738.ru",
      "x-default": "https://2980738.ru",
    },
  },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      
        <meta name="twitter:label1" content="Телефон" />
        <meta name="twitter:data1" content="+7 (902) 472-07-38" />
        <meta name="twitter:label2" content="Telegram" />
        <meta name="twitter:data2" content="@Veles_ST" />
      </head>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Школа ПК — Первая онлайн Школа Потребительской кооперации",
          "alternateName": "Школа Кооперативов",
          "url": "https://2980738.ru",
          "logo": "https://2980738.ru/images/og-preview.webp",
          "description": "Первая онлайн Школа потребительской кооперации с 2015 года. Более 120 предпринимателей открыли свои ПК.",
          "foundingDate": "2015",
          "founder": {
            "@type": "Person",
            "name": "Велеслав Старков",
            "jobTitle": "Председатель Правления Потребительского кооператива",
            "url": "https://2980738.ru"
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
{children}</body>
    </html>
  );
}
