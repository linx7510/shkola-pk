import { AIProvider, ChatMessage, ChatOptions, ChatResponse, LeadSummaryInput, LeadSummary, SEOInput, SEOOutput, aiRegistry } from './provider';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = 'deepseek-chat';

export class DeepSeekAdapter implements AIProvider {
  id = 'deepseek';
  name = 'DeepSeek';
  available = !!DEEPSEEK_API_KEY;

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.available) throw new Error('DeepSeek API key not configured');
    const res = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    });
    if (!res.ok) throw new Error(`DeepSeek API error: ${res.status}`);
    const data = await res.json();
    return {
      content: data.choices[0]?.message?.content || '',
      tokensIn: data.usage?.prompt_tokens || 0,
      tokensOut: data.usage?.completion_tokens || 0,
      provider: 'deepseek',
      model: DEEPSEEK_MODEL,
    };
  }

  async summarizeLead(input: LeadSummaryInput): Promise<LeadSummary> {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'Ты — ассистент CRM. Верни JSON.' },
      { role: 'user', content: `Заявка: ${input.name}, ${input.message}. Верни JSON: {"segment":"...","emergencyFlag":false,"summary":"...","recommendedAction":"..."}` },
    ];
    const res = await this.chat(messages, { temperature: 0.2 });
    try { const m = res.content.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
    return { segment: 'individual', emergencyFlag: false, summary: input.message.slice(0, 120), recommendedAction: 'Связаться в течение рабочего дня' };
  }

  async generateSEO(input: SEOInput): Promise<SEOOutput> {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'Ты SEO-копирайтер. Верни JSON.' },
      { role: 'user', content: `Заголовок: ${input.title}. Верни JSON: {"seoTitle":"...","seoDescription":"...","seoKeywords":["..."]}` },
    ];
    const res = await this.chat(messages, { temperature: 0.5 });
    try { const m = res.content.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
    return { seoTitle: input.title.slice(0, 60), seoDescription: input.content.slice(0, 155), seoKeywords: input.keywords || [] };
  }
}

aiRegistry.register(new DeepSeekAdapter());
aiRegistry.setDefault('deepseek');
aiRegistry.setFallbackChain('chat', ['deepseek', 'mock']);
aiRegistry.setFallbackChain('summarizeLead', ['deepseek', 'mock']);
aiRegistry.setFallbackChain('generateSEO', ['deepseek', 'mock']);

export const deepseekProvider = new DeepSeekAdapter();

export async function chatWithAI(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
  return aiRegistry.getProviderForTask('chat').chat(messages, options);
}
