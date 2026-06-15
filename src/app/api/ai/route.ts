import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Chat API — simple echo/bot for now
 * In future (Phase 2) this will connect to DeepSeek/Yandex GPT
 * via the AI Abstraction Layer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Введите вопрос' },
        { status: 400 }
      );
    }

    // Simple rule-based responses for common questions
    // TODO: Replace with AI Provider in Phase 2
    const q = message.toLowerCase().trim();
    let reply = '';

    if (q.includes('ндс') || q.includes('налог')) {
      reply = '**НДС = 0%** для потребительских кооперативов по закону РФ № 3085-1.\n\nПотребительский кооператив освобождён от:\n• НДС (ст. 149 НК РФ)\n• Налога на прибыль\n• НДФЛ с паевых взносов\n\nУплачиваются только: госпошлина при регистрации, налог на имущество, земельный и транспортный налог.\n\nХотите узнать подробнее? Напишите @Veles_ST в Telegram!';
    } else if (q.includes('пк') || q.includes('кооператив') || q.includes('что такое')) {
      reply = '**Потребительский кооператив (ПК)** — это некоммерческая организация, созданная для удовлетворения материальных и иных потребностей участников.\n\nКлючевые отличия от ООО:\n• Не преследует извлечение прибыли\n• Освобождён от НДС, налога на прибыль, НДФЛ\n• Онлайн-касса не нужна\n• Один пайщик = один голос\n\nМинимум 5 физических лиц для создания. За подробностями — к Велеславу: @Veles_ST';
    } else if (q.includes('стоимост') || q.includes('цен') || q.includes('скольк')) {
      reply = 'Стоимость зависит от пакета обучения:\n\n• **Базовый** — ознакомительный курс\n• **Стандарт** — полный курс + документы\n• **Премиум** — курс + консалтинг + 12 мес поддержки\n• **VIP** — всё включено + регистрация ПК под ключ\n\nДля точной стоимости оставьте заявку на сайте или напишите @Veles_ST в Telegram!';
    } else if (q.includes('регистраци') || q.includes('создат') || q.includes('открыт')) {
      reply = '**Регистрация ПК** проходит в несколько этапов:\n\n1. Разработка устава и целевой программы\n2. Протокол учредительного собрания\n3. Подача документов в ФНС\n4. Получение выписки из ЕГРЮЛ\n\nСрок: 10-14 дней «под ключ». Минимум 5 участников.\n\nМы помогаем на каждом этапе! Напишите @Veles_ST для консультации.';
    } else {
      reply = 'Спасибо за вопрос! Я AI-ассистент Школы Кооперативов и пока учусь отвечать на сложные вопросы.\n\nПопробуйте спросить про:\n• НДС и налоги\n• Что такое ПК\n• Регистрация кооператива\n• Стоимость обучения\n\nИли напишите Велеславу напрямую: @Veles_ST в Telegram — он ответит лично!';
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
