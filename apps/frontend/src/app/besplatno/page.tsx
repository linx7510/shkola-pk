import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { BlockRenderer } from "@/components/BlockRenderer";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_API_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=2&limit=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.docs?.[0] ?? null;
  } catch { return null; }
}

export default async function BesplatnoPage() {
  const page = await fetchPage("besplatno");
  if (!page) notFound();
  const blocks = (page as any).blocks || (page as any).layout || [];
  return (
    <>
      <Header />
      <main style={{ paddingTop: "5rem", minHeight: "60vh" }}>
        {Array.isArray(blocks) && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <section style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
            <h1 style={{ color: "#D6C6B2" }}>{(page as any).title}</h1>
          </section>
        )}
      </main>
    </>
  );
}
