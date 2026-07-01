/**
 * Create first admin user
 * Usage: npx tsx src/scripts/create-admin.ts
 */
import { getPayload } from 'payload'
import config from '../../payload.config'

async function createAdmin() {
  const payload = await getPayload({ config })

  try {
    // Check if admin already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@shkola-pk.ru' } },
    })

    if (existing.docs.length > 0) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Create admin user
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@shkola-pk.ru',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
        name: 'Администратор',
        role: 'admin',
        isActive: true,
      },
    })

    console.log(`Admin user created: ${admin.email} (ID: ${admin.id})`)
  } catch (error: any) {
    console.error('Error creating admin:', error.message)
  }

  process.exit(0)
}

createAdmin()
