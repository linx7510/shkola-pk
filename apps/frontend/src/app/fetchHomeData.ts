// Server-side fetch — выполняется на сервере при SSR
export async function fetchHomeData(): Promise<any | null> {
  try {
    const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";
    const res = await fetch(
      `${PAYLOAD_API_URL}/api/pages?where[slug][equals]=home&depth=1&draft=false`,
      { 
        next: { revalidate: 86400 }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.docs?.[0] || null;
  } catch (e) {
    console.error('fetchHomeData error:', e);
    // Fallback: возвращаем минимальные данные вместо null
    // чтобы главная страница не была пустой при ошибке Payload
    return {
      id: 0,
      title: 'Школа ПК',
      slug: 'home',
      hero: {
        titleLine1: 'Потребительский кооператив',
        titleLine2: 'защита активов и ставка 0%',
        description: 'Первая онлайн Школа потребительской кооперации. Обучение, услуги по закону РФ № 3085-1.',
        ctaPrimaryText: 'Выбрать курс',
        ctaPrimaryLink: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn',
        ctaSecondaryText: 'Бесплатная консультация',
        ctaSecondaryLink: '/potrebitelskiy-kooperativ-konsultatsii',
      },
      advantages: [],
      stats: [],
      howSteps: [],
      aboutCards: [],
      services: [],
      faqItems: [],
      blocks: [],
    };
  }
}
