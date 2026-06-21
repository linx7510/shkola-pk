/**
 * Payload CMS API Client
 * 
 * Fetches data from the standalone Payload CMS backend.
 * Use this instead of direct Prisma calls.
 */

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001';
const PAYLOAD_PUBLIC_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://2980738.ru';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface PayloadQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  where?: Record<string, any>;
  depth?: number;
}

class PayloadClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = PAYLOAD_API_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `JWT ${this.token}`;
    return headers;
  }

  private buildQS(params: PayloadQueryParams = {}): string {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.sort) sp.set('sort', params.sort);
    if (params.depth !== undefined) sp.set('depth', String(params.depth));
    if (params.where) {
      Object.entries(params.where).forEach(([k, v]) => {
        sp.set(`where[${k}]`, JSON.stringify(v));
      });
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : '';
  }

  async find<T>(collection: string, params?: PayloadQueryParams): Promise<PayloadListResponse<T>> {
    const qs = this.buildQS(params);
    const res = await fetch(`${this.baseUrl}/api/${collection}${qs}`, {
      headers: this.getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
    return res.json();
  }

  async findByID<T>(collection: string, id: string, depth?: number): Promise<T> {
    const qs = depth !== undefined ? `?depth=${depth}` : '';
    const res = await fetch(`${this.baseUrl}/api/${collection}/${id}${qs}`, {
      headers: this.getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
    return res.json();
  }

  async findBySlug<T>(collection: string, slug: string, depth?: number): Promise<T | null> {
    const result = await this.find<T>(collection, {
      where: { slug: { equals: slug } },
      limit: 1,
      depth: depth || 1,
    });
    return result.docs[0] || null;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/${collection}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
    return res.json();
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/${collection}/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
    return res.json();
  }

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    this.token = data.token;
    return data;
  }

  // Convenience methods
  async getPosts(params?: PayloadQueryParams) {
    return this.find<any>('blog-posts', { ...params, depth: 1 });
  }
  async getPostBySlug(slug: string) {
    return this.findBySlug<any>('blog-posts', slug, 2);
  }
  async getGlossaryTerms(params?: PayloadQueryParams) {
    return this.find<any>('glossary-terms', params);
  }
  async getGlossaryBySlug(slug: string) {
    return this.findBySlug<any>('glossary-terms', slug, 1);
  }
  async getFaqs(params?: PayloadQueryParams) {
    return this.find<any>('faq-items', params);
  }
  async getCourses(params?: PayloadQueryParams) {
    return this.find<any>('courses', { ...params, depth: 1 });
  }
  async getCourseBySlug(slug: string) {
    return this.findBySlug<any>('courses', slug, 2);
  }
  async getServices(params?: PayloadQueryParams) {
    return this.find<any>('services', params);
  }
  async getLeads(params?: PayloadQueryParams) {
    return this.find<any>('leads', params);
  }
  async createLead(data: { name: string; email?: string; phone?: string; message?: string; source?: string }) {
    return this.create('leads', data);
  }
  async getPages(params?: PayloadQueryParams) {
    return this.find<any>('pages', { ...params, depth: 2 });
  }
  async getPageBySlug(slug: string) {
    return this.findBySlug<any>('pages', slug, 2);
  }
  async getSettings() {
    const res = await fetch(`${this.baseUrl}/api/globals/settings`, {
      headers: this.getHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
    return res.json();
  }
}

export const payloadClient = new PayloadClient();

export function createPayloadClient(token?: string): PayloadClient {
  const client = new PayloadClient(PAYLOAD_PUBLIC_URL);
  if (token) client.setToken(token);
  return client;
}

export type { PayloadClient, PayloadQueryParams };
