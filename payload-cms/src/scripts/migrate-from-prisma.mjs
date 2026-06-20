#!/usr/bin/env node
/**
 * Data Migration: Prisma → Payload CMS (REST API version - FIXED)
 * Usage: node src/scripts/migrate-from-prisma.mjs
 * Requires Payload CMS running on localhost:3001
 */
import pg from 'pg'
const { Pool } = pg

const PAYLOAD_URL = 'http://localhost:3001'
const ADMIN_EMAIL = 'admin@shkola-pk.ru'
const ADMIN_PASSWORD = 'Admin123!'

let token = ''

async function payloadLogin() {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = await res.json()
  if (data.token) {
    token = data.token
    console.log('Logged in as admin')
  } else {
    throw new Error('Login failed: ' + JSON.stringify(data))
  }
}

async function payloadCreate(collection, data) {
  const res = await fetch(`${PAYLOAD_URL}/api/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${token}`,
    },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors))
  }
  return result.doc || result
}

async function payloadFind(collection, where) {
  const params = new URLSearchParams()
  params.set('where', JSON.stringify(where))
  params.set('limit', '100')
  const res = await fetch(`${PAYLOAD_URL}/api/${collection}?${params}`, {
    headers: { 'Authorization': `JWT ${token}` },
  })
  const data = await res.json()
  return data.docs || []
}

async function payloadUpdateGlobal(slug, data) {
  const res = await fetch(`${PAYLOAD_URL}/api/globals/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${token}`,
    },
    body: JSON.stringify(data),
  })
  return await res.json()
}

// Convert plain text to Lexical JSON format
function textToLexical(text) {
  if (!text) return undefined
  const paragraphs = text.split('\n').filter(p => p.trim())
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map(p => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', format: 0, version: 1, text: p }],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
    },
  }
}

// Convert HTML to basic Lexical JSON format (simplified - splits by block tags)
function htmlToLexical(html) {
  if (!html) return undefined
  // Very basic HTML to Lexical: split by block elements, strip tags for text
  const blocks = html.split(/<\/?(?:h[1-6]|p|div|br|li|ul|ol)[^>]*>/gi)
    .map(b => b.replace(/<[^>]+>/g, '').trim())
    .filter(b => b.length > 0)
  
  if (blocks.length === 0) return undefined
  
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: blocks.map(b => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', format: 0, version: 1, text: b }],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
    },
  }
}

