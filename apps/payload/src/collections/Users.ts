import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  auth: {
    verify: true,
    // Use Payload's built-in token-based email verification
    // Payload auto-generates _verification token and exposes /api/users/verify/:token
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // lock for 10 min after 5 failed attempts
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'isActive', '_verified', 'createdAt'],
    group: 'Управление',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    create: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Имя' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      label: 'Роль',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
        { label: 'Менеджер', value: 'manager' },
        { label: 'Преподаватель', value: 'teacher' },
        { label: 'Студент', value: 'student' },
        { label: 'Наблюдатель', value: 'viewer' },
      ],
    },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Аватар' },
    { name: 'bio', type: 'textarea', label: 'О себе' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Активен' },
  ],
  hooks: {
    ...createAuditHooks('user'),
    afterChange: [
      async ({ doc, operation, req }) => {
        // Send verification email only on create (new registration)
        // and only if user is not yet verified
        if (operation === 'create' && !doc._verified && doc._verification) {
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2980738.ru'
            const verifyUrl = `${appUrl}/verify-email?token=${doc._verification}&email=${encodeURIComponent(doc.email)}`

            // Log verification URL to console (always — for debugging)
            console.log(`[verify-email] Verification link for ${doc.email}: ${verifyUrl}`)

            // Try to send email via Payload's sendEmail (if SMTP configured)
            if (req.payload.sendEmail) {
              try {
                const html = `
                  <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                      <h1 style="color: #F5E6D3; margin: 0;">Подтвердите email</h1>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6;">Здравствуйте, ${doc.name}!</p>
                    <p style="font-size: 16px; line-height: 1.6;">Спасибо за регистрацию в Школе потребительской кооперации. Для завершения регистрации подтвердите ваш email:</p>
                    <div style="text-align: center; margin: 2rem 0;">
                      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 32px; background: #B8956A; color: #0D0C0A; text-decoration: none; border-radius: 4px; font-weight: 600;">Подтвердить email</a>
                    </div>
                    <p style="font-size: 14px; color: #8B7E6B; line-height: 1.5;">Если кнопка не работает, скопируйте ссылку:<br>${verifyUrl}</p>
                    <p style="font-size: 14px; color: #8B7E6B;">Если вы не регистрировались на сайте — просто проигнорируйте это письмо.</p>
                    <hr style="border: none; border-top: 1px solid #2A2520; margin: 2rem 0;">
                    <p style="font-size: 12px; color: #6B5F4F; text-align: center;">Школа ПК — Велеслав Старков<br>2980738.ru</p>
                  </div>
                `
                await req.payload.sendEmail({
                  to: doc.email,
                  subject: 'Подтвердите email — Школа ПК',
                  html,
                })
                console.log(`[verify-email] Email sent to ${doc.email}`)
              } catch (emailErr) {
                // SMTP not configured or failed — log but don't fail the registration
                console.warn(`[verify-email] Email send failed for ${doc.email} (SMTP not configured?). URL: ${verifyUrl}`)
              }
            }
          } catch (err) {
            console.error('[verify-email] Hook error:', err)
          }
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
