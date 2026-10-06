/* Вставка страницы «Наши мероприятия» (about-us/meropriyatiya) через Payload Local API.
   Запуск: cd /var/www/shkola-pk/apps/payload && NODE_ENV=production node_modules/.bin/tsx scripts-create-events-page.ts */
import fs from 'fs'
import path from 'path'

// мини-парсер .env (dotenv не входит в зависимости приложения)
for (const line of fs.readFileSync(path.resolve('/var/www/shkola-pk/apps/payload/.env'), 'utf-8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

import config from './payload.config'
import { getPayload } from 'payload'

// ── Lexical helpers (структура 1:1 с существующими страницами) ──
const t = (s: string) => ({ mode: 'normal', text: s, type: 'text', style: '', detail: 0, format: 0, version: 1 })
const para = (s: string) => ({ type: 'paragraph', style: '', format: '', indent: 0, version: 1, children: [t(s)], direction: 'ltr', textStyle: '', textFormat: 0 })
const li = (s: string, value: number) => ({ type: 'listitem', style: '', value, format: '', indent: 0, version: 1, children: [t(s)], direction: 'ltr', textStyle: '', textFormat: 0 })
const list = (items: string[]) => ({ type: 'list', style: '', format: '', indent: 0, version: 1, listType: 'bullet', direction: 'ltr', textStyle: '', textFormat: 0, children: items.map((s, i) => li(s, i + 1)) })
const rich = (...children: any[]) => ({ root: { type: 'root', format: '', indent: 0, version: 1, children, direction: 'ltr', textStyle: '', textFormat: 0 } })

const MAIL_SUBJ = encodeURIComponent('Запись на мероприятие')

async function main() {
  const payload = await getPayload({ config })

  // ── 1. Страница «Наши мероприятия» ──
  const blocks: any[] = [
    {
      blockType: 'hero',
      title: 'Наши мероприятия',
      subtitle: 'Деловые завтраки и бизнес-сессии Школы ПК в городах России. Живые встречи, на которых разбираем кооперативную модель С500, налоги и защиту бизнеса — и отвечаем на ваши вопросы лично.',
      ctaText: 'Записаться на встречу',
      ctaLink: `mailto:boss@2980738.ru?subject=${MAIL_SUBJ}`,
      ctaText2: 'Позвонить: 8 902 472-07-38',
      ctaLink2: 'tel:+79024720738',
      backgroundImage: null,
    },
    {
      blockType: 'text',
      title: 'Зачем мы встречаемся вживую',
      body: rich(
        para('Онлайн-школа даёт знания, а живые встречи дают контакты и решения. За одним столом собираются действующие и будущие руководители потребительских кооперативов, производители, предприниматели — и за два-три часа разбираем то, что в переписке занимает недели.'),
        list([
          'Личное знакомство с Велеславом Старковым и командой Школы ПК',
          'Разбор вашей ситуации с кооперативом: устав, Положения, налоги, пайщики',
          'Главные темы сессий: модель С500, обнуление исходящего НДС, целевые потребительские программы, защита от претензий ФНС',
          'Нетворкинг: председатели, пайщики и производители из вашего региона',
        ]),
      ),
      backgroundColor: 'transparent',
    },
    {
      blockType: 'cards',
      title: 'Расписание мероприятий',
      blockName: null,
      cards: [
        {
          icon: '🏙',
          title: 'Москва — 12 октября 2026',
          description: 'Деловой завтрак и бизнес-сессия. Личное знакомство, разбор вашей ситуации с ПК: обнуление НДС, ЦПП, защита от ФНС. Место и время уточняем при записи — количество мест ограничено.',
          link: `mailto:boss@2980738.ru?subject=${encodeURIComponent('Запись на встречу в Москве 12 октября')}`,
        },
        {
          icon: '📍',
          title: 'Ваш город — в плане',
          description: 'Мы не сидим в одном месте: ездим по стране. Соберёте группу от 5 руководителей и предпринимателей — привезём деловой завтрак и бизнес-сессию к вам. Напишите, обсудим дату.',
          link: `mailto:boss@2980738.ru?subject=${encodeURIComponent('Мероприятие в моём городе')}`,
        },
        {
          icon: '💻',
          title: 'Онлайн-форматы',
          description: 'Для тех, кто пока не может приехать: разборы, эфиры и ответы на вопросы — в каналах и курсах Школы ПК.',
          link: '/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn',
        },
      ],
    },
    {
      blockType: 'text',
      title: 'Как проходит встреча',
      body: rich(
        para('Формат проверен на десятках встреч — без скучных презентаций и «воды»:'),
        list([
          'Деловой завтрак — знакомимся без галстуков, обмениваемся опытом и контактами',
          'Бизнес-сессия — разбираем кооперативную модель на живых примерах: от философии кооперации до конкретных расчётов на вашей цифрах',
          'Личные консультации — остаёмся, чтобы ответить на вопросы каждого участника',
        ]),
        para('С собой достаточно желания разобраться в кооперации. Свою ситуацию можно принести в любом виде — от «есть идея» до «работающий кооператив с проблемами».'),
      ),
      backgroundColor: 'transparent',
    },
    {
      blockType: 'faq',
      title: 'Вопросы о мероприятиях',
      items: [
        {
          question: 'Кто может прийти?',
          answer: rich(para('Руководители и пайщики потребительских кооперативов, предприниматели и производители, а также те, кто только планирует создать кооператив и хочет разобраться в модели лично.')),
        },
        {
          question: 'Нужно ли записываться заранее?',
          answer: rich(para('Да: количество мест ограничено размером зала. Напишите на boss@2980738.ru или позвоните по номеру 8 902 472-07-38 — подтвердим участие и пришлём адрес и время.')),
        },
        {
          question: 'Можно ли привести партнёра или компаньона?',
          answer: rich(para('Можно — и даже нужно: решения по кооперативу лучше принимать вместе. Только укажите количество участников при записи, чтобы мы зарезервировали места.')),
        },
        {
          question: 'Я в другом городе — как попасть?',
          answer: rich(para('Напишите свой город: если соберётся группа от 5 человек, организуем встречу у вас. А пока подключайтесь к онлайн-форматам — знания те же, формат дистанционный.')),
        },
      ],
    },
    {
      blockType: 'cta',
      title: 'Записаться на мероприятие',
      description: 'Напишите или позвоните — ответим на вопросы, подтвердим место и пришлём программу и адрес ближайшей встречи.',
      buttonText: 'Позвонить: 8 902 472-07-38',
      buttonLink: 'tel:+79024720738',
      buttonText2: 'Написать на email',
      buttonLink2: `mailto:boss@2980738.ru?subject=${MAIL_SUBJ}`,
      backgroundImage: null,
    },
  ]

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about-us/meropriyatiya' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data: { title: 'Наши мероприятия', isPublished: true, blocks } as any })
    console.log('PAGE UPDATED id=' + existing.docs[0].id)
  } else {
    const created = await payload.create({ collection: 'pages', data: { title: 'Наши мероприятия', slug: 'about-us/meropriyatiya', isPublished: true, blocks } as any })
    console.log('PAGE CREATED id=' + created.id)
  }

  // ── 2. Ссылка из страницы «О нас» (карточка перед FAQ) ──
  const about = await payload.findByID({ collection: 'pages', id: 27 })
  const layout: any[] = (about as any).blocks || []
  const already = layout.some((b: any) => b.blockType === 'cards' && JSON.stringify(b.cards || '').includes('about-us/meropriyatiya'))
  if (!already) {
    const idx = Math.min(10, layout.length) // после «Где меня найти», до FAQ
    layout.splice(idx, 0, {
      blockType: 'cards',
      title: 'Живые встречи',
      blockName: null,
      cards: [
        {
          icon: '🤝',
          title: 'Наши мероприятия',
          description: 'Деловые завтраки и бизнес-сессии в городах России. Ближайшая встреча — Москва, 12 октября 2026. Запись открыта.',
          link: '/about-us/meropriyatiya',
        },
      ],
    })
    await payload.update({ collection: 'pages', id: 27, data: { blocks: layout } as any })
    console.log('ABOUT-US LINK ADDED')
  } else {
    console.log('ABOUT-US LINK ALREADY THERE')
  }

  // ── 3. Дропдаун «О нас» в шапке ──
  const header = await payload.findGlobal({ slug: 'header' })
  const items: any[] = (header as any).menuItems || []
  const aboutItem = items.find((m: any) => (m.href || '').startsWith('/about-us') || m.label === 'О нас')
  if (aboutItem && !aboutItem.hasDropdown) {
    aboutItem.hasDropdown = true
    aboutItem.dropdownItems = [
      { label: 'О нас', href: '/about-us' },
      { label: 'Наши мероприятия', href: '/about-us/meropriyatiya' },
    ]
    await payload.updateGlobal({ slug: 'header', data: { menuItems: items } as any })
    console.log('HEADER DROPDOWN ADDED')
  } else if (aboutItem) {
    console.log('HEADER DROPDOWN ALREADY THERE')
  } else {
    console.log('HEADER: item «О нас» not found, skipped')
  }

  console.log('DONE')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
