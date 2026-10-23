// Общий модуль блога: данные и константы для /blog и /blog/page/[page]
// (page-файлы Next не должны экспортировать произвольные сущности)

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

export const PAGE_URL = "https://велеслав.рус/blog";
export const PAGE_TITLE = "Блог о потребительской кооперации | Школа ПК";
export const PAGE_DESCRIPTION = "Статьи о потребительских кооперативах: налоги и обнуление НДС, закон № 3085-1, защита активов, запуск и сопровождение ПК. Кейсы и судебная практика.";

export const PAGE_SIZE = 24;

export async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

export interface BlogListPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | { url: string; alt?: string; width?: number; height?: number } | null;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export async function fetchAllPosts(): Promise<BlogListPost[]> {
  // Лёгкий кастомный эндпоинт Payload (~50 КБ): полный REST отдавал 2,3 МБ со всеми
  // текстами статей и не кэшировался Next data cache
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api/blog-posts-light`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      return (data.docs || []).map((p: any) => ({
        ...p,
        publishedAt: p.publishedAt || p.createdAt,
      }));
    }
  } catch {}
  // фолбэк на стандартный REST
  const data = await payloadApi("/blog-posts?where[isPublished][equals]=true&sort=-publishedAt&depth=1&limit=100");
  return (data.docs || []).map((p: any) => ({
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || null,
    coverImage: p.coverImage || null,
    category: (typeof p.category === 'object' && p.category ? p.category.title : p.category) || null,
    tags: p.tags || null,
    publishedAt: p.publishedAt || p.createdAt,
    createdAt: p.createdAt,
  }));
}

// ============================================================
// Кластеризация блога — утверждена Велеславом 24.10:
// 5 тем, в каждой главная статья + сателлиты (35/35 статей).
// Категории в БД НЕ меняем — состав кластеров задаётся здесь.
// ============================================================
export interface BlogCluster {
  slug: string;
  title: string;
  description: string;
  main: string; // slug главной статьи
  members: string[]; // slug'и сателлитов (без главной)
}

export const BLOG_CLUSTERS: BlogCluster[] = [
  {
    slug: "nds",
    title: "Бизнес и обнуление НДС",
    description: "Как бизнес через потребительский кооператив уходит от исходящего НДС: механика, расчёты, судебная практика и риски.",
    main: "obnulenie-nds-cherez-potrebitelskiy-kooperativ",
    members: [
      "paevye-vznosy-i-nds-v-2026-godu-raz-yasneniya-dlya-chlenov-potrebitelskih-kooperativov",
      "riski-potrebitelskogo-kooperativa-nds-golden-axis",
      "potrebitelskiy-kooperativ-dlya-biznesa-2026-zakonnoe-obnulenie-nds",
      "kak-poluchit-besprocentnye-investicii-cherez-pk",
      "kooperativ-kak-korporaciya-byd-tolko-luchshe",
    ],
  },
  {
    slug: "zapusk",
    title: "Запуск кооператива",
    description: "Регистрация ПК с нуля до первого собрания: устав, положения, целевые программы, автоматизация.",
    main: "kooperativ-pod-klyuch-polnoe-rukovodstvo-2026",
    members: [
      "kak-otkryt-kooperativ-v-2026",
      "kak-otkryt-sobstvennyy-potrebitelskiy-kooperativ",
      "polozheniya-potrebitelskogo-kooperativa-polnyj-komplekt-2026",
      "ustav-potrebitelskogo-kooperativa-kak-sostavit",
      "celevie-potrebitelskie-programmy-pk",
      "sajt-dlya-kooperativa-avtomatizaciya-raboty-menedzherov",
    ],
  },
  {
    slug: "pravo",
    title: "Право",
    description: "Защита активов, субсидиарная ответственность, закон № 3085-1 и судебная практика без розовых очков.",
    main: "zaschita-imuschestva-potrebitelskiy-kooperativ",
    members: [
      "subsidiarnaya-otvetstvennost-payschika-potrebitelskogo-kooperativa",
      "audit-ustava-pk-riski-subsidiarka",
      "kak-proverit-kooperativ-na-moshennichestvo",
      "pk-vne-zakona-obnal-cherez-kooperativ",
      "gde-dengi-v-potrebitelskom-kooperate",
      "legalizatsiya-proishozhdeniya-deneg-iz-za-granitsy-usdt-v-rubl",
    ],
  },
  {
    slug: "nalogi",
    title: "Налоги и учёт",
    description: "Какие налоги платит ПК и от каких освобождён: НДФЛ, онлайн-кассы, бухучёт некоммерческого контура.",
    main: "nalogi-potrebitelskogo-kooperativa",
    members: [
      "net-ndfl-pri-vozvrate-paya-potrebitelskiy-kooperativ",
      "onlayn-kassy-ne-nuzhny-potrebitelskie-kooperativy",
      "buhgalter-dlya-potrebitelskogo-kooperativa",
      "kooperativ-eto-nekommercheskaya-ili-kommercheskaya-organizatsiya",
    ],
  },
  {
    slug: "novichkam",
    title: "Новичкам",
    description: "Потребительская кооперация простыми словами: что это, как работает, чем отличается от ООО.",
    main: "potrebitelskie-kooperativy-v-rossii-chto-eto-takoe",
    members: [
      "potrebitelskiy-kooperativ-prosto-2026",
      "kak-rabotaet-potrebitelskiy-kooperativ-2026",
      "potrebitelskiy-kooperativ-i-zakon",
      "20-glavnyh-terminov-kooperatsii",
      "11-vidov-potrebitelskih-kooperativov-v-rossii",
      "10-preimuschestv-potrebitelskogo-kooperativa",
      "potrebitelskie-kooperativy-rossiyskiy-opyt",
      "neobhodimo-obuchenie-kooperatsii-v-pervoy-onlayn-shkole-potrebitelskoy-kooperatsii",
      "potrebitelskiy-kooperativ-kak-biznes",
    ],
  },
];

/** Кластер статьи (по slug) — для плашки перелинковки в статьях. */
export function clusterOfArticle(slug: string): { cluster: BlogCluster; isMain: boolean } | null {
  for (const c of BLOG_CLUSTERS) {
    if (c.main === slug) return { cluster: c, isMain: true };
    if (c.members.includes(slug)) return { cluster: c, isMain: false };
  }
  return null;
}
