import Header from "@/components/Header"
import { BlockRenderer } from "@/components/BlockRenderer"

export const metadata = {
  title: "Демо блоков — Block Renderer",
  description: "Тестовая страница для проверки 8 типов Structured Blocks",
}

const demoBlocks = [
  {
    blockType: "hero",
    title: "Потребительский кооператив — защита активов",
    subtitle: "Обучение, консультации, готовые решения от Велеслава Старкова",
    ctaText: "Выбрать курс",
    ctaLink: "/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn",
  },
  {
    blockType: "stats",
    title: "Цифры Школы ПК",
    stats: [
      { value: "2015", label: "Работаем с", icon: "📅" },
      { value: "120+", label: "выпускников", icon: "🎓" },
      { value: "0%", label: "НДС по закону", icon: "💰" },
      { value: "12 мес", label: "поддержка", icon: "🤝" },
    ],
  },
  {
    blockType: "features",
    title: "Преимущества кооператива",
    features: [
      { icon: "🛡️", title: "Защита имущества", description: "ПК не отвечает по долгам пайщиков" },
      { icon: "✅", title: "Никаких проверок", description: "Закон РФ № 3085-1 освобождает" },
      { icon: "💳", title: "Онлайн-касса не нужна", description: "Нет продаж, есть возврат паёв" },
      { icon: "🗳️", title: "Один пайщик — один голос", description: "Демократическое управление" },
    ],
  },
  {
    blockType: "pricing",
    title: "Услуги",
    plans: [
      { name: "Аудит устава", price: "от 15 000 ₽", features: ["Проверка по закону 3085-1", "Выявление рисков"], ctaText: "Заказать", ctaLink: "/uslugi" },
      { name: "ПК под ключ", price: "90 000 ₽", features: ["Устав", "Протокол", "ЕГРЮЛ"], ctaText: "Заказать", ctaLink: "/uslugi", highlighted: true },
      { name: "Сопровождение ФНС", price: "15 000 ₽", features: ["Анализ рисков", "Пояснения"], ctaText: "Заказать", ctaLink: "/uslugi" },
    ],
  },
  {
    blockType: "faq",
    title: "Частые вопросы",
    items: [
      { question: "Что такое потребительский кооператив?", answer: "Некоммерческая организация для удовлетворения материальных потребностей участников. Освобождена от НДС, налога на прибыль, НДФЛ." },
      { question: "Правда ли что налоги 0%?", answer: "Да, законно. Кооперативная цена = себестоимость, налоговая база = 0." },
      { question: "Как ПК защищает имущество?", answer: "ПК не отвечает по долгам пайщиков, субсидиарная ответственность ограничена паевым взносом." },
    ],
  },
  {
    blockType: "cta",
    title: "Готовы начать?",
    subtitle: "Запишитесь на бесплатную консультацию — разберём вашу ситуацию",
    ctaText: "Бесплатная консультация",
    ctaLink: "/konsultacii",
  },
]

export default function TestBlocksPage() {
  return (
    <>
      <Header />
      <main style={{ background: "#0D0C0A", minHeight: "100vh" }}>
        <BlockRenderer blocks={demoBlocks} />
      </main>
    </>
  )
}

