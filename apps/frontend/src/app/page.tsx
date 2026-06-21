import { fetchHomeData } from "./fetchHomeData";
import HomePageClient from "./HomePageClient";

export const revalidate = 60;

export default async function Page() {
  const homeData = await fetchHomeData();
  return <HomePageClient homeData={homeData} />;
}
