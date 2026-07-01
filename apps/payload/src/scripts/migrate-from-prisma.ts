/**
 * Data Migration: Prisma → Payload CMS
 * Usage: npx tsx src/scripts/migrate-from-prisma.ts
 */
import { getPayload } from 'payload'
import config from '../../payload.config'

async function migrate() {
  console.log('Starting data migration from Prisma to Payload CMS...\n')
  
  const { Pool } = await import('pg')
  const prismaPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/shkola_pk'
  })

  const payload = await getPayload({ config })

  try {
    // 1. Create default categories
    console.log('Creating default categories...')
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
    for (const cat of catData) {
      try {
        await payload.create({ collection: 'categories', data: cat })
        console.log(`  Category: ${cat.title}`)
      } catch (e: any) {
        if (!e.message?.includes('unique')) console.log(`  Error: ${cat.title} - ${e.message}`)
      }
    }

    // 2. Blog Posts
    console.log('\nMigrating blog posts...')
    const { rows: blogs } = await prismaPool.query('SELECT * FROM blog_posts')
    for (const post of blogs) {
      try {
        await payload.create({
          collection: 'blog-posts',
          data: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || undefined,
            content: post.content || '',
            category: post.category || undefined,
            tags: post.tags || undefined,
            isPublished: post.is_published,
            publishedAt: post.published_at || undefined,
          },
        })
        console.log(`  Blog: ${post.title}`)
      } catch (e: any) { console.log(`  Error: ${post.title} - ${e.message}`) }
    }

    // 3. Glossary - FIX: removed metaTitle/metaDescription (SEO plugin handles them)
    console.log('\nMigrating glossary terms...')
    const { rows: terms } = await prismaPool.query('SELECT * FROM glossary_terms ORDER BY "order"')
    for (const t of terms) {
      try {
        await payload.create({
          collection: 'glossary-terms',
          data: {
            term: t.term, slug: t.slug, definition: t.definition,
            extendedContent: t.extended_content || undefined,
            category: t.category || undefined,
            order: t.order, isPublished: t.is_published,
          },
        })
        console.log(`  Term: ${t.term}`)
      } catch (e: any) { console.log(`  Error: ${t.term} - ${e.message}`) }
    }

    // 4. FAQ
    console.log('\nMigrating FAQ...')
    const { rows: faqs } = await prismaPool.query('SELECT * FROM faq_items ORDER BY "order"')
    for (const f of faqs) {
      try {
        await payload.create({
          collection: 'faq-items',
          data: {
            question: f.question, answer: f.answer,
            category: f.category || undefined, order: f.order,
          },
        })
        console.log(`  FAQ: ${f.question.substring(0, 40)}...`)
      } catch (e: any) { console.log(`  Error: ${f.question} - ${e.message}`) }
    }

    // 5. Courses
    console.log('\nMigrating courses...')
    const { rows: courses } = await prismaPool.query('SELECT * FROM courses ORDER BY "order"')
    const courseMap = new Map<string, string>()
    for (const c of courses) {
      try {
        const nc = await payload.create({
          collection: 'courses',
          data: {
            title: c.title, slug: c.slug, description: c.description,
            shortDesc: c.short_desc || undefined, icon: c.icon || undefined,
            price: c.price || undefined, order: c.order, isPublished: c.is_published,
          },
        })
        courseMap.set(String(c.id), String(nc.id))
        console.log(`  Course: ${c.title}`)
      } catch (e: any) { console.log(`  Error: ${c.title} - ${e.message}`) }
    }

    // 6. Modules
    console.log('\nMigrating modules...')
    const { rows: mods } = await prismaPool.query('SELECT * FROM modules ORDER BY "order"')
    const modMap = new Map<string, string>()
    for (const m of mods) {
      const cid = courseMap.get(m.course_id)
      if (!cid) { console.log(`  Skip module: ${m.title} (course not found)`); continue }
      try {
        const nm = await payload.create({
          collection: 'modules',
          data: { title: m.title, description: m.description || undefined, course: cid, order: m.order },
        })
        modMap.set(String(m.id), String(nm.id))
        console.log(`  Module: ${m.title}`)
      } catch (e: any) { console.log(`  Error: ${m.title} - ${e.message}`) }
    }

    // 7. Lessons
    console.log('\nMigrating lessons...')
    const { rows: lessons } = await prismaPool.query('SELECT * FROM lessons ORDER BY "order"')
    let lessonCount = 0
    for (const l of lessons) {
      const mid = modMap.get(l.module_id)
      if (!mid) { console.log(`  Skip lesson: ${l.title} (module not found)`); continue }
      try {
        await payload.create({
          collection: 'lessons',
          data: {
            title: l.title, content: l.content || undefined,
            videoUrl: l.video_url || undefined, duration: l.duration,
            module: mid, order: l.order, isFree: l.is_free,
          },
        })
        lessonCount++
        console.log(`  Lesson: ${l.title}`)
      } catch (e: any) { console.log(`  Error: ${l.title} - ${e.message}`) }
    }
    console.log(`  Total lessons migrated: ${lessonCount}/${lessons.length}`)

    // 8. Settings
    console.log('\nCreating site settings...')
    try {
      await payload.updateGlobal({
        slug: 'settings',
        data: {
          siteName: 'Школа ПК',
          siteDescription: 'Первая Онлайн Школа Потребительских Кооперативов',
          headerEmail: 'boss@2980738.ru',
          headerTelegram: '@Veles_ST',
        },
      })
      console.log('  Settings created')
    } catch (e: any) { console.log(`  Error: ${e.message}`) }

    // 9. Home page
    console.log('\nCreating home page...')
    try {
      await payload.create({
        collection: 'pages',
        data: {
          title: 'Главная', slug: 'home', isPublished: true,
        },
      })
      console.log('  Home page created')
    } catch (e: any) { console.log(`  Error: ${e.message}`) }

    // 10. Migrate site_settings
    console.log('\nMigrating site settings...')
    try {
      const { rows: settings } = await prismaPool.query('SELECT * FROM site_settings')
      const settingsMap: Record<string, string> = {}
      for (const s of settings) {
        settingsMap[s.key] = s.value
      }
      if (Object.keys(settingsMap).length > 0) {
        await payload.updateGlobal({
          slug: 'settings',
          data: {
            siteName: settingsMap.site_name || 'Школа ПК',
            siteDescription: settingsMap.site_description || undefined,
            headerPhone: settingsMap.header_phone || undefined,
            headerEmail: settingsMap.header_email || 'boss@2980738.ru',
            headerTelegram: settingsMap.header_telegram || '@Veles_ST',
          },
        })
        console.log('  Site settings migrated')
      }
    } catch (e: any) { console.log(`  Settings migration: ${e.message}`) }

    // 11. Migrate leads
    console.log('\nMigrating leads...')
    try {
      const { rows: leads } = await prismaPool.query('SELECT * FROM leads')
      for (const lead of leads) {
        try {
          await payload.create({
            collection: 'leads',
            data: {
              name: lead.name,
              email: lead.email || undefined,
              phone: lead.phone || undefined,
              message: lead.message || undefined,
              source: lead.source || undefined,
              courseSlug: lead.course_slug || undefined,
              status: lead.status?.toLowerCase() || 'new',
            },
          })
          console.log(`  Lead: ${lead.name}`)
        } catch (e: any) { console.log(`  Error: ${lead.name} - ${e.message}`) }
      }
    } catch (e: any) { console.log(`  Leads migration: ${e.message}`) }

    // 12. Migrate orders
    console.log('\nMigrating orders...')
    try {
      const { rows: orders } = await prismaPool.query('SELECT * FROM orders')
      for (const order of orders) {
        try {
          const statusMap: Record<string, string> = {
            'PENDING': 'pending',
            'COMPLETED': 'paid',
            'FAILED': 'cancelled',
            'REFUNDED': 'refunded',
          }
          // Find the user in Payload by email
          const { rows: orderUser } = await prismaPool.query('SELECT email FROM users WHERE id = $1', [order.user_id])
          const userEmail = orderUser[0]?.email
          
          let payloadUserId = null
          if (userEmail) {
            const payloadUsers = await payload.find({ collection: 'users', where: { email: { equals: userEmail } } })
            if (payloadUsers.docs.length > 0) payloadUserId = payloadUsers.docs[0].id
          }
          
          const payloadCourseId = courseMap.get(order.course_id)
          
          if (payloadUserId) {
            await payload.create({
              collection: 'orders',
              data: {
                user: payloadUserId,
                course: payloadCourseId || undefined,
                amount: order.amount,
                description: order.description || undefined,
                status: statusMap[order.status] || 'pending',
                paymentMethod: order.payment_method || undefined,
                paymentId: order.payment_id || undefined,
                yookassaStatus: order.yookassa_status || undefined,
              },
            })
            console.log(`  Order: ${order.id}`)
          }
        } catch (e: any) { console.log(`  Error: Order ${order.id} - ${e.message}`) }
      }
    } catch (e: any) { console.log(`  Orders migration: ${e.message}`) }

    // 13. Migrate enrollments
    console.log('\nMigrating enrollments...')
    try {
      const { rows: enrollments } = await prismaPool.query('SELECT * FROM enrollments')
      for (const enrollment of enrollments) {
        try {
          const { rows: enUser } = await prismaPool.query('SELECT email FROM users WHERE id = $1', [enrollment.user_id])
          const userEmail = enUser[0]?.email
          
          let payloadUserId = null
          if (userEmail) {
            const pUsers = await payload.find({ collection: 'users', where: { email: { equals: userEmail } } })
            if (pUsers.docs.length > 0) payloadUserId = pUsers.docs[0].id
          }
          
          const payloadCourseId = courseMap.get(enrollment.course_id)
          
          if (payloadUserId && payloadCourseId) {
            await payload.create({
              collection: 'enrollments',
              data: {
                user: payloadUserId,
                course: payloadCourseId,
                progress: enrollment.progress || 0,
              },
            })
            console.log(`  Enrollment: user=${userEmail} course=${enrollment.course_id}`)
          }
        } catch (e: any) { console.log(`  Error: Enrollment - ${e.message}`) }
      }
    } catch (e: any) { console.log(`  Enrollments migration: ${e.message}`) }

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
