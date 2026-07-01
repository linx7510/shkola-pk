"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | { url: string; alt?: string } | null;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const POSTS_PER_PAGE = 12;

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — reveal анимация (из 033)
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
  }, [activeCategory, currentPage]);

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];
  const filtered = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts;

  const showFeatured = currentPage === 1 && !activeCategory;
  const featuredPost = showFeatured && filtered.length > 0 ? filtered[0] : null;
  const restPosts = showFeatured ? filtered.slice(1) : filtered;

  const totalPages = Math.ceil(restPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = restPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handleCategoryChange = (cat: string | null) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокрутка к началу списка
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

        {/* Фильтры */}
        {categories.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button onClick={() => handleCategoryChange(null)} style={{
              padding: "0.4rem 1rem", borderRadius: 999, cursor: "pointer", fontSize: "1.05rem",
              border: !activeCategory ? "1px solid rgba(230,136,99,0.5)" : "1px solid rgba(214,198,178,0.15)",
              background: !activeCategory ? "rgba(230,136,99,0.1)" : "transparent",
              color: !activeCategory ? "#E68863" : "rgba(214,198,178,0.75)",
            }}>Все</button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} style={{
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
            <Link href={`/blog/${featuredPost.slug}`} className="blog-featured__card">
              <div className="blog-featured__img-wrap">
                {featuredPost.coverImage ? (
                  <img src={typeof featuredPost.coverImage === "object" ? featuredPost.coverImage.url : featuredPost.coverImage} alt={featuredPost.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
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
          {paginatedPosts.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(214,198,178,0.75)", padding: "4rem 0" }}>
              Пока нет публикаций в этой категории.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="blog-card__img-wrap">
                    {post.coverImage ? (
                      <img src={typeof post.coverImage === "object" ? post.coverImage.url : post.coverImage} alt={post.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
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

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="blog-pagination">
            <button
              className="blog-pagination__btn"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={page === currentPage ? "blog-pagination__btn blog-pagination__btn--active" : "blog-pagination__btn"}
                onClick={() => handlePageChange(page)}
              >{page}</button>
            ))}
            <button
              className="blog-pagination__btn"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >→</button>
          </div>
        )}

        {/* SEO текст — внизу страницы */}
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
      </div>
    </main>
    </>
  );
}
