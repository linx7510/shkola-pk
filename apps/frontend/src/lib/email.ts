import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.mail.ru',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(smtpConfig);
  }
  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  // If SMTP is not configured, log instead
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`📧 Email would be sent to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body preview: ${html.substring(0, 100)}...`);
    return true; // Pretend success in dev mode
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to: ${to}, subject: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/* ─── Email templates ─── */

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Добро пожаловать в Школу ПК! 🎓',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="color: #E7DCCF; font-size: 1.5rem;">Школа ПК</h1>
          <p style="color: #A29587;">Первая Онлайн Школа Потребительских Кооперативов</p>
        </div>
        <h2 style="color: #E68863;">Здравствуйте, ${name}!</h2>
        <p>Ваша регистрация в Школе ПК успешно завершена. Теперь вы можете:</p>
        <ul style="color: #BCA891; line-height: 2;">
          <li>Просматривать каталог курсов</li>
          <li>Записываться на обучение</li>
          <li>Отслеживать прогресс</li>
          <li>Задавать вопросы AI-ассистенту</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" style="display: inline-block; padding: 0.75rem 2rem; background: #C96E4D; color: #F5F0E8; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0;">Перейти к курсам</a>
        <p style="color: #8A7F74; font-size: 0.85rem; margin-top: 2rem;">Если у вас есть вопросы — напишите нам: boss@2980738.ru или @Veles_ST в Telegram</p>
      </div>
    `,
  };
}

export function enrollmentEmail(name: string, courseTitle: string): { subject: string; html: string } {
  return {
    subject: `Вы записаны на курс: ${courseTitle}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="color: #E7DCCF; font-size: 1.5rem;">Школа ПК</h1>
        </div>
        <h2 style="color: #6DB89A;">${name}, вы успешно записались!</h2>
        <p>Курс: <strong style="color: #E68863;">${courseTitle}</strong></p>
        <p>Начните обучение прямо сейчас — первые уроки уже доступны в вашем кабинете.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 0.75rem 2rem; background: #4C9A7A; color: #F5F0E8; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0;">Перейти к обучению</a>
        <p style="color: #8A7F74; font-size: 0.85rem; margin-top: 2rem;">Школа ПК — boss@2980738.ru · @Veles_ST</p>
      </div>
    `,
  };
}

export function paymentSuccessEmail(name: string, courseTitle: string, amount: number): { subject: string; html: string } {
  return {
    subject: `Оплата подтверждена: ${courseTitle}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="color: #E7DCCF; font-size: 1.5rem;">Школа ПК</h1>
        </div>
        <h2 style="color: #6DB89A;">Оплата прошла успешно! ✓</h2>
        <p>${name}, платёж за курс <strong style="color: #E68863;">${courseTitle}</strong> подтверждён.</p>
        <p style="font-size: 1.2rem; color: #E7DCCF;">Сумма: ${amount.toLocaleString('ru-RU')} ₽</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 0.75rem 2rem; background: #4C9A7A; color: #F5F0E8; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0;">Начать обучение</a>
        <p style="color: #8A7F74; font-size: 0.85rem; margin-top: 2rem;">Школа ПК — boss@2980738.ru · @Veles_ST</p>
      </div>
    `,
  };
}

export function contactFormEmail(name: string, email: string, phone: string, message: string): { subject: string; html: string } {
  return {
    subject: `Новая заявка с сайта: ${name}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0C0A; color: #D6C6B2; padding: 2rem;">
        <h2 style="color: #E68863;">Новая заявка с сайта Школа ПК</h2>
        <table style="color: #BCA891; line-height: 2;">
          <tr><td style="color: #8A7F74; width: 100px;">Имя:</td><td>${name}</td></tr>
          <tr><td style="color: #8A7F74;">Email:</td><td><a href="mailto:${email}" style="color: #6DB89A;">${email}</a></td></tr>
          ${phone ? `<tr><td style="color: #8A7F74;">Телефон:</td><td>${phone}</td></tr>` : ''}
        </table>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(214,198,178,0.05); border-radius: 8px; border-left: 3px solid #C96E4D;">
          <p style="color: #D6C6B2; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  };
}

