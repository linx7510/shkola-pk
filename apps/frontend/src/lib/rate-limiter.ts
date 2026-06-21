/**
 * rate-limiter.ts — in-memory rate limiter для защиты auth endpoints
 * 
 * Защищает от brute-force атак на login/register.
 * Хранит счётчики в памяти процесса (достаточно для single-instance PM2).
 * 
 * Лимиты:
 * - login: 5 попыток / 15 минут
 * - register: 3 попытки / час
 * - password-reset: 3 попытки / час
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Периодическая очистка мертвых записей (каждые 10 минут)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Максимальное количество запросов в окне */
  maxAttempts: number;
  /** Размер окна в миллисекундах */
  windowMs: number;
}

export const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },        // 5 / 15 мин
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },     // 3 / час
  'password-reset': { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 / час
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Проверить лимит для IP + action
 */
export function checkRateLimit(
  ip: string,
  action: keyof typeof RATE_LIMITS
): RateLimitResult {
  const config = RATE_LIMITS[action];
  const key = "" + action + ":" + ip;
  const now = Date.now();
  
  const entry = store.get(key);
  
  if (!entry || now > entry.resetAt) {
    // Новое окно
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, newEntry);
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt: newEntry.resetAt };
  }
  
  if (entry.count >= config.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  
  entry.count++;
  return { allowed: true, remaining: config.maxAttempts - entry.count, resetAt: entry.resetAt };
}

/**
 * Получить IP из NextRequest
 */
export function getClientIp(request: { headers: { get: (name: string) => string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

