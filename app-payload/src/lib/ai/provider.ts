/**
 * AI Abstraction Layer — Принцип 2 плана v5.4
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  tokensIn: number;
  tokensOut: number;
  provider: string;
  model: string;
}

export interface LeadSummaryInput {
  name: string;
  message: string;
  email: string;
  phone?: string;
  source?: string;
}

export interface LeadSummary {
  segment: string;
  emergencyFlag: boolean;
  summary: string;
  recommendedAction: string;
}

export interface SEOInput {
  title: string;
  content: string;
  keywords?: string[];
}

export interface SEOOutput {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export type AITask = 'chat' | 'summarizeLead' | 'generateSEO' | 'classifyLead' | 'draftArticle';

export interface AIProvider {
  id: string;
  name: string;
  available: boolean;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  summarizeLead(input: LeadSummaryInput): Promise<LeadSummary>;
  generateSEO(input: SEOInput): Promise<SEOOutput>;
}

export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProviderId: string = '';
  private fallbackChain: Record<AITask, string[]> = {
    chat: [], summarizeLead: [], generateSEO: [], classifyLead: [], draftArticle: [],
  };

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
    if (!this.defaultProviderId) this.defaultProviderId = provider.id;
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  getDefault(): AIProvider {
    return this.providers.get(this.defaultProviderId)!;
  }

  setDefault(id: string): void {
    if (this.providers.has(id)) this.defaultProviderId = id;
  }

  setFallbackChain(task: AITask, providerIds: string[]): void {
    this.fallbackChain[task] = providerIds;
  }

  getFallbackChain(task: AITask): string[] {
    return this.fallbackChain[task];
  }

  getProviderForTask(task: AITask): AIProvider {
    const defaultProvider = this.getDefault();
    if (defaultProvider?.available) return defaultProvider;
    for (const id of this.fallbackChain[task] || []) {
      const provider = this.providers.get(id);
      if (provider?.available) return provider;
    }
    for (const provider of this.providers.values()) {
      if (provider.available) return provider;
    }
    return defaultProvider;
  }

  listProviders(): { id: string; name: string; available: boolean }[] {
    return Array.from(this.providers.values()).map(p => ({ id: p.id, name: p.name, available: p.available }));
  }
}

export const aiRegistry = new AIProviderRegistry();
