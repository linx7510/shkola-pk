/**
 * Скрипт для обогащения контента страницы курсов в Payload CMS
 * Добавляет недостающий текст с veleslav.rus, изображения с alt-тегами
 *
 * Запуск: node scripts/payload-content-update.js
 *
 * Требуется переменная окружения:
 *   PAYLOAD_URL=http://localhost:3001  (или ваш URL Payload CMS)
 *   PAYLOAD_API_KEY=your-api-key       (если нужна авторизация)
 */

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001';
const API_KEY = process.env.PAYLOAD_API_KEY || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://2980738.ru';

const headers = {
  'Content-Type': 'application/json',
  ...(API_KEY ? { Authorization: `users API-Key ${API_KEY}` } : {}),
};

async function getPage(slug) {
  const res = await fetch(
    `${PAYLOAD_URL}/api/pages?where[slug][equals]=${slug}&depth=2&limit=1`,
    { headers },
  );
  const data = await res.json();
  return data.docs?.[0] || null;
}

async function updatePage(id, updates) {
  const res = await fetch(`${PAYLOAD_URL}/api/pages/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  return res.json();
}

/* ─── Обогащённый контент для блоков ─── */

// Дополнительный текст для блока "Налоговый пресс"
const taxPressureExtra = `Обнуляют исходящий НДС через паевые взносы (ст. 39 НК РФ). Получают беспроцентные займы от пайщиков вместо банковских кредитов под 20%+. Снижают себестоимость в длинных технологических цепочках. Защищают активы от взысканий через неделимые фонды ПК. Выплачивают коопативные возвраты пайщикам без НДФЛ. Потребительский кооператив — это не схема ухода от налогов, а законный инструмент, предусмотренный ГК РФ (ст. 123.2) и Федеральным законом № 3085-1. Тысячи предприятий уже используют его для легальной оптимизации налогообложения.`;

// Дополнительный текст для блока "Чему вы научитесь"
const learnExtra = `Вы освоите полный цикл работы с потребительским кооперативом — от регистрации до масштабирования. Каждое направление подкреплено реальными документами и пошаговыми инструкциями, а не просто теорией. Наши выпускники открывают ПК за 5 дней и начинают экономить на налогах уже в первом квартале.`;

// Дополнительный текст для блока "Кому подойдут курсы"
const audienceExtra = {
  production: `Производственные предприятия получают максимальную выгоду от ПК: обнуление НДС при реализации продукции через коопативные возвраты, снижение себестоимости через паевые взносы, защита оборудования и недвижимости в неделимых фондах кооператива. Наши выпускники-производственники экономят от 3 до 15 млн рублей в год на налогах.`,
  construction: `Строительные компании используют ПК для работы с застройщиками, снижения НДС при реализации квартир пайщикам, организации закупок через кооператив. Длинные технологические цепочки «завод → ПК → аффилированное ООО → пайщик» позволяют минимизировать налоговую нагрузку на каждом этапе.`,
  agriculture: `Сельскохозяйственные кооперативы — одна из самых распространённых форм ПК в России. Мы учим создавать кооперативы для закупки удобрений, реализации продукции, совместной переработки. Нулевой НДС при реализации сельхозпродукции через ПК — это реальность, которой пользуются тысячи фермеров.`,
  trade: `Торговые компании используют ПК для закупки товаров через кооператив, снижения НДС при реализации, организации оптовых поставок. Кооперативная модель особенно эффективна для торговых сетей и дистрибьюторов, работающих с узкой маржой.`,
  lawyers: `Юристы и бухгалтеры, прошедшие наши курсы, получают уникальную специализацию в области потребительской кооперации. Это востребованная ниша: спрос на специалистов по ПК растёт на 30-40% ежегодно. Вы сможете консультировать предприятия по вопросам создания и управления ПК, сопровождать регистрацию, вести документооборот.`,
};

// Дополнительный текст для "Почему выбирают"
const whyExtra = {
  honesty: `Мы не продаём «волшебную таблетку». Потребительская кооперация имеет риски: повышенное внимание ФНС, необходимость ведения сложного документооборота, ограничения по видам деятельности. Мы учим, как работать с каждым из этих рисков, и даём конкретные инструкции: как подготовиться к проверке, как правильно оформить документы, как не допустить ошибок при работе с банками.`,
  documents: `Все шаблоны документов — Устав, Протоколы, Заявления, Акты, Целевые программы — составлены практикующими юристами и проверены в реальных кооперативах. Вам не нужно искать образцы в интернете и адаптировать их под свой случай — всё готово к использованию. Просто подставьте свои данные.`,
  team: `Обучение одного человека — это потеря инвестиций, если он уволится. Поэтому мы даём доступ для команды: от 5 логинов в базовом пакете до неограниченного в VIP. Председатель, бухгалтер, юрист — каждый проходит свой модуль и получает практические навыки для своей роли в кооперативе.`,
  support: `Потребительский кооператив — это живой организм. Вопросы возникают постоянно: как оформить нового пайщика, как провести общее собрание, как работать с 115-ФЗ. Наши курсы включают консалтинг: от 3 месяцев в базовом пакете до 12 месяцев в VIP. Вы можете задавать вопросы и получать ответы от практикующих специалистов.`,
};

// Дополнительный текст для блока "Кто будет вас обучать?"
const instructorExtra = `Велеслав Старков — практик, а не теоретик. Он является сооснователем действующего ПК «ВМЕСТЕ Пермь», который работает с 2015 года. За 20 лет предпринимательской деятельности он прошёл путь от создания первого кооператива до разработки авторской методики С500, которую используют более 120 предприятий по всей России. Его подход — это не академические лекции, а пошаговые инструкции, основанные на реальном опыте ведения кооперативного бизнеса.`;

/* ─── Список изображений для добавления ─── */
const imagesToAdd = [
  {
    url: `${SITE_URL}/images/course-free.webp`,
    alt: 'Бесплатный курс: 13 уроков по потребительскому кооперативу',
    block: 'pricing',
    position: 'free',
  },
  {
    url: `${SITE_URL}/images/course-start.webp`,
    alt: 'Спецпредложение Старт: документы для регистрации ПК',
    block: 'pricing',
    position: 'start',
  },
  {
    url: `${SITE_URL}/images/course-basic.webp`,
    alt: 'Пакет Базовый: полный документооборот и консалтинг по ПК',
    block: 'pricing',
    position: 'basic',
  },
  {
    url: `${SITE_URL}/images/course-optimal.webp`,
    alt: 'Пакет Оптимальный: ПК и аффилированные ООО, 115-ФЗ, банки',
    block: 'pricing',
    position: 'optimal',
  },
  {
    url: `${SITE_URL}/images/course-vip.webp`,
    alt: 'Пакет ВИП: индивидуальное сопровождение по внедрению ПК',
    block: 'pricing',
    position: 'vip',
  },
  {
    url: `${SITE_URL}/images/instructor-veleslav.webp`,
    alt: 'Велеслав Старков — основатель Школы потребительской кооперации',
    block: 'instructor',
    position: 'photo',
  },
  {
    url: `${SITE_URL}/images/hero-cooperation.webp`,
    alt: 'Обучение потребительской кооперации: курсы по ПК для бизнеса 2026',
    block: 'hero',
    position: 'background',
  },
];

/* ─── Main ─── */
async function main() {
  console.log('🔄 Поиск страницы курсов в Payload CMS...');
  const page = await getPage('kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn');

  if (!page) {
    console.error('❌ Страница не найдена! Убедитесь, что slug правильный.');
    process.exit(1);
  }

  console.log(`✅ Найдена страница: "${page.title}" (ID: ${page.id})`);
  console.log(`   Блоков: ${page.blocks?.length || 0}`);

  // Обновить metaDescription, если короткое
  let updates = {};
  const currentDesc = page.metaDescription || '';
  if (currentDesc.length < 150) {
    updates.metaDescription = 'Онлайн-курсы по созданию и управлению потребительским кооперативом. Обучение с нуля. Защита активов, налоговая оптимизация, кооперативные выплаты. Бесплатный вводный курс — 13 уроков. Авторская методика Велеслава Старкова.';
    console.log('📝 Обновлено metaDescription');
  }

  // Добавить OG-изображение, если отсутствует
  if (!page.ogImage) {
    updates.ogImage = `${SITE_URL}/images/og-preview.webp`;
    console.log('🖼️ Добавлено ogImage');
  }

  // Обогатить текстовые блоки
  if (page.blocks) {
    const enrichedBlocks = page.blocks.map((block) => {
      switch (block.blockType) {
        case 'text': {
          // Добавить дополнительный текст к текстовому блоку
          const existingBody = block.body;
          if (existingBody?.root?.children) {
            // Добавить параграфы с дополнительным контентом
            const extraParagraphs = [];

            // Проверяем, содержит ли блок текст о налогах
            const textContent = JSON.stringify(existingBody);
            if (textContent.includes('налог') || textContent.includes('НДС')) {
              extraParagraphs.push({
                type: 'paragraph',
                style: '',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    mode: 'normal',
                    text: taxPressureExtra,
                    type: 'text',
                    style: '',
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                textStyle: '',
                textFormat: 0,
              });
            }

            if (textContent.includes('научитесь') || textContent.includes('научит')) {
              extraParagraphs.push({
                type: 'paragraph',
                style: '',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    mode: 'normal',
                    text: learnExtra,
                    type: 'text',
                    style: '',
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                textStyle: '',
                textFormat: 0,
              });
            }

            if (extraParagraphs.length > 0) {
              return {
                ...block,
                body: {
                  ...existingBody,
                  root: {
                    ...existingBody.root,
                    children: [...existingBody.root.children, ...extraParagraphs],
                  },
                },
              };
            }
          }
          return block;
        }

        case 'features': {
          // Добавить описания к блоку "Почему выбирают"
          const enrichedFeatures = (block.features || []).map((feat) => {
            if (feat.title?.includes('минус') || feat.title?.includes('Минус')) {
              return { ...feat, description: `${feat.description}\n\n${whyExtra.honesty}` };
            }
            if (feat.title?.includes('документ') || feat.title?.includes('Документ')) {
              return { ...feat, description: `${feat.description}\n\n${whyExtra.documents}` };
            }
            if (feat.title?.includes('команд') || feat.title?.includes('Команд')) {
              return { ...feat, description: `${feat.description}\n\n${whyExtra.team}` };
            }
            if (feat.title?.includes('поддержк') || feat.title?.includes('Поддержк')) {
              return { ...feat, description: `${feat.description}\n\n${whyExtra.support}` };
            }
            return feat;
          });
          return { ...block, features: enrichedFeatures };
        }

        case 'cards': {
          // Добавить описания к карточкам "Кому подойдут"
          const enrichedCards = (block.cards || []).map((card) => {
            if (card.title?.includes('Производств')) {
              return { ...card, description: `${card.description} ${audienceExtra.production}` };
            }
            if (card.title?.includes('Строительств')) {
              return { ...card, description: `${card.description} ${audienceExtra.construction}` };
            }
            if (card.title?.includes('Сельск') || card.title?.includes('сельск')) {
              return { ...card, description: `${card.description} ${audienceExtra.agriculture}` };
            }
            if (card.title?.includes('Торговл')) {
              return { ...card, description: `${card.description} ${audienceExtra.trade}` };
            }
            if (card.title?.includes('Юрист') || card.title?.includes('Бухгалтер')) {
              return { ...card, description: `${card.description} ${audienceExtra.lawyers}` };
            }
            return card;
          });
          return { ...block, cards: enrichedCards };
        }

        case 'instructor': {
          // Добавить подробное описание преподавателя
          return {
            ...block,
            body: block.body || {
              root: {
                type: 'root',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    type: 'paragraph',
                    style: '',
                    format: '',
                    indent: 0,
                    version: 1,
                    children: [
                      {
                        mode: 'normal',
                        text: instructorExtra,
                        type: 'text',
                        style: '',
                        detail: 0,
                        format: 0,
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    textStyle: '',
                    textFormat: 0,
                  },
                ],
                direction: 'ltr',
                textFormat: 0,
              },
            },
          };
        }

        default:
          return block;
      }
    });

    updates.blocks = enrichedBlocks;
    console.log('📝 Блоки обогащены дополнительным контентом');
  }

  // Применить обновления
  if (Object.keys(updates).length > 0) {
    console.log('🔄 Применение обновлений...');
    const result = await updatePage(page.id, updates);
    console.log('✅ Страница обновлена!');
    console.log(`   Обновлено полей: ${Object.keys(updates).join(', ')}`);
  } else {
    console.log('ℹ️ Обновления не требуются');
  }

  // Вывести рекомендации по изображениям
  console.log('\n📋 РЕКОМЕНДАЦИИ ПО ИЗОБРАЖЕНИЯМ:');
  console.log('Необходимо загрузить следующие изображения в /public/images/ или S3:');
  for (const img of imagesToAdd) {
    console.log(`  - ${img.url} (alt: ${img.alt})`);
  }
  console.log('\nДля добавления изображений в блоки:');
  console.log('  1. Загрузите файлы на сервер');
  console.log('  2. В Payload CMS добавьте изображения к соответствующим блокам');
  console.log('  3. Укажите alt-теги как указано выше');
}

main().catch(console.error);
