import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding database...')

  // Create admin user if not exists
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
    where: { role: { equals: 'admin' } }
  })

  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@shkola-pk.ru',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
        name: 'Администратор',
        role: 'admin',
        isActive: true,
      }
    })
    console.log('Created admin user: admin@shkola-pk.ru')
  }

  // Create sample services
  const services = [
    { title: 'Регистрация ПК под ключ', slug: 'registratsiya-pk', shortDesc: 'Полное сопровождение регистрации потребительского кооператива', price: 50000, order: 1 },
    { title: 'Аудит устава ПК', slug: 'audit-ustava-pk', shortDesc: 'Проверка устава на соответствие законодательству', price: 15000, order: 2 },
    { title: 'Обучение председателей', slug: 'obuchenie-predsedateley', shortDesc: 'Программа подготовки председателей правления ПК', price: 25000, order: 3 },
    { title: 'Налоговая практика', slug: 'nalogovaya-praktika', shortDesc: 'Оптимизация налогообложения потребительского кооператива', price: 20000, order: 4 },
    { title: 'Бухгалтерское сопровождение', slug: 'bukhgalterskoe-soprovozhdenie', shortDesc: 'Ведение бухгалтерии потребительского кооператива', price: 15000, order: 5 },
    { title: 'Кооператив под ключ', slug: 'kooperativ-pod-klyuch', shortDesc: 'Создание и запуск потребительского кооператива под ключ', price: 100000, order: 6 },
    { title: 'Целевые программы', slug: 'tselievye-programmy', shortDesc: 'Разработка целевых программ для потребительского кооператива', price: 30000, order: 7 },
    { title: 'Защита активов', slug: 'zashchita-aktivov', shortDesc: 'Юридическая защита активов потребительского кооператива', price: 35000, order: 8 },
    { title: 'Ревизионная комиссия', slug: 'revizionnaya-komissiya', shortDesc: 'Организация работы ревизионной комиссии ПК', price: 10000, order: 9 },
    { title: 'Уставные документы', slug: 'ustavnye-dokumenty', shortDesc: 'Подготовка полного комплекта уставных документов', price: 20000, order: 10 },
    { title: 'Консультация', slug: 'konsultatsiya', shortDesc: 'Индивидуальная консультация по вопросам ПК', price: 5000, priceNote: 'за 1 час', order: 11 },
  ]

  for (const service of services) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: service.slug } }
    })
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'services',
        data: {
          ...service,
          content: service.shortDesc,
          isPublished: true,
        }
      })
      console.log(\`Created service: \${service.title}\`)
    }
  }

  console.log('Seed completed!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
