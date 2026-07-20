/**
 * filter-preview.ts — двухуровневый фильтр результатов аудита.
 *
 * Логика трипфайера (коммерческая):
 *   1. LLM делает ПОЛНЫЙ анализ устава → сохраняется в БД (для платной услуги);
 *   2. Клиенту показывается только КОРОТКОЕ ПРЕВЬЮ:
 *      — общий балл соответствия;
 *      — список из 5-8 ключевых проблем БЕЗ конкретики:
 *        ✗ БЕЗ точных цитат из устава клиента;
 *        ✗ БЕЗ номеров статей устава;
 *        ✗ БЕЗ конкретных рекомендаций по исправлению;
 *        ✗ БЕЗ развёрнутых описаний рисков.
 *      В превью остаётся только КАТЕГОРИЯ проблемы + severity + общий балл.
 *   3. Конкретика (что именно не так, как починить, формулировки) — в полном аудите.
 *
 * Так клиент видит, что проблемы ЕСТЬ, но не может их решить сам →
 * мотивация заказать платную услугу полного аудита.
 */

import type { FullAuditResult, AuditRisk } from './express-prompt'

/**
 * Публичное превью одной проблемы (без конкретики).
 */
export interface PreviewIssue {
  /** Категория проблемы — короткое название, 3-7 слов */
  title: string
  /** Серьёзность */
  severity: 'high' | 'medium' | 'low'
  /** Человеко-понятная категория для отображения */
  categoryLabel: string
}

/**
 * Публичное превью результата аудита (отдаётся на фронт).
 */
export interface AuditPreview {
  /** Общий балл соответствия 0-100 */
  complianceScore: number
  /** Цветовой тон балла для UI */
  scoreTone: 'green' | 'beige' | 'orange'
  /** Короткое резюме (1-2 предложения), без раскрытия деталей */
  summary: string
  /** Ключевые проблемы (3-7 штук), без конкретики */
  issues: PreviewIssue[]
  /** Количество найденных проблем всего (включая скрытые детали) */
  totalIssuesFound: number
  /** Количество отсутствующих разделов */
  missingSectionsCount: number
  /** Призыв к действию в зависимости от балла */
  ctaMessage: string
}

/**
 * Маппинг категорий аудита → человеко-понятные подписи для превью.
 * Используется ТОЛЬКО в превью, чтобы не раскрывать внутреннюю рубрикацию.
 */
const CATEGORY_LABELS: Record<string, string> = {
  'правовая-природа': 'Правовая природа и цель кооператива',
  'структура-пая': 'Структура паевого взноса и взносов',
  'новация': 'Механизм возврата паевого взноса (новация)',
  'запрет-займов': 'Заёмная деятельность',
  'налоги': 'Налоговая модель',
  'управление': 'Органы управления и кворумы',
  'крупные-сделки': 'Крупные сделки и конфликт интересов',
  'комплаенс': 'Комплаенс (ПДн, ПОД/ФТ, бухучёт)',
  'фонды': 'Фонды и имущество кооператива',
  'обжалование': 'Порядок обжалования решений',
}

/**
 * Резервная подпись, если LLM вернул неизвестную категорию.
 */
function labelForCategory(category: string): string {
  return CATEGORY_LABELS[category] || 'Правовая конструкция устава'
}

/**
 * Определяет цветовой тон балла (для UI).
 * Пороги как в эталонном дизайне Beige Neon:
 *   ≥ 70 — зелёный (хороший устав);
 *   40-69 — бежевый (есть проблемы, но рабочее);
 *   < 40 — терракотовый (серьёзные проблемы).
 */
function toneForScore(score: number): 'green' | 'beige' | 'orange' {
  if (score >= 70) return 'green'
  if (score >= 40) return 'beige'
  return 'orange'
}

/**
 * Формирует призыв к действию в зависимости от балла.
 * Цель — мотивировать заказать полный аудит.
 */
function ctaForScore(score: number, issuesCount: number): string {
  if (score >= 85 && issuesCount <= 2) {
    return 'Устав в хорошем состоянии, но мы рекомендуем полный аудит — найдём скрытые риски, которые не видит экспресс-проверка.'
  }
  if (score >= 60) {
    return `Найдено ${issuesCount} моментов для улучшения. Закажите полный аудит — получите конкретные формулировки исправлений со ссылками на статьи.`
  }
  if (score >= 40) {
    return `Обнаружено ${issuesCount} проблем. Полный аудит даст готовые правки текста устава со ссылкой на законы РФ — это защитит кооператив от доначислений и споров.`
  }
  return `Серьёзные риски: ${issuesCount} критических проблем. Срочно нужен полный аудит — без правок устава кооператив под угрозой переквалификации, налоговых доначислений и субсидиарной ответственности.`
}

