import { Metadata } from "next";
import Header from "@/components/Header";
import FaqListClient from "./FaqListClient";

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
      <FaqListClient items={items} />
    </>
  );
}
