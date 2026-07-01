import { Metadata } from "next";
export const revalidate = 300; // ISR: revalidate every 5 minutes
import Breadcrumbs from "@/components/Breadcrumbs"
import Header from "@/components/Header";
import FaqListClient from "./FaqListClient";

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
  title: "FAQ | Школа ПК",
  description: "Ответы на популярные вопросы о потребительских кооперативах",
};

function extractTextFromLexical(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (content.root?.children) {
    return content.root.children
      .map((child: any) => {
        if (child.children) {
          return child.children.map((c: any) => c.text || '').join('');
        }
        return child.text || '';
      })
      .join('\n');
  }
  return '';
}

export default async function FaqPage() {
  const data = await payloadApi("/faq-items?sort=order&limit=100");
  const items = (data.docs || []).map((item: any) => ({
    id: String(item.id),
    question: item.question,
    answer: extractTextFromLexical(item.answer),
    category: item.category || null,
  }));

  return (
    <>
      <Header />
      <Breadcrumbs items={[
        { label: "Главная", href: "/" },
        { label: "FAQ" }
      ]} />
      <FaqListClient items={items} />
    </>
  );
}