/**
 * Сортировка проблем по серьёзности (high → medium → low).
 */
const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

/**
 * Главная функция: превращает полный результат аудита в публичное превью.
 *
 * Алгоритм:
 * 1. Сортируем риски по severity (сначала критичные).
 * 2. Берём топ-7 (хватит для впечатления, не перегрузит).
 * 3. В каждом оставляем только category-подпись + severity — БЕЗ description.
 * 4. Балл и summary пропускаем (они не раскрывают конкретику).
 * 5. Формируем CTA под тон балла.
 *
 * @param full — полный результат аудита (хранится в БД целиком)
 */
export function buildPreview(full: FullAuditResult): AuditPreview {
  const score = Math.max(0, Math.min(100, Math.round(full.compliance_score || 0)))

  // Сортируем риски по серьёзности
  const sortedRisks: AuditRisk[] = [...(full.risks || [])].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity] ?? 9
    const sb = SEVERITY_ORDER[b.severity] ?? 9
    return sa - sb
  })

  // Берём топ-7, оставляем только категорию + severity (без конкретики)
  const topRisks = sortedRisks.slice(0, 7)
  const issues: PreviewIssue[] = topRisks.map((r) => ({
    title: r.title || labelForCategory(r.category),
    severity: r.severity,
    categoryLabel: labelForCategory(r.category),
  }))

  const totalIssuesFound = (full.risks?.length || 0) + (full.missing_sections?.length || 0)
  const missingSectionsCount = full.missing_sections?.length || 0

  // summary пропускаем через обобщающую версию — без деталей
  const summary = generalizeSummary(full.summary, score)

  return {
    complianceScore: score,
    scoreTone: toneForScore(score),
    summary,
    issues,
    totalIssuesFound,
    missingSectionsCount,
    ctaMessage: ctaForScore(score, totalIssuesFound),
  }
}

/**
 * Обобщает summary LLM, убирая конкретику.
 * Если в summary есть цитаты или ссылки на пункты — заменяем на общий тон.
 */
function generalizeSummary(originalSummary: string, score: number): string {
  const s = (originalSummary || '').trim()
  if (!s) {
    if (score >= 70) return 'Устав в целом соответствует основным требованиям, но есть моменты для улучшения.'
    if (score >= 40) return 'В уставе есть ряд существенных пробелов и рисков, требующих внимания.'
    return 'В уставе обнаружены серьёзные правовые проблемы, требующие срочной доработки.'
  }

  // Если summary слишком длинное или содержит конкретику — обрезаем
  // и оставляем общий тон (без цитат, номеров статей, конкретных формулировок).
  let cleaned = s
  // Убираем прямые ссылки на пункты/статьи устава клиента
  cleaned = cleaned.replace(/п\.\s*\d[\d.\-]*\s*(статьи|пункта)?/gi, 'устава')
  cleaned = cleaned.replace(/ст\.?\s*\d[\d.\-]*/gi, 'устава')
  // Убираем кавычки-цитаты
  cleaned = cleaned.replace(/[«"][^»"]{15,}[»"]/g, 'конкретные формулировки')
  // Ограничиваем длину
  if (cleaned.length > 220) {
    cleaned = cleaned.slice(0, 217).replace(/\s+\S*$/, '') + '…'
  }
  return cleaned
}

/**
 * Проверяет, что результат аудита «валидный» (не пустой документ).
 * Используется, чтобы не показывать превью, если загружен не устав.
 */
export function isValidAuditResult(full: FullAuditResult): boolean {
  // Признак «не устав» из промпта: score 0 + специфический summary
  if (
    full.compliance_score === 0 &&
    /не является уставом|не распознан|не устав/i.test(full.summary || '')
  ) {
    return false
  }
  // Полностью пустой результат
  if (
    full.compliance_score === 0 &&
    (full.risks?.length || 0) === 0 &&
    (full.recommendations?.length || 0) === 0 &&
    !full.summary
  ) {
    return false
  }
  return true
}
