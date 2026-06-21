/**
 * DeepSeek AI Adapter
 * Реальный LLM integration для плана v5.4 (Принцип 2: AI без vendor lock-in)
 * 
 * Используется для:
 * - AI-генерация SEO (meta title, description, keywords)
 * - AI-резюме лидов
 * - AI-консультант (чат-бот)
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  tokensIn: number;
  tokensOut: number;
}

/**
 * Вызывает DeepSeek API для чата
 */
export async function chatWithAI(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<ChatResponse> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY не настроен');
  }

  const res = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.4,
      max_tokens: options?.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    tokensIn: data.usage?.prompt_tokens || 0,
    tokensOut: data.usage?.completion_tokens || 0,
  };
}

/**
 * Генерация SEO-тегов для страницы
 */
export async function generateSEO(input: {
  title: string;
  content: string;
  keywords?: string[];
}): Promise<{
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Ты SEO-редактор. Сгенерируй мета-теги для страницы. title ≤ 60 символов, description 140-160 символов, 5-7 ключевых слов. Верни JSON.',
    },
    {
      role: 'user',
      content: `Заголовок страницы: ${input.title}\nСодержание: ${input.content.slice(0, 2000)}\nКлючевые слова (подсказка): ${input.keywords?.join(', ') || '—'}\n\nВерни JSON: {"seoTitle":"...","seoDescription":"...","seoKeywords":["..."]}`,
    },
  ];

  const res = await chatWithAI(messages, { temperature: 0.4 });
  
  try {
    const jsonMatch = res.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}
  
  return {
    seoTitle: input.title.slice(0, 60),
    seoDescription: input.content.slice(0, 155),
    seoKeywords: input.keywords || [],
  };
}

/**
 * AI-резюме лида
 */
export async function summarizeLead(input: {
  name: string;
  message: string;
  email: string;
  phone?: string;
  source?: string;
}): Promise<{
  segment: string;
  emergencyFlag: boolean;
  summary: string;
  recommendedAction: string;
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Ты — ассистент CRM образовательной платформы «Школа ПК». Проанализируй заявку и верни JSON.',
    },
    {
      role: 'user',
      content: `Заявка:\nИмя: ${input.name}\nEmail: ${input.email}\nТелефон: ${input.phone || '—'}\nИсточник: ${input.source || 'website'}\nСообщение: ${input.message}\n\nВерни JSON: {"segment":"individual|corporate|cooperative|emergency","emergencyFlag":boolean,"summary":"краткое резюме","recommendedAction":"что делать менеджеру"}`,
    },
  ];

  const res = await chatWithAI(messages, { temperature: 0.2 });
  
  try {
    const jsonMatch = res.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}
  
  return {
    segment: 'individual',
    emergencyFlag: false,
    summary: input.message.slice(0, 120),
    recommendedAction: 'Связаться в течение рабочего дня',
  };
}
