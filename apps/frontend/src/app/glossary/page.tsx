import { Metadata } from "next";
import Header from "@/components/Header";
import GlossaryListClient from "./GlossaryListClient";
import AIConsultant from "@/components/AIConsultant";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { cache: 'no-store' });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

export const metadata: Metadata = {
  title: "Глоссарий | Школа ПК",
  description: "Ключевые термины и понятия потребительской кооперации",
};

export default async function GlossaryPage() {
  const data = await payloadApi("/glossary-terms?where[isPublished][equals]=true&sort=order&limit=100");
  const terms = (data.docs || []).map((t: any) => ({
    id: String(t.id),
    term: t.term,
    slug: t.slug,
    definition: t.definition || '',
    category: t.category || null,
  }));

  return (
    <>
      <Header />
      <GlossaryListClient terms={terms} />
      <AIConsultant />
    </>
  );
}
