import type { CollectionConfig } from 'payload'
import { createAuditHooks } from '../lib/audit'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  auth: {
    verify: {
      // Кастомный HTML-шаблон письма подтверждения (вместо дефолтного Payload)
      generateEmailHTML: ({ req, token, user }) => {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://велеслав.рус'
        const verifyUrl = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`
        return `
          <!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Подтверждение регистрации — Школа ПК</title>
          </head>
          <body style="margin: 0; padding: 0; background: #0a0908; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #0a0908; min-height: 100vh;">
              <tr>
                <td align="center" style="padding: 32px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background: #14110d; border: 1px solid #2a2520; border-radius: 12px; overflow: hidden;">

                    <!-- Шапка с логотипом -->
                    <tr>
                      <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #2a2520;">
                        <img src="https://велеслав.рус/images/hero-logo.webp" alt="Школа ПК — Велеслав Старков" width="80" height="80" style="display: inline-block; border-radius: 12px; margin-bottom: 16px;" />
                        <h1 style="margin: 0; color: #F5E6D3; font-size: 24px; font-weight: 700; letter-spacing: 0.02em;">Школа Потребительской Кооперации</h1>
                        <p style="margin: 4px 0 0; color: #8B7E6B; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Велеслав Старков • велеслав.рус</p>
                      </td>
                    </tr>

                    <!-- Основной контент -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 24px; color: #E7DCCF; font-size: 22px; font-weight: 600;">Здравствуйте, ${user.name}!</h2>

                        <p style="margin: 0 0 20px; color: #D6C6B2; font-size: 16px; line-height: 1.7; text-indent: 1.5em;">
                          Благодарим за регистрацию в Школе потребительской кооперации — Первой онлайн-платформе, обучающей предпринимателей законной налоговой оптимизации через паевую модель с 2015 года.
                        </p>

                        <p style="margin: 0 0 20px; color: #D6C6B2; font-size: 16px; line-height: 1.7; text-indent: 1.5em;">
                          Для завершения регистрации и активации вашего аккаунта подтвердите, пожалуйста, адрес электронной почты. Это необходимо для защиты вашего личного кабинета и доступа к материалам курса.
                        </p>

                        <!-- Кнопка подтверждения -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 32px 0;">
                          <tr>
                            <td align="center">
                              <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #C96E4D 0%, #E68863 100%); color: #0D0C0A; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.03em; box-shadow: 0 4px 16px rgba(201, 110, 77, 0.3);">
                                ✓ Подтвердить email
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 16px; color: #8B7E6B; font-size: 14px; line-height: 1.6;">
                          Если кнопка не работает, скопируйте и вставьте эту ссылку в адресную строку браузера:
                        </p>

                        <!-- Полная ссылка -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 32px;">
                          <tr>
                            <td style="background: #1a1611; border: 1px solid #2a2520; border-radius: 6px; padding: 14px 18px;">
                              <a href="${verifyUrl}" style="color: #B8956A; font-size: 13px; word-break: break-all; text-decoration: none; font-family: 'Courier New', monospace;">${verifyUrl}</a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 16px; color: #D6C6B2; font-size: 15px; line-height: 1.7; text-indent: 1.5em;">
                          После подтверждения email вы сможете войти в личный кабинет, получить доступ к бесплатному мини-курсу из 13 видеоуроков и ознакомиться с материалами Школы.
                        </p>

                        <p style="margin: 0; color: #8B7E6B; font-size: 14px; line-height: 1.6;">
                          Если вы не регистрировались на сайте — просто проигнорируйте это письмо. Никаких действий предпринимать не нужно.
                        </p>
                      </td>
                    </tr>

                    <!-- Разделитель -->
                    <tr>
                      <td style="padding: 0 40px;">
                        <hr style="border: none; border-top: 1px solid #2a2520; margin: 0;" />
                      </td>
                    </tr>

                    <!-- Подвал -->
                    <tr>
                      <td style="padding: 24px 40px 32px; text-align: center;">
                        <p style="margin: 0 0 8px; color: #6B5F4F; font-size: 13px;">
                          <strong style="color: #8B7E6B;">Школа ПК — Велеслав Старков</strong><br>
                          Первая онлайн Школа Потребительской Кооперации
                        </p>
                        <p style="margin: 0 0 8px; color: #6B5F4F; font-size: 12px;">
                          📞 +7 (902) 472-07-38 &nbsp;•&nbsp; ✉️ 22@велеслав.рус &nbsp;•&nbsp; 💬 @Veles_ST
                        </p>
                        <p style="margin: 0; color: #4a4239; font-size: 11px;">
                          © 2026 велеслав.рус • Пермь • ИНН 590415054646
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      },
      generateEmailSubject: () => 'Подтвердите email — Школа ПК',
    },
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
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://велеслав.рус'
            const verifyUrl = `${appUrl}/verify-email?token=${doc._verification}&email=${encodeURIComponent(doc.email)}`

            // Log verification URL to console (always — for debugging)
            console.log(`[verify-email] Verification link for ${doc.email}: ${verifyUrl}`)

            // Email отправляется автоматически через Payload's verify.generateEmailHTML
            // (настроен в auth блоке выше). Здесь только логируем для отладки.
            console.log(`[verify-email] Verification email sent via Payload to ${doc.email}`)
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
