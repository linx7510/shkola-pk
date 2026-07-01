import { Metadata } from "next";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Breadcrumbs from "@/components/Breadcrumbs"
import Header from "@/components/Header";
import GlossaryListClient from "./GlossaryListClient";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { next: { revalidate: 300 } });
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
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "Глоссарий" }
      ]} />
      <GlossaryListClient terms={terms} />
    </>
  );
}
