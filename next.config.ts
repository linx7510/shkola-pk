import type { NextConfig } from "next";

const KURSY_CANONICAL = "/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn";

const nextConfig: NextConfig = {
  // 301 редиректы со старого сайта veleslav.rus → 2980738.ru
  // Канонический URL курсов: /kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn
  async redirects() {
    return [
      // === Статические страницы ===
      { source: '/about-us', destination: '/', permanent: true },
      { source: '/onlayn-shkola-potrebitelskoy-kooperatsii', destination: '/', permanent: true },
      { source: '/potrebitelskiy-kooperativ-vse-vygody', destination: '/', permanent: true },
      { source: '/potrebitelskiy-kooperativ-konsultatsii', destination: '/konsultacii', permanent: true },
      { source: '/pomosch-proektu', destination: '/', permanent: true },

      // === Курсы: все варианты → канонический URL ===
      { source: '/kursy', destination: KURSY_CANONICAL, permanent: true },
      { source: '/courses', destination: KURSY_CANONICAL, permanent: true },
      { source: '/obuchenie-na-onlayn-kursah-potrebitelskoy-kooperatsii', destination: KURSY_CANONICAL, permanent: true },
      { source: '/kak-otkryt-kooperativ-potrebitelskiy-obschestvo-sdelat-poshagovaya-instruktsiya', destination: KURSY_CANONICAL, permanent: true },
      // Старые пакеты → канонический URL курсов
      { source: '/paket-bazovyy', destination: KURSY_CANONICAL, permanent: true },
      { source: '/paket-bazovyy-kursy-obucheniya-potrebkooperatsii-onlayn', destination: KURSY_CANONICAL, permanent: true },
      { source: '/paket-optimalnyy', destination: KURSY_CANONICAL, permanent: true },
      { source: '/paket-vip', destination: KURSY_CANONICAL, permanent: true },
      { source: '/spetspredlozhenie-start', destination: KURSY_CANONICAL, permanent: true },

      // === Услуги ===
      { source: '/uslugi-dlya-potrebitelskih-kooperativov', destination: '/uslugi', permanent: true },
      { source: '/uslugi-dlya-potrebitelskih-kooperativov/audit-ustava-potrebitelskogo-kooperativa', destination: '/uslugi/audit-ustava', permanent: true },
      { source: '/besplatno', destination: '/besplatno', permanent: true },

      // === Видео-ответы → FAQ ===
      { source: '/video-answers', destination: '/faq', permanent: true },
      { source: '/video-answers/what-is-a-consumer-cooperative', destination: '/faq', permanent: true },

      // === Тестовые/служебные → главная ===
      { source: '/test', destination: '/', permanent: true },
      { source: '/test-donat', destination: '/', permanent: true },
      { source: '/2323', destination: '/', permanent: true },

      // === Блог: старые URL → новые (по slug) ===
      { source: '/blog/yuridicheskaya-baza', destination: '/blog', permanent: true },
      { source: '/blog/nalogi-i-uchet', destination: '/blog', permanent: true },
      { source: '/blog/kejsy-istorii-uspekha', destination: '/blog', permanent: true },
      { source: '/blog/dokumenty-shablony', destination: '/blog', permanent: true },
      { source: '/blog/poleznaya-informatsiya', destination: '/blog', permanent: true },
    ]
  },
};

export default nextConfig;

