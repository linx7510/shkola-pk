/**
 * cache.ts — централизованная стратегия кэширования ISR
 * 
 * Все TTL-константы в одном месте.
 * Используется в page.tsx для revalidate и в API routes для Cache-Control.
 */

// === Страницы ===
export const CACHE_TTL = {
  /** Главная страница — часто обновляется */
  HOME: 60,
  /** Страница курсов — среднее обновление */
  COURSES: 300,
  /** Страницы услуг — стабильный контент */
  SERVICES: 600,
  /** FAQ — редко меняется */
  FAQ: 1800,
  /** Блог — обновляется при новых статьях */
  BLOG_LIST: 300,
  /** Отдельная статья — стабильна после публикации */
  BLOG_POST: 3600,
  /** О проекте — редко обновляется */
  ABOUT: 3600,
  /** Контакты — очень стабильные */
  CONTACTS: 3600,
  /** Глоссарий — стабильный справочник */
  GLOSSARY: 7200,
} as const;

// === API Cache-Control ===
export const API_CACHE = {
  /** Публичные readonly эндпоинты */
  PUBLIC_SHORT: "public, s-maxage=60, stale-while-revalidate=300",
  PUBLIC_MEDIUM: "public, s-maxage=300, stale-while-revalidate=600",
  PUBLIC_LONG: "public, s-maxage=1800, stale-while-revalidate=3600",
  /** Приватные эндпоинты (требуют авторизацию) */
  PRIVATE_NO_STORE: "private, no-store",
  /** Результаты форм — no cache */
  MUTATION: "no-store",
} as const;

// === Утилиты ===

/** Получить Cache-Control для типа страницы */
export function getCacheControl(pageType: keyof typeof CACHE_TTL): string {
  const ttl = CACHE_TTL[pageType];
  const swr = Math.min(ttl * 2, 3600);
  return "public, s-maxage=" + ttl + ", stale-while-revalidate=" + swr;
}

/** Получить revalidate значение для страницы */
export function getRevalidate(pageType: keyof typeof CACHE_TTL): number {
  return CACHE_TTL[pageType];
}

