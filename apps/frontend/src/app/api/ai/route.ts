import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-deepseek';

// POST /api/ai — AI-консультант (реальный DeepSeek)
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''
  
  try {
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Сообщение обязательно' }, { status: 400 });
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'Ты — AI-консультант Школы Потребительских Кооперативов. Помогаешь разобраться с потребительской кооперацией по закону РФ № 3085-1. Отвечай кратко, понятно и по делу. Если вопрос вне темы кооперации — вежливо верни к теме.',
      },
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const res = await chatWithAI(messages, { temperature: 0.6, maxTokens: 512 });
    
    return NextResponse.json({ 
      response: res.content,
      tokensUsed: res.tokensIn + res.tokensOut,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[/api/ai] error:', error);
    
    // Fallback — простая заглушка если DeepSeek недоступен
    let fallback = 'Извините, AI-консультант временно недоступен. Попробуйте позже или задайте вопрос через форму контактов.';
    
    try {
      const body = await request.json();
      const msg = body.message || '';
      const lower = msg.toLowerCase();
      
      if (lower.includes('ндс') || lower.includes('налог')) {
        fallback = 'Потребительский кооператив освобождён от НДС (ст. 149 НК РФ), налога на прибыль и НДФЛ с паевых взносов по закону РФ № 3085-1. Это законно — кооперативная цена равна себестоимости, налоговая база равна нулю.';
      } else if (lower.includes('кооператив') || lower.includes('что такое')) {
        fallback = 'Потребительский кооператив (ПК) — некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников. В отличие от ООО, ПК не преследует извлечение прибыли и освобождён от ряда налогов.';
      }
    } catch {}
    
    return NextResponse.json({ 
      response: fallback, 
      fallback: true,
      latencyMs: Date.now() - startTime,
    });
  }
}
