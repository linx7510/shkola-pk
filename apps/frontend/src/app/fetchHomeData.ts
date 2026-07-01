// Server-side fetch — выполняется на сервере при SSR
export async function fetchHomeData(): Promise<any | null> {
  try {
    const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";
    const res = await fetch(
      `${PAYLOAD_API_URL}/api/pages?where[slug][equals]=home&depth=2&draft=false`,
      { 
        next: { revalidate: 86400 }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.docs?.[0] || null;
  } catch (e) {
    console.error('fetchHomeData error:', e);
    return null;
  }
}
