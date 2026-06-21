import { AIProvider, ChatMessage, ChatOptions, ChatResponse, LeadSummaryInput, LeadSummary, SEOInput, SEOOutput, aiRegistry } from './provider';

export class MockProvider implements AIProvider {
  id = 'mock';
  name = 'Mock (fallback)';
  available = true;

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const msg = messages[messages.length - 1]?.content || '';
    let response = 'AI временно недоступен. Обратитесь через форму контактов.';
    if (msg.toLowerCase().includes('ндс') || msg.toLowerCase().includes('налог')) {
      response = 'ПК освобождён от НДС (ст. 149 НК РФ), налога на прибыль и НДФЛ с паевых взносов.';
    } else if (msg.toLowerCase().includes('кооператив')) {
      response = 'ПК — некоммерческая организация для удовлетворения материальных потребностей участников.';
    }
    return { content: response, tokensIn: 0, tokensOut: 0, provider: 'mock', model: 'mock' };
  }

  async summarizeLead(input: LeadSummaryInput): Promise<LeadSummary> {
    return { segment: 'individual', emergencyFlag: false, summary: input.message.slice(0, 120), recommendedAction: 'Связаться' };
  }

  async generateSEO(input: SEOInput): Promise<SEOOutput> {
    return { seoTitle: input.title.slice(0, 60), seoDescription: input.content.slice(0, 155), seoKeywords: input.keywords || [] };
  }
}

aiRegistry.register(new MockProvider());
