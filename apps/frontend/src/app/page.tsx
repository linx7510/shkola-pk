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

export default async function Page() {
  const homeData = await fetchHomeData();
  return <HomePageClient homeData={homeData} />;
}
