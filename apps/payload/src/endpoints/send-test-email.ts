import type { Endpoint } from 'payload'

export const sendTestEmailEndpoint: Endpoint = {
  path: '/custom/send-test-email',
  method: 'post',
  handler: async (req: any) => {
    try {
      if (!req.user) {
        return Response.json({ error: 'Не авторизован' }, { status: 401 })
      }

      const body = await req.json?.() || {}
      const to = body.to || 'boss@2980738.ru'

      if (req.payload.sendEmail) {
        await req.payload.sendEmail({
          to,
          subject: '✓ Тестовое письмо от Школы ПК',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
              <h1 style="color: #E7DCCF;">✓ SMTP настроен!</h1>
              <p style="font-size: 16px; line-height: 1.6;">Это тестовое письмо от платформы Школа ПК (2980738.ru).</p>
              <p style="font-size: 16px; line-height: 1.6;">Email-уведомления работают. Теперь при регистрации клиентов, загрузке документов и новых заказах вы будете получать письма на этот адрес.</p>
              <hr style="border: none; border-top: 1px solid #2A2520; margin: 2rem 0;">
              <p style="font-size: 12px; color: #6B5F4F;">Школа ПК — Велеслав Старков<br>2980738.ru</p>
            </div>
          `,
        })
        return Response.json({ ok: true, message: 'Письмо отправлено на ' + to })
      } else {
        return Response.json({ error: 'sendEmail не доступен — SMTP не настроен' }, { status: 500 })
      }
    } catch (error: any) {
      console.error('[send-test-email] Error:', error)
      return Response.json({ error: error.message || 'Ошибка' }, { status: 500 })
    }
  },
}
