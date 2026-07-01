/**
 * Data Migration v2: Prisma → Payload CMS (via REST API)
 * Usage: npx tsx src/scripts/migrate-v2.ts
 * 
 * Reads from Prisma PostgreSQL DB using pg.Pool
 * Writes to Payload CMS via REST API at localhost:3001
 */
import { Pool } from 'pg'

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001'
const ADMIN_EMAIL = 'admin@shkola-pk.ru'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!'

const prismaPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/shkola_pk'
})

let authToken = ''

function toLexical(text: string): string {
  if (!text) return JSON.stringify({
    root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: '', version: 1 }], version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 }
  })
  // Already Lexical JSON?
  if (text.trim().startsWith('{')) return text
  return JSON.stringify({
    root: {
      type: 'root',
      children: [{
        type: 'paragraph',
        children: [{ type: 'text', text: text, version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1
      }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1
    }
  })
}

async function payloadFetch(path: string, options: RequestInit = {}) {
  const url = `${PAYLOAD_URL}/api${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (authToken) headers['Authorization'] = `JWT ${authToken}`
  
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Payload API ${res.status}: ${text.substring(0, 300)}`)
  }
  return res.json()
}

async function login() {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  authToken = data.token
  console.log('✅ Logged in as admin')
}

async function migrate() {
  console.log('🚀 Starting data migration from Prisma to Payload CMS (v2)...\n')
  
  await login()

  try {
    // 1. Create categories
    console.log('📁 Creating categories...')
    const catData = [
      { title: 'Обучение', slug: 'obuchenie', type: 'blog' },
      { title: 'Право', slug: 'pravo', type: 'blog' },
      { title: 'Практика', slug: 'praktika', type: 'blog' },
      { title: 'Налоги', slug: 'nalogi', type: 'blog' },
      { title: 'Новости', slug: 'novosti', type: 'blog' },
      { title: 'Регистрация ПК', slug: 'registratsiya-pk', type: 'faq' },
      { title: 'Устав', slug: 'ustav', type: 'faq' },
      { title: 'Взносы', slug: 'vznosy', type: 'faq' },
      { title: 'Общее', slug: 'obshchee', type: 'faq' },
      { title: 'Общие понятия', slug: 'obshchie-ponyatiya', type: 'glossary' },
      { title: 'Правовые термины', slug: 'pravovye-terminy', type: 'glossary' },
      { title: 'Финансовые термины', slug: 'finansovye-terminy', type: 'glossary' },
      { title: 'Управление ПК', slug: 'upravlenie-pk', type: 'glossary' },
    ]
    const catMap = new Map<string, number>()
    for (const cat of catData) {
      try {
        const result = await payloadFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(cat),
        })
        catMap.set(cat.slug, result.doc.id)
        console.log(`  ✅ ${cat.title} (${cat.type}) -> id=${result.doc.id}`)
      } catch (e: any) {
        if (e.message.includes('unique') || e.message.includes('already exists')) {
          console.log(`  ⏭️  ${cat.title} (exists)`)
        } else {
          console.log(`  ❌ ${cat.title}: ${e.message}`)
        }
      }
    }

    // 2. Blog Posts
    console.log('\n📝 Migrating blog posts...')
    const { rows: blogs } = await prismaPool.query('SELECT * FROM blog_posts ORDER BY "createdAt"')
    for (const post of blogs) {
      try {
        const content = toLexical(post.content || '')
        await payloadFetch('/blog-posts', {
          method: 'POST',
          body: JSON.stringify({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || undefined,
            content,
            tags: post.tags || undefined,
            isPublished: post.isPublished,
            publishedAt: post.publishedAt || undefined,
          }),
        })
        console.log(`  ✅ ${post.title}`)
      } catch (e: any) { console.log(`  ❌ ${post.title}: ${e.message.substring(0, 150)}`) }
    }

    // 3. Glossary Terms
    console.log('\n📖 Migrating glossary terms...')
    const { rows: terms } = await prismaPool.query('SELECT * FROM glossary_terms ORDER BY "order"')
    for (const t of terms) {
      try {
        const extendedContent = t.extendedContent ? toLexical(t.extendedContent) : undefined
        await payloadFetch('/glossary-terms', {
          method: 'POST',
          body: JSON.stringify({
            term: t.term,
            slug: t.slug,
            definition: t.definition,
            extendedContent,
            order: t.order,
            isPublished: t.isPublished,
          }),
        })
        console.log(`  ✅ ${t.term}`)
      } catch (e: any) { console.log(`  ❌ ${t.term}: ${e.message.substring(0, 150)}`) }
    }

    // 4. FAQ Items
    console.log('\n❓ Migrating FAQ items...')
    const { rows: faqs } = await prismaPool.query('SELECT * FROM faq_items ORDER BY "order"')
    for (const f of faqs) {
      try {
        const answer = toLexical(f.answer || '')
        await payloadFetch('/faq-items', {
          method: 'POST',
          body: JSON.stringify({
            question: f.question,
            answer,
            order: f.order,
          }),
        })
        console.log(`  ✅ ${f.question.substring(0, 50)}...`)
      } catch (e: any) { console.log(`  ❌ ${f.question}: ${e.message.substring(0, 150)}`) }
    }

    // 5. Courses
    console.log('\n🎓 Migrating courses...')
    const { rows: courses } = await prismaPool.query('SELECT * FROM courses ORDER BY "order"')
    const courseMap = new Map<string, number>()
    for (const c of courses) {
      try {
        // courses.description is textarea (NOT richText)
        const result = await payloadFetch('/courses', {
          method: 'POST',
          body: JSON.stringify({
            title: c.title,
            slug: c.slug,
            description: c.description,
            shortDesc: c.shortDesc || undefined,
            icon: c.icon || undefined,
            price: c.price || undefined,
            order: c.order,
            isPublished: c.isPublished,
          }),
        })
        courseMap.set(String(c.id), result.doc.id)
        console.log(`  ✅ ${c.title} (old=${c.id} → new=${result.doc.id})`)
      } catch (e: any) { console.log(`  ❌ ${c.title}: ${e.message.substring(0, 150)}`) }
    }

    // 6. Modules
    console.log('\n📦 Migrating modules...')
    const { rows: mods } = await prismaPool.query('SELECT * FROM modules ORDER BY "order"')
    const modMap = new Map<string, number>()
    for (const m of mods) {
      const cid = courseMap.get(String(m.courseId))
      if (!cid) { console.log(`  ⏭️  Module "${m.title}" — course not found (courseId=${m.courseId})`); continue }
      try {
        // modules.description is textarea
        const result = await payloadFetch('/modules', {
          method: 'POST',
          body: JSON.stringify({
            title: m.title,
            description: m.description || undefined,
            course: cid,
            order: m.order,
          }),
        })
        modMap.set(String(m.id), result.doc.id)
        console.log(`  ✅ ${m.title} (old=${m.id} → new=${result.doc.id})`)
      } catch (e: any) { console.log(`  ❌ ${m.title}: ${e.message.substring(0, 150)}`) }
    }

    // 7. Lessons
    console.log('\n📚 Migrating lessons...')
    const { rows: lessons } = await prismaPool.query('SELECT * FROM lessons ORDER BY "order"')
    let lessonOk = 0
    for (const l of lessons) {
      const mid = modMap.get(String(l.moduleId))
      if (!mid) { console.log(`  ⏭️  Lesson "${l.title}" — module not found (moduleId=${l.moduleId})`); continue }
      try {
        // lessons.content is richText
        const content = l.content ? toLexical(l.content) : undefined
        await payloadFetch('/lessons', {
          method: 'POST',
          body: JSON.stringify({
            title: l.title,
            content,
            videoUrl: l.videoUrl || undefined,
            duration: l.duration || 0,
            module: mid,
            order: l.order,
            isFree: l.isFree,
          }),
        })
        lessonOk++
        console.log(`  ✅ ${l.title}`)
      } catch (e: any) { console.log(`  ❌ ${l.title}: ${e.message.substring(0, 150)}`) }
    }
    console.log(`  📊 Lessons: ${lessonOk}/${lessons.length}`)

    // 8. Leads
    console.log('\n📋 Migrating leads...')
    const leadStatusMap: Record<string, string> = {
      'NEW': 'new',
      'IN_PROGRESS': 'processing',
      'CONTACTED': 'contacted',
      'QUALIFIED': 'qualified',
      'CONVERTED': 'converted',
      'CLOSED': 'closed',
    }
    const { rows: leads } = await prismaPool.query('SELECT * FROM leads')
    for (const lead of leads) {
      try {
        await payloadFetch('/leads', {
          method: 'POST',
          body: JSON.stringify({
            name: lead.name,
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            message: lead.message || undefined,
            source: lead.source || undefined,
            courseSlug: lead.courseSlug || undefined,
            status: leadStatusMap[lead.status] || 'new',
          }),
        })
        console.log(`  ✅ ${lead.name}`)
      } catch (e: any) { console.log(`  ❌ ${lead.name}: ${e.message.substring(0, 150)}`) }
    }

    // 9. Orders
    console.log('\n💰 Migrating orders...')
    const { rows: orders } = await prismaPool.query('SELECT * FROM orders')
    const orderStatusMap: Record<string, string> = { 'PENDING': 'pending', 'COMPLETED': 'paid', 'FAILED': 'cancelled', 'REFUNDED': 'refunded' }
    for (const order of orders) {
      try {
        const payloadCourseId = courseMap.get(String(order.courseId))
        let payloadUserId: number | null = null
        const { rows: orderUser } = await prismaPool.query('SELECT email FROM users WHERE id = $1', [order.userId])
        if (orderUser[0]?.email) {
          const users = await payloadFetch(`/users?where[email][equals]=${encodeURIComponent(orderUser[0].email)}&limit=1`)
          if (users.docs?.length > 0) payloadUserId = users.docs[0].id
        }
        if (payloadUserId) {
          await payloadFetch('/orders', {
            method: 'POST',
            body: JSON.stringify({
              user: payloadUserId,
              course: payloadCourseId || undefined,
              amount: order.amount,
              description: order.description || undefined,
              status: orderStatusMap[order.status] || 'pending',
              paymentMethod: order.paymentMethod || undefined,
              paymentId: order.paymentId || undefined,
              yookassaStatus: order.yookassaStatus || undefined,
            }),
          })
          console.log(`  ✅ Order ${order.id}`)
        } else {
          console.log(`  ⏭️  Order ${order.id} — user not found (userId=${order.userId})`)
        }
      } catch (e: any) { console.log(`  ❌ Order ${order.id}: ${e.message.substring(0, 150)}`) }
    }

    // 10. Enrollments
    console.log('\n📝 Migrating enrollments...')
    const { rows: enrollments } = await prismaPool.query('SELECT * FROM enrollments')
    for (const enrollment of enrollments) {
      try {
        const payloadCourseId = courseMap.get(String(enrollment.courseId))
        let payloadUserId: number | null = null
        const { rows: enUser } = await prismaPool.query('SELECT email FROM users WHERE id = $1', [enrollment.userId])
        if (enUser[0]?.email) {
          const users = await payloadFetch(`/users?where[email][equals]=${encodeURIComponent(enUser[0].email)}&limit=1`)
          if (users.docs?.length > 0) payloadUserId = users.docs[0].id
        }
        if (payloadUserId && payloadCourseId) {
          await payloadFetch('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ user: payloadUserId, course: payloadCourseId, progress: enrollment.progress || 0 }),
          })
          console.log(`  ✅ Enrollment user=${enUser[0]?.email} course=${enrollment.courseId}`)
        } else {
          console.log(`  ⏭️  Enrollment — user/course not found`)
        }
      } catch (e: any) { console.log(`  ❌ Enrollment: ${e.message.substring(0, 150)}`) }
    }

    // 11. Settings
    console.log('\n⚙️  Creating site settings...')
    try {
      const { rows: settings } = await prismaPool.query('SELECT * FROM site_settings')
      const sm: Record<string, string> = {}
      for (const s of settings) sm[s.key] = s.value
      await payloadFetch('/globals/settings', {
        method: 'POST',
        body: JSON.stringify({
          siteName: sm.site_name || 'Школа ПК',
          siteDescription: sm.site_description || 'Первая Онлайн Школа Потребительских Кооперативов',
          headerEmail: sm.header_email || 'boss@2980738.ru',
          headerTelegram: sm.header_telegram || '@Veles_ST',
        }),
      })
      console.log('  ✅ Settings created')
    } catch (e: any) { console.log(`  ❌ Settings: ${e.message.substring(0, 150)}`) }

    // 12. Home page
    console.log('\n🏠 Creating home page...')
    try {
      await payloadFetch('/pages', {
        method: 'POST',
        body: JSON.stringify({ title: 'Главная', slug: 'home', isPublished: true }),
      })
      console.log('  ✅ Home page created')
    } catch (e: any) { console.log(`  ❌ Home page: ${e.message.substring(0, 150)}`) }

    console.log('\n✅ Migration complete!')
    console.log('ℹ️  Audit logs NOT migrated (kept in Prisma DB per plan)')
    console.log('ℹ️  Lesson progress NOT migrated (empty in Prisma DB)')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prismaPool.end()
  }
}

migrate()