async function migrate() {
  console.log('Starting data migration from Prisma to Payload CMS...\n')
  
  const prismaPool = new Pool({
    connectionString: 'postgresql://shkola_pk:Shk0laPK2026!Db@localhost:5432/shkola_pk'
  })

  await payloadLogin()

  try {
    // 0. Build category name → Payload ID map
    console.log('Building category map...')
    const allCategories = await payloadFind('categories', {})
    const categoryMap = {}
    for (const cat of allCategories) {
      categoryMap[cat.title] = cat.id
    }
    console.log(`  Found ${allCategories.length} existing categories`)

    // 1. Create additional categories needed for migration
    console.log('\nCreating additional categories...')
    const neededCategories = [
      // FAQ categories from Prisma
      { title: 'Право', slug: 'pravo-faq', type: 'faq' },
      { title: 'Финансы', slug: 'finansy-faq', type: 'faq' },
      { title: 'Услуги', slug: 'uslugi-faq', type: 'faq' },
      { title: 'Регистрация', slug: 'registratsiya-faq', type: 'faq' },
      { title: 'Членство', slug: 'chlenstvo-faq', type: 'faq' },
      { title: 'Основы', slug: 'osnovy-faq', type: 'faq' },
      { title: 'Риски', slug: 'riski-faq', type: 'faq' },
      { title: 'Защита активов', slug: 'zashchita-aktivov-faq', type: 'faq' },
      { title: 'Налоги', slug: 'nalogi-faq', type: 'faq' },
      // Glossary categories from Prisma
      { title: 'Виды ПК', slug: 'vidy-pk-glossary', type: 'glossary' },
      { title: 'Управление', slug: 'upravlenie-glossary', type: 'glossary' },
      // Blog categories from Prisma  
      { title: 'Образование', slug: 'obrazovanie-blog', type: 'blog' },
    ]
    for (const cat of neededCategories) {
      if (!categoryMap[cat.title]) {
        try {
          const created = await payloadCreate('categories', cat)
          categoryMap[cat.title] = created.id
          console.log(`  Created: ${cat.title} (${cat.type})`)
        } catch (e) {
          const msg = e.message || ''
          if (msg.includes('unique') || msg.includes('Unique') || msg.includes('slug')) {
            // Category exists but wasn't in our map, find it
            const found = await payloadFind('categories', { slug: { equals: cat.slug } })
            if (found.length > 0) {
              categoryMap[cat.title] = found[0].id
              console.log(`  Found existing: ${cat.title}`)
            }
          } else {
            console.log(`  Error: ${cat.title} - ${msg}`)
          }
        }
      } else {
        console.log(`  Already exists: ${cat.title}`)
      }
    }

    // Helper: find category by name with type fallback
    function getCategory(catName, type) {
      if (!catName) return undefined
      return categoryMap[catName] || undefined
    }

    // 2. Blog Posts
    console.log('\nMigrating blog posts...')
    const { rows: blogs } = await prismaPool.query('SELECT * FROM blog_posts')
    for (const post of blogs) {
      try {
        await payloadCreate('blog-posts', {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || undefined,
          content: htmlToLexical(post.content),
          category: getCategory(post.category, 'blog'),
          tags: post.tags || undefined,
          isPublished: post.is_published,
          publishedAt: post.published_at || undefined,
        })
        console.log(`  Blog: ${post.title}`)
      } catch (e) { console.log(`  Error: ${post.title} - ${e.message}`) }
    }

    // 3. Glossary - FIX: removed metaTitle/metaDescription (SEO plugin handles them)
    console.log('\nMigrating glossary terms...')
    const { rows: terms } = await prismaPool.query('SELECT * FROM glossary_terms ORDER BY "order"')
    for (const t of terms) {
      try {
        await payloadCreate('glossary-terms', {
          term: t.term, slug: t.slug, definition: t.definition,
          extendedContent: htmlToLexical(t.extended_content),
          category: getCategory(t.category, 'glossary'),
          order: t.order, isPublished: t.is_published,
        })
        console.log(`  Term: ${t.term}`)
      } catch (e) { console.log(`  Error: ${t.term} - ${e.message}`) }
    }

    // 4. FAQ
    console.log('\nMigrating FAQ...')
    const { rows: faqs } = await prismaPool.query('SELECT * FROM faq_items ORDER BY "order"')
    for (const f of faqs) {
      try {
        const faqData = {
          question: f.question,
          answer: textToLexical(f.answer) || textToLexical('Ответ не указан'),
          category: getCategory(f.category, 'faq'),
          order: f.order,
        }
        await payloadCreate('faq-items', faqData)
        console.log(`  FAQ: ${f.question.substring(0, 40)}...`)
      } catch (e) { console.log(`  Error: ${f.question} - ${e.message}`) }
    }

    // 5. Courses
    console.log('\nMigrating courses...')
    const { rows: courses } = await prismaPool.query('SELECT * FROM courses ORDER BY "order"')
    const courseMap = new Map()
    for (const c of courses) {
      try {
        const nc = await payloadCreate('courses', {
          title: c.title, slug: c.slug, description: c.description || 'Описание курса',
          shortDesc: c.short_desc || undefined, icon: c.icon || undefined,
          price: c.price || undefined, order: c.order, isPublished: c.is_published,
        })
        courseMap.set(c.id, String(nc.id))
        console.log(`  Course: ${c.title} (${c.id} → ${nc.id})`)
      } catch (e) { console.log(`  Error: ${c.title} - ${e.message}`) }
    }

    // 6. Modules - FIXED: use quoted camelCase column names
    console.log('\nMigrating modules...')
    const { rows: mods } = await prismaPool.query('SELECT * FROM modules ORDER BY "order"')
    const modMap = new Map()
    for (const m of mods) {
      const cid = courseMap.get(m.courseId)
      if (!cid) { console.log(`  Skip module: ${m.title} (course ${m.courseId} not found)`); continue }
      try {
        const nm = await payloadCreate('modules', {
          title: m.title, description: m.description || undefined, course: cid, order: m.order,
        })
        modMap.set(m.id, String(nm.id))
        console.log(`  Module: ${m.title} (${m.id} → ${nm.id})`)
      } catch (e) { console.log(`  Error: ${m.title} - ${e.message}`) }
    }

    // 7. Lessons - FIXED: use quoted camelCase column names
    console.log('\nMigrating lessons...')
    const { rows: lessons } = await prismaPool.query('SELECT * FROM lessons ORDER BY "order"')
    let lessonCount = 0
    for (const l of lessons) {
      const mid = modMap.get(l.moduleId)
      if (!mid) { console.log(`  Skip lesson: ${l.title} (module ${l.moduleId} not found)`); continue }
      try {
        await payloadCreate('lessons', {
          title: l.title, content: htmlToLexical(l.content),
          videoUrl: l.videoUrl || undefined, duration: l.duration,
          module: mid, order: l.order, isFree: l.isFree,
        })
        lessonCount++
        console.log(`  Lesson: ${l.title}`)
      } catch (e) { console.log(`  Error: ${l.title} - ${e.message}`) }
    }
    console.log(`  Total lessons migrated: ${lessonCount}/${lessons.length}`)

    // 8. Settings
    console.log('\nCreating site settings...')
    try {
      await payloadUpdateGlobal('settings', {
        siteName: 'Школа ПК',
        siteDescription: 'Первая Онлайн Школа Потребительских Кооперативов',
        headerEmail: 'boss@2980738.ru',
        headerTelegram: '@Veles_ST',
      })
      console.log('  Settings created')
    } catch (e) { console.log(`  Error: ${e.message}`) }

    // 9. Home page
    console.log('\nCreating home page...')
    try {
      await payloadCreate('pages', {
        title: 'Главная', slug: 'home', isPublished: true,
        content: textToLexical('Добро пожаловать в Школу ПК'),
      })
      console.log('  Home page created')
    } catch (e) { console.log(`  Error: ${e.message}`) }

    // 10. Migrate site_settings
    console.log('\nMigrating site settings...')
    try {
      const { rows: settings } = await prismaPool.query('SELECT * FROM site_settings')
      const settingsMap = {}
      for (const s of settings) {
        settingsMap[s.key] = s.value
      }
      if (Object.keys(settingsMap).length > 0) {
        await payloadUpdateGlobal('settings', {
          siteName: settingsMap.site_name || 'Школа ПК',
          siteDescription: settingsMap.site_description || undefined,
          headerPhone: settingsMap.contact_phone || undefined,
          headerEmail: settingsMap.contact_email || 'boss@2980738.ru',
        })
        console.log('  Site settings migrated')
      }
    } catch (e) { console.log(`  Settings migration: ${e.message}`) }

    // 11. Migrate leads
    console.log('\nMigrating leads...')
    try {
      const { rows: leads } = await prismaPool.query('SELECT * FROM leads')
      for (const lead of leads) {
        try {
          await payloadCreate('leads', {
            name: lead.name,
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            message: lead.message || undefined,
            source: lead.source || undefined,
            courseSlug: lead.course_slug || undefined,
            status: lead.status?.toLowerCase() || 'new',
          })
          console.log(`  Lead: ${lead.name}`)
        } catch (e) { console.log(`  Error: ${lead.name} - ${e.message}`) }
      }
    } catch (e) { console.log(`  Leads migration: ${e.message}`) }

    // 12. Migrate orders
    console.log('\nMigrating orders...')
    try {
      const { rows: orders } = await prismaPool.query('SELECT * FROM orders')
      for (const order of orders) {
        try {
          const statusMap = {
            'PENDING': 'pending',
            'COMPLETED': 'paid',
            'FAILED': 'cancelled',
            'REFUNDED': 'refunded',
          }
          const { rows: orderUser } = await prismaPool.query('SELECT email FROM users WHERE id = $1', [order.userId])
          const userEmail = orderUser[0]?.email
          
          let payloadUserId = null
          if (userEmail) {
            const payloadUsers = await payloadFind('users', { email: { equals: userEmail } })
            if (payloadUsers.length > 0) payloadUserId = payloadUsers[0].id
          }
          
          const payloadCourseId = courseMap.get(order.courseId)
          
          if (payloadUserId) {
            await payloadCreate('orders', {
              user: payloadUserId,
              course: payloadCourseId || undefined,
              amount: order.amount,
              description: order.description || undefined,
              status: statusMap[order.status] || 'pending',
              paymentMethod: order.paymentMethod || undefined,
              paymentId: order.paymentId || undefined,
              yookassaStatus: order.yookassaStatus || undefined,
            })
            console.log(`  Order: ${order.id}`)
          } else {
            console.log(`  Skip order: ${order.id} (user not found)`)
          }
        } catch (e) { console.log(`  Error: Order ${order.id} - ${e.message}`) }
      }
    } catch (e) { console.log(`  Orders migration: ${e.message}`) }

    // 13. Migrate enrollments
    console.log('\nMigrating enrollments...')
    try {
      const { rows: enrollments } = await prismaPool.query('SELECT * FROM enrollments')
      for (const enrollment of enrollments) {
        try {
          const { rows: enUser } = await prismaPool.query('SELECT email FROM users WHERE id = $1', [enrollment.userId])
          const userEmail = enUser[0]?.email
          
          let payloadUserId = null
          if (userEmail) {
            const pUsers = await payloadFind('users', { email: { equals: userEmail } })
            if (pUsers.length > 0) payloadUserId = pUsers[0].id
          }
          
          const payloadCourseId = courseMap.get(enrollment.courseId)
          
          if (payloadUserId && payloadCourseId) {
            await payloadCreate('enrollments', {
              user: payloadUserId,
              course: payloadCourseId,
              progress: enrollment.progress || 0,
            })
            console.log(`  Enrollment: user=${userEmail} course=${enrollment.courseId}`)
          } else {
            console.log(`  Skip enrollment (user=${!!payloadUserId} course=${!!payloadCourseId})`)
          }
        } catch (e) { console.log(`  Error: Enrollment - ${e.message}`) }
      }
    } catch (e) { console.log(`  Enrollments migration: ${e.message}`) }

    console.log('\nMigration complete!')
    console.log('Note: Audit logs NOT migrated (kept in Prisma DB per plan)')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prismaPool.end()
    process.exit(0)
  }
}

migrate()
