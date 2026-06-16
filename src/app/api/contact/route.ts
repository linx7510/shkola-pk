import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, contactFormEmail } from '@/lib/email';

// POST /api/contact — handle contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Имя, email и сообщение обязательны' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный email' },
        { status: 400 }
      );
    }

    // Send notification email to admin
    const emailData = contactFormEmail(name, email, phone || '', message);
    const adminEmail = process.env.SMTP_USER || 'boss@2980738.ru';
    await sendEmail({ to: adminEmail, ...emailData });

    // Also auto-reply to user
    await sendEmail({
      to: email,
      subject: 'Ваша заявка получена — Школа ПК',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
          <h2 style="color: #E68863;">Здравствуйте, ${name}!</h2>
          <p>Спасибо за обращение в Школу ПК. Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
          <p style="color: #8A7F74; font-size: 0.85rem; margin-top: 2rem;">Школа ПК — boss@2980738.ru · @Veles_ST в Telegram</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Заявка отправлена' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 });
  }
}
