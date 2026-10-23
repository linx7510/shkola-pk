"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface BlogPost {
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

interface Props {
  /** посты текущей страницы (серверная пагинация) */
  posts: BlogPost[];
  /** все посты — для фильтра категорий и блока «Все статьи» */
  allPosts: BlogPost[];
  currentPage: number;
  totalPages: number;
}

const pageHref = (n: number) => (n <= 1 ? "/blog" : `/blog/page/${n}`);

// Темы блога (кластеризация, утверждена 24.10) — ссылки на хабы
const BLOG_TOPICS: { title: string; href: string }[] = [
  { title: "Бизнес и обнуление НДС", href: "/blog/tema/nds" },
  { title: "Запуск кооператива", href: "/blog/tema/zapusk" },
  { title: "Право", href: "/blog/tema/pravo" },
  { title: "Налоги и учёт", href: "/blog/tema/nalogi" },
  { title: "Новичкам", href: "/blog/tema/novichkam" },
];

export default function BlogListClient({ posts, allPosts, currentPage, totalPages }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — reveal анимация карточек
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.blog-card, .blog-featured__card');
    if (!cards || cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [activeCategory, currentPage, posts]);

  const categories = [...new Set(allPosts.map((p) => p.category).filter(Boolean))] as string[];
  // при активной категории показываем все её посты (их немного), иначе — посты текущей страницы
  const filtered = activeCategory ? allPosts.filter((p) => p.category === activeCategory) : posts;

  const showFeatured = currentPage === 1 && !activeCategory;
  const featuredPost = showFeatured && filtered.length > 0 ? filtered[0] : null;
  const restPosts = showFeatured && featuredPost ? filtered.slice(1) : filtered;

  const paginationBtn = (active: boolean, disabled = false) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: "2.4rem", height: "2.4rem", padding: "0 0.75rem", borderRadius: 10,
    fontSize: "1rem", textDecoration: "none", cursor: disabled ? "default" : "pointer",
    border: `1px solid ${active ? "rgba(230,136,99,0.5)" : "rgba(214,198,178,0.15)"}`,
    background: active ? "rgba(230,136,99,0.1)" : "transparent",
    color: active ? "#E68863" : "rgba(214,198,178,0.75)",
    opacity: disabled ? 0.4 : 1,
  } as const);

  return (
    <>
    <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "0", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-px)" }}>
        {/* Заголовок */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="heading-sweep" data-text="Блог Школы ПК" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#E7DCCF", marginBottom: "1rem" }}>
            Блог Школы ПК
          </h1>
          <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Статьи о потребительских кооперативах, праве, защите активов и налоговой оптимизации
          </p>
        </div>

        {/* Темы блога — кластерные хабы */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {BLOG_TOPICS.map((t) => (
            <Link key={t.href} href={t.href} prefetch={false} style={{
              padding: "0.4rem 1rem", borderRadius: 999, fontSize: "1.05rem", textDecoration: "none",
              border: "1px solid rgba(214,198,178,0.15)", color: "rgba(214,198,178,0.75)",
            }}>{t.title} →</Link>
          ))}
        </div>

        {/* Фильтры */}
        {categories.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "1.05rem",
              border: !activeCategory ? "1px solid rgba(230,136,99,0.5)" : "1px solid rgba(214,198,178,0.15)",
              background: !activeCategory ? "rgba(230,136,99,0.1)" : "transparent",
              color: !activeCategory ? "#E68863" : "rgba(214,198,178,0.75)",
            }}>Все</button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "1.05rem",
                border: activeCategory === cat ? "1px solid rgba(230,136,99,0.5)" : "1px solid rgba(214,198,178,0.15)",
                background: activeCategory === cat ? "rgba(230,136,99,0.1)" : "transparent",
                color: activeCategory === cat ? "#E68863" : "rgba(214,198,178,0.75)",
              }}>{cat}</button>
            ))}
          </div>
        )}

        <div ref={containerRef}>
          {/* Featured (первая статья — акцент) */}
          {featuredPost && (
            <Link href={`/blog/${featuredPost.slug}`} prefetch={false} className="blog-featured__card">
              <div className="blog-featured__img-wrap">
                {featuredPost.coverImage ? (
                  <img src={typeof featuredPost.coverImage === "object" ? featuredPost.coverImage.url : featuredPost.coverImage} alt={featuredPost.title} width={typeof featuredPost.coverImage === "object" ? featuredPost.coverImage.width : undefined} height={typeof featuredPost.coverImage === "object" ? featuredPost.coverImage.height : undefined} fetchPriority="high" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "rgba(201,110,77,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📄</div>
                )}
              </div>
              <div className="blog-featured__content">
                {featuredPost.category && (
                  <span style={{ fontSize: "1rem", color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{featuredPost.category}</span>
                )}
                <h2 className="blog-featured__title heading-sweep" data-text={featuredPost.title}>{featuredPost.title}</h2>
                {featuredPost.excerpt && <p className="blog-featured__excerpt">{featuredPost.excerpt}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className="blog-featured__link">Читать статью →</span>
                  <span style={{ fontSize: "1rem", color: "rgba(214,198,178,0.8)" }}>
                    {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Список статей */}
          {restPosts.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(214,198,178,0.75)", padding: "4rem 0" }}>
              Пока нет публикаций в этой категории.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {restPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} prefetch={false} className="blog-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="blog-card__img-wrap">
                    {post.coverImage ? (
                      <img src={typeof post.coverImage === "object" ? post.coverImage.url : post.coverImage} alt={post.title} width={typeof post.coverImage === "object" ? post.coverImage.width : undefined} height={typeof post.coverImage === "object" ? post.coverImage.height : undefined} loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "rgba(201,110,77,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📄</div>
                    )}
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    {post.category && (
                      <span style={{ fontSize: "1rem", color: "#E68863", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{post.category}</span>
                    )}
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#E7DCCF", margin: "0.5rem 0 0.75rem", lineHeight: 1.4 }}>{post.title}</h3>
                    {post.excerpt && (
                      <p style={{ fontSize: "1rem", color: "rgba(214,198,178,0.8)", lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
                    )}
                    <div style={{ marginTop: "0.75rem", fontSize: "1rem", color: "rgba(214,198,178,0.8)" }}>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Серверная пагинация — ссылки для роботов и людей */}
        {!activeCategory && totalPages > 1 && (
          <nav aria-label="Страницы блога" style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", margin: "3rem 0 0" }}>
            {currentPage > 1 && (
              <Link href={pageHref(currentPage - 1)} prefetch={false} style={paginationBtn(false)}>← Новее</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={pageHref(n)} prefetch={false} style={paginationBtn(n === currentPage)}>{n}</Link>
            ))}
            {currentPage < totalPages && (
              <Link href={pageHref(currentPage + 1)} prefetch={false} style={paginationBtn(false)}>Старее →</Link>
            )}
          </nav>
        )}

        {/* Все статьи — единый список ссылок (каждая статья за 1 клик с первой страницы) */}
        {currentPage === 1 && !activeCategory && allPosts.length > 0 && (
          <section style={{ maxWidth: 900, margin: "3.5rem auto 0" }}>
            <h2 className="heading-sweep" data-text={`Все статьи (${allPosts.length})`} style={{ fontSize: "1.6rem", fontWeight: 800, color: "#E7DCCF", marginBottom: "1.25rem", textAlign: "center" }}>
              Все статьи ({allPosts.length})
            </h2>
            <ol className="blog-all-posts" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {allPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`} prefetch={false} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.55rem 0.25rem", borderBottom: "1px solid rgba(214,198,178,0.08)", textDecoration: "none" }}>
                    <span style={{ color: "rgba(214,198,178,0.85)", fontSize: "1.02rem", lineHeight: 1.45 }}>{p.title}</span>
                    <span style={{ color: "rgba(214,198,178,0.45)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {new Date(p.publishedAt || p.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* SEO текст — внизу первой страницы */}
        {currentPage === 1 && (
          <div className="blog-seo-block">
            <h2 className="blog-seo-block__title heading-sweep" data-text="О потребительской кооперации">О потребительской кооперации</h2>
            <div className="blog-seo-block__text">
              <p>
                <strong>Потребительский кооператив</strong> — это добровольное объединение граждан и юридических лиц
                на основе членства, созданное для удовлетворения материальных и иных потребностей участников.
                Деятельность кооператива регулируется Законом РФ № 3085-1 «О потребительской кооперации в Российской Федерации».
              </p>
              <p>
                В отличие от коммерческих организаций (ООО, АО), потребительский кооператив не преследует цели извлечения прибыли.
                Это позволяет применять ставку <strong>0% по НДС, налогу на прибыль и НДФЛ</strong> с паевых взносов.
                Кооперативная цена равна себестоимости — налоговая база равна нулю.
              </p>
              <p>
                В нашем блоге вы найдёте статьи о налоговой оптимизации через ПК, обнулении НДС, защите активов,
                аудите устава, регистрации кооператива и многом другом. Все материалы основаны на действующем
                законодательстве и практике работы с 2015 года.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
