import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 301 редиректы со старого сайта velaslav.rus → 2980738.ru
  // ВАЖНО: сохраняем оригинальные URL для SEO. Каждая страница перенесена
  // на свой оригинальный URL (slug), а не на новый. Редиректы ниже — только
  // для URL которых больше нет (старые пакеты, удалённые страницы, и т.д.).
  async redirects() {
    return [
      // === Статические страницы ===
      { source: '/about-us', destination: '/', permanent: true },
      { source: '/onlayn-shkola-potrebitelskoy-kooperatsii', destination: '/', permanent: true },
      // /obuchenie-na-onlayn-kursah-potrebitelskoy-kooperatsii — старый URL, редирект на оригинальный URL страницы курсов
      { source: '/obuchenie-na-onlayn-kursah-potrebitelskoy-kooperatsii', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      // /kursy — короткий алиас, редирект на оригинальный URL (для удобства навигации)
      { source: '/kursy', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      // /courses — старый каталог, редирект на оригинальный URL
      { source: '/courses', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      { source: '/potrebitelskiy-kooperativ-vse-vygody', destination: '/', permanent: true },
      { source: '/kak-otkryt-kooperativ-potrebitelskiy-obschestvo-sdelat-poshagovaya-instruktsiya', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      { source: '/potrebitelskiy-kooperativ-konsultatsii', destination: '/konsultacii', permanent: true },
      { source: '/uslugi', destination: '/uslugi-dlya-potrebitelskih-kooperativov', permanent: true },
      { source: '/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa', destination: '/uslugi/audit-ustava', permanent: true },
      { source: '/pomosch-proektu', destination: '/', permanent: true },
      
      // === Курсы (пакеты) — старые промо-URL → оригинальный URL страницы курсов ===
      { source: '/paket-bazovyy', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      { source: '/paket-bazovyy-kursy-obucheniya-potrebkooperatsii-onlayn', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      { source: '/paket-optimalnyy', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      { source: '/paket-vip', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      { source: '/spetspredlozhenie-start', destination: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn', permanent: true },
      
      // === Видео-ответы → FAQ ===
      { source: '/video-answers', destination: '/faq', permanent: true },
      { source: '/video-answers/what-is-a-consumer-cooperative', destination: '/faq', permanent: true },
      
      // === Тестовые/служебные → главная ===
      { source: '/test', destination: '/', permanent: true },
      { source: '/test-donat', destination: '/', permanent: true },
      { source: '/2323', destination: '/', permanent: true },
      
      // === Алиасы навигации ===
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/konsultacii', destination: '/#contacts', permanent: true },
      { source: '/uslugi/audit-ustava', destination: '/uslugi-dlya-potrebitelskih-kooperativov', permanent: true },

      // === Блог: старые URL → новые (по slug) ===
      // Блоговые статьи перенесены с теми же slug, поэтому /blog/{slug} работает напрямую
      // Но старые не-блоговые статьи нужно redirect на /blog/{slug}
      { source: '/blog/yuridicheskaya-baza', destination: '/blog', permanent: true },
      { source: '/blog/nalogi-i-uchet', destination: '/blog', permanent: true },
      { source: '/blog/kejsy-istorii-uspekha', destination: '/blog', permanent: true },
      { source: '/blog/dokumenty-shablony', destination: '/blog', permanent: true },
      { source: '/blog/poleznaya-informatsiya', destination: '/blog', permanent: true },
    ]
  },
};

export default nextConfig;



