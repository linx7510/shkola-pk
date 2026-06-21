import Link from "next/link"
import Reveal from "@/components/Reveal"

export interface CardsBlockData {
  title?: string
  cards: Array<{ icon?: string; title: string; description: string; link?: string }>
}

/**
 * Извлекает цену и срок из описания карточки.
 * Поддерживаемые форматы (как в Payload CMS):
 *   "Цена: от 15 000 ₽, срок: 3–5 дней."
 *   "Цена: 25 000 – 35 000 ₽, срок: 5–7 дней."
 *   "Цена: от 15 000 ₽/квартал, срок: по договору."
 *   "Цена: 6 000 ₽."
 *   "Цена: на сайте, доступ навсегда."
 */
function extractPrice(description: string): { price: string | null; note: string | null; cleanDesc: string } {
  if (!description) return { price: null, note: null, cleanDesc: "" }

  // Ищем блок "Цена: ... срок: ..." или "Цена: ..."
  const priceMatch = description.match(/Цена:\s*([^.,]+?)(?:[.,]|\s+срок:|$)/i)
  const noteMatch = description.match(/срок:\s*([^.,]+?)(?:[.,]|$)/i)

  let price: string | null = null
  let note: string | null = null

  if (priceMatch && priceMatch[1]) {
    price = priceMatch[1].trim()
    // Если цена не содержит цифр — это не цена, а текст (например "на сайте")
    if (!/\d/.test(price)) {
      price = null
    }
  }

  if (noteMatch && noteMatch[1]) {
    note = noteMatch[1].trim()
  }

  // Удаляем "Цена: ... срок: ..." и "Цена: ..." из описания
  let cleanDesc = description
    .replace(/Цена:\s*[^.,]+?(?:[.,]|\s+срок:|\s*$)/i, "")
    .replace(/срок:\s*[^.,]+?(?:[.,]|$)/i, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()

  // Если после очистки ничего не осталось — возвращаем оригинал
  if (!cleanDesc) cleanDesc = description

  return { price, note, cleanDesc }
}

export function CardsBlock({ data }: { data: CardsBlockData }) {
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {data.title && (
          <Reveal>
            <h2
              className="section-title heading-sweep"
              data-text={data.title}
              style={{
                fontSize: "2rem",
                color: "#E7DCCF",
                marginBottom: "2.5rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {data.title}
            </h2>
          </Reveal>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {data.cards.map((c, i) => {
            const { price, note, cleanDesc } = extractPrice(c.description)
            const cardInner = (
              <div className="service-card">
                <div>
                  <div className="service-card__head">
                    {c.icon && <span className="service-card__icon">{c.icon}</span>}
                    {price && (
                      <div className="service-card-price">
                        <span className="service-card-price__value">{price}</span>
                        {note && <span className="service-card-price__note">{note}</span>}
                      </div>
                    )}
                  </div>
                  <h3 className="service-card__title">{c.title}</h3>
                  <p className="service-card__desc">{cleanDesc}</p>
                </div>
                {c.link && <div className="service-card__more">Подробнее →</div>}
              </div>
            )
            return (
              <Reveal key={i} delay={i + 1}>
                {c.link ? (
                  <Link href={c.link} style={{ textDecoration: "none", color: "inherit" }}>
                    {cardInner}
                  </Link>
                ) : (
                  cardInner
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
