import type { Endpoint } from 'payload'

// Лёгкий список статей для списков/related/sitemap: без content (~50 КБ вместо 2,3 МБ,
// Payload REST игнорирует fields[] и отдаёт весь контент всех статей — из-за этого
// Next data cache не кэшировал ответы и лог заполнялся предупреждениями).
export const blogPostsLightEndpoint: Endpoint = {
  path: '/blog-posts-light',
  method: 'get',
  handler: async (req) => {
    const result = await req.payload.db.pool.query(
      `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.published_at, bp.created_at, bp.updated_at,
              m.url AS cover_url, m.width AS cover_width, m.height AS cover_height,
              c.title AS category_title
         FROM blog_posts bp
         LEFT JOIN media m ON bp.cover_image_id = m.id
         LEFT JOIN categories c ON bp.category_id = c.id
        WHERE bp.is_published = true
        ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC`
    )
    const docs = result.rows.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt || null,
      coverImage: r.cover_url
        ? { url: r.cover_url, width: r.cover_width ?? undefined, height: r.cover_height ?? undefined }
        : null,
      category: r.category_title || null,
      publishedAt: r.published_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))
    return Response.json({ docs, totalDocs: docs.length })
  },
}
