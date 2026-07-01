import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";

// System fonts — 0 KB download (was 214 KB with Inter)
const inter = { variable: "" };
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/blocks.css";
import "./styles/animations.css";
import "./styles/components.css";
import "./header-mobile.css";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const FloatingChatButton = dynamic(() => import("@/components/FloatingChatButton"), { loading: () => null });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { loading: () => null });
const GlobalParticles = dynamic(() => import("@/components/BlogParticles"), { loading: () => null });
const CursorLight = dynamic(() => import("@/components/CursorLight"), { loading: () => null });

export const metadata: Metadata = {
  title: {
    default: "Потребительский кооператив | Школа ПК — Велеслав Старков",
    template: "%s | Школа ПК — Велеслав Старков",
  },
  description:
    "Потребительский кооператив — защита активов и ставка 0%. Обучение, услуги по закону РФ № 3085-1. Аудит устава ПК, регистрация под ключ, сопровождение при проверках ФНС.",
  keywords:
    "потребительский кооператив, кооперация, школа кооперативов, Велеслав Старков, регистрация кооператива, аудит устава, Закон 3085-1, обнуление НДС, паевой взнос",
  authors: [{ name: "Велеслав Старков", url: "https://2980738.ru/about-us" }],
  creator: "Велеслав Старков",
  publisher: "Школа ПК — Первая онлайн Школа Потребительской Кооперации",
  applicationName: "Школа ПК",
  category: "education",
  formatDetection: { telephone: true, email: true, address: true },
  manifest: "/manifest.json",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/images/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

const METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "53164504";

export const viewport = {
  themeColor: "#0D0C0A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") || "";

  return (
    <html lang="ru">
      <head>
        {/* Preload LCP image — hero logo (35KB webp) */}
        <link rel="preload" as="image" href="/images/hero-logo.webp" fetchPriority="high" />
        {/* Preconnect to Yandex Metrika origin (saves DNS+TLS on tag.js fetch) */}
        {/* Yandex Metrika preconnect убран — скрипт грузится через requestIdleCallback */}
        {/* Preconnect только к Yandex Metrika — единственный 3rd party JS */}


      </head>
      <body className={`antialiased ${inter.variable}`} style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <script dangerouslySetInnerHTML={{__html:"document.documentElement.classList.add('js')"}} nonce={nonce} />
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{__html: JSON.stringify({
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
          "sameAs": ["https://t.me/Veles_ST"]
        })}} />
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{__html: JSON.stringify({
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

        <Footer />
        <GlobalParticles />
        <CursorLight />
        <FloatingChatButton />

        {/* Yandex.Metrika counter — strategy="lazyOnload" loads during browser idle time,
            does NOT block main thread during initial render.
            Initial pageview still tracked via inline ym() call below. */}
        <Script id="yandex-metrika-init" strategy="lazyOnload" nonce={nonce}>
          {`window.addEventListener('load', function() {
            requestIdleCallback(function() {
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");ym(${METRIKA_ID}, "init", {trackLinks:true,accurateTrackBounce:true,defer:true});
            }, {timeout: 5000});
          });`}
        </Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        <CookieConsent />
      </body>
    </html>
  );
}
