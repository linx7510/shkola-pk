import type { Metadata } from "next";
import { fetchHomeData } from "./fetchHomeData";
import HomePageClient from "./HomePageClient";

// ISR cache 24h
export const revalidate = 86400;

function parseMetaTags(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<meta\s+name="([^"]+)"\s+content="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    result[match[1]] = match[2];
  }
  return result;
}

async function getGlobalMetaTags(): Promise<Record<string, string>> {
  try {
    const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";
    const res = await fetch(`${PAYLOAD_API_URL}/api/globals/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const headCode = data?.seoCode?.headCode;
    if (typeof headCode === "string" && headCode.trim()) {
      return parseMetaTags(headCode.trim());
    }
    return {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const HOME_DATA = await fetchHomeData();
  const GLOBAL_TAGS = await getGlobalMetaTags();
  const headCode = (HOME_DATA as any)?.headCode || (HOME_DATA as any)?.seoHeadCode || "";
  const pageMetaTags = headCode ? parseMetaTags(headCode) : {};
  const metaTags = Object.assign({}, GLOBAL_TAGS, pageMetaTags);
  return {
    other: metaTags,
  };
}

const FAQ_JSON_LD = {
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
};

export default async function Page() {
  const homeData = await fetchHomeData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <HomePageClient homeData={homeData} />
    </>
  );
}
