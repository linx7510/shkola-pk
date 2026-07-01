import { fetchHomeData } from "./fetchHomeData";
import HomePageClient from "./HomePageClient";

// Долгий кеш ISR — 24 часа, минимум пересчётов SSR
export const revalidate = 86400;

export default async function Page() {
  const homeData = await fetchHomeData();
  return <HomePageClient homeData={homeData} />;
}
