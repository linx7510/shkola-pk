import type { Metadata } from "next";
import Script from "next/script";
import LazyAIChatButton from "@/components/LazyAIChatButton";
// System fonts — 0 KB download (was 169 KB with Inter + IBM Plex Mono)
const inter = { variable: "" };
import "./globals.css";
import "./header-mobile.css";




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


// Yandex.Metrika counter ID — loaded via next/script strategy="lazyOnload"
// (does NOT block main thread during initial render)
const METRIKA_ID = "53164504";

export async function generateMetadata(): Promise<Metadata> {
  const { headCode } = await getSeoCode();
  const metaTags = headCode ? parseMetaTags(headCode) : {};

  return {
    title: {
      default: "Потребительский кооператив | Школа ПК — Велеслав Старков",
      template: "%s | Школа ПК",
    },
    description:
      "Первая онлайн Школа потребительской кооперации с 2015 года: обучение, регистрация ПК под ключ, аудит устава. Более 120 открытых кооперативов.",
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
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <meta name="twitter:label1" content="Телефон" />
        <meta name="twitter:data1" content="+7 (902) 472-07-38" />
        <meta name="twitter:label2" content="Telegram" />
        <meta name="twitter:data2" content="@Veles_ST" />
      </head>
      <body className="antialiased"><script dangerouslySetInnerHTML={{__html:"document.documentElement.classList.add('js')"}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "велеслав.рус — Школа потребительской кооперации",
        url: "https://велеслав.рус",
        inLanguage: "ru-RU",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: "https://велеслав.рус/search?q={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      }) }} />
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
            "https://t.me/Veles_ST",
            "https://t.me/OnlinePK",
            "https://vk.com/cooperator",
            "https://www.youtube.com/@cooperator",
            "https://max.ru/u/f9LHodD0cOKoJeahlW2e_QrZqOFT3vHtWNUaE6bXRA257SbTnHEcooDh90o"
          ]
        })}} />
{children}
        {bodyCode && <div dangerouslySetInnerHTML={{ __html: bodyCode }} />}
        <LazyAIChatButton />
        {/* Yandex.Metrika counter — strategy="afterInteractive" для немедленного запуска */}
        <Script id="yandex-metrika-init" strategy="afterInteractive">
          {`(function(){
            var started = false;
            function startMetrika() {
              if (started) return; started = true;
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${METRIKA_ID}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            }
            // Тяжёлый скрипт Метрики стартует по первому действию посетителя
            // или через 4с после load — не мешает LCP/TBT, но фиксирует визит
            var evts = ["pointerdown","keydown","touchstart","scroll","wheel"];
            evts.forEach(function(e){ addEventListener(e, startMetrika, {once:true, passive:true}); });
            addEventListener("load", function(){ setTimeout(startMetrika, 4000); });
            setTimeout(startMetrika, 10000);
          })();`}
        </Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
              width={1}
              height={1}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
      </body>
    </html>
  );
}