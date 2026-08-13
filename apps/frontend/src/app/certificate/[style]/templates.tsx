import type { CSSProperties, ReactNode } from "react";

/**
 * Три шаблона сертификатов о прохождении онлайн-курса Школы ПК.
 * Все — A4 landscape (297×210mm), print-friendly, без внешних изображений
 * (только CSS + эмодзи). Подпись единая: Велеслав Старков, Председатель Правления.
 */

export interface CertData {
  /** Имя выпускника (как есть) */
  name: string;
  /** Название курса */
  course: string;
  /** Дата в человекочитаемом виде (ru) */
  date: string;
  /** Номер сертификата, напр. ШПК-2026-0042 */
  number: string;
}

export const SIGNATURE_NAME = "Велеслав Старков";
export const SIGNATURE_ROLE = "Председатель Правления";

const SERIF =
  "Georgia,'Times New Roman','Playfair Display',Cambria,serif";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,'Helvetica Neue',Arial,sans-serif";

const LESSON_COUNT = 13;

/* ────────────────────────────────────────────────────────────────────────── */
/*  TEMPLATE 1 — CLASSIC (официальный, бордовый с золотом)                     */
/* ────────────────────────────────────────────────────────────────────────── */

const CLASSIC = {
  bordo: "#5C2A2A",
  bordoDeep: "#3F1B1B",
  gold: "#C9A961",
  goldDeep: "#A88845",
  cream: "#FAF6EE",
  ink: "#2A1A1A",
  inkSoft: "#5a4646",
};

function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base: CSSProperties = {
    position: "absolute",
    width: 34,
    height: 34,
    color: CLASSIC.gold,
    fontSize: 26,
    lineHeight: "34px",
    textAlign: "center",
    opacity: 0.95,
  };
  const pos: Record<typeof position, CSSProperties> = {
    tl: { top: -2, left: 2 },
    tr: { top: -2, right: 2 },
    bl: { bottom: -4, left: 2 },
    br: { bottom: -4, right: 2 },
  };
  const glyph = position.startsWith("t") ? "❦" : "❦";
  return (
    <span style={{ ...base, ...pos[position] }} aria-hidden>
      {glyph}
    </span>
  );
}

/** Круглая печать (CSS, без изображений) */
function ClassicSeal() {
  return (
    <div
      aria-hidden
      style={{
        width: 122,
        height: 122,
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: CLASSIC.bordo,
        background: "rgba(250,246,238,0.4)",
        border: `2px solid ${CLASSIC.bordo}`,
        boxShadow: `0 0 0 2px ${CLASSIC.cream}, 0 0 0 3px ${CLASSIC.gold}, 0 0 0 5px ${CLASSIC.cream}, 0 0 0 6px ${CLASSIC.bordo}`,
        transform: "rotate(-7deg)",
        fontFamily: SERIF,
      }}
    >
      <div style={{ fontSize: 22, lineHeight: 1, color: CLASSIC.bordoDeep }}>❦</div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 1.5,
          marginTop: 5,
        }}
      >
        ШКОЛА ПК
      </div>
      <div
        style={{
          fontSize: 8,
          letterSpacing: 3,
          color: CLASSIC.goldDeep,
          marginTop: 2,
        }}
      >
        · ПЕЧАТЬ ·
      </div>
      <div style={{ fontSize: 7.5, marginTop: 2, opacity: 0.75 }}>с 2015</div>
    </div>
  );
}

export function ClassicCertificate({ data }: { data: CertData }) {
  const fullName = data.name.trim() || "Выпускник Школы ПК";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: CLASSIC.bordoDeep,
        padding: 12,
        boxSizing: "border-box",
        display: "flex",
      }}
    >
      {/* Внутренняя кремовая карточка с двойной золотой рамкой */}
      <div
        style={{
          flex: 1,
          background: CLASSIC.cream,
          border: `3px double ${CLASSIC.gold}`,
          outline: `1px solid ${CLASSIC.bordo}`,
          outlineOffset: -9,
          padding: "16mm 18mm 14mm",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: SERIF,
          color: CLASSIC.ink,
        }}
      >
        <CornerOrnament position="tl" />
        <CornerOrnament position="tr" />
        <CornerOrnament position="bl" />
        <CornerOrnament position="br" />

        {/* Шапка — организация */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12.5,
              letterSpacing: 6,
              color: CLASSIC.goldDeep,
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            ❦ ❦ ❦
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 3,
              color: CLASSIC.bordo,
              textTransform: "uppercase",
            }}
          >
            Школа Потребительских Коопераций
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: CLASSIC.inkSoft,
              marginTop: 3,
              fontStyle: "italic",
            }}
          >
            с 2015 года · велеслав.рус
          </div>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,transparent,${CLASSIC.gold},transparent)`,
              margin: "10px auto 0",
              width: "62%",
            }}
          />
        </div>

        {/* Заголовок СЕРТИФИКАТ */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 8,
              color: CLASSIC.bordo,
              lineHeight: 1,
            }}
          >
            СЕРТИФИКАТ
          </div>
          <div
            style={{
              width: 220,
              height: 2,
              margin: "8px auto 4px",
              background: CLASSIC.gold,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "50%",
                top: -7,
                width: 12,
                height: 12,
                background: CLASSIC.cream,
                border: `2px solid ${CLASSIC.gold}`,
                transform: "translateX(-50%) rotate(45deg)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 11.5,
              letterSpacing: 5,
              color: CLASSIC.inkSoft,
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            О успешном прохождении онлайн-курса
          </div>
        </div>

        {/* Тело — имя и курс */}
        <div style={{ textAlign: "center", marginTop: 20, flex: 1 }}>
          <div style={{ fontSize: 14, color: CLASSIC.inkSoft, fontStyle: "italic" }}>
            Настоящим подтверждается, что
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: CLASSIC.bordoDeep,
              margin: "10px 0 6px",
              letterSpacing: 1.5,
              lineHeight: 1.1,
            }}
          >
            {fullName.toUpperCase()}
          </div>
          <div
            style={{
              width: 260,
              height: 1,
              borderBottom: `1px dotted ${CLASSIC.goldDeep}`,
              margin: "0 auto 12px",
            }}
          />
          <div style={{ fontSize: 15, color: CLASSIC.ink, lineHeight: 1.5 }}>
            успешно прошёл(а) курс{" "}
            <span style={{ fontWeight: 700, color: CLASSIC.bordo }}>
              «{data.course}»
            </span>
            <br />
            в объёме {LESSON_COUNT} уроков и подтвердил(а) полученные знания.
          </div>
        </div>

        {/* Низ — дата/№ + печать/подпись */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 10,
          }}
        >
          <div style={{ fontFamily: SERIF }}>
            <div style={{ fontSize: 11, color: CLASSIC.inkSoft }}>Дата выдачи</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: CLASSIC.bordo }}>
              {data.date}
            </div>
            <div style={{ fontSize: 11, color: CLASSIC.inkSoft, marginTop: 6 }}>
              Рег. №
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: CLASSIC.ink }}>
              {data.number}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
            <ClassicSeal />
            <div style={{ textAlign: "center", minWidth: 170 }}>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 17,
                  fontStyle: "italic",
                  color: CLASSIC.bordoDeep,
                  transform: "rotate(-3deg)",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                  opacity: 0.85,
                }}
              >
                {SIGNATURE_NAME}
              </div>
              <div
                style={{
                  width: 170,
                  borderTop: `1px solid ${CLASSIC.ink}`,
                  margin: "0 auto 4px",
                }}
              />
              <div style={{ fontSize: 11, color: CLASSIC.ink, fontWeight: 600 }}>
                {SIGNATURE_NAME}
              </div>
              <div style={{ fontSize: 9.5, color: CLASSIC.inkSoft, marginTop: 1 }}>
                {SIGNATURE_ROLE}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  TEMPLATE 2 — MODERN (premium, тёмный)                                      */
/* ────────────────────────────────────────────────────────────────────────── */

const MODERN = {
  bg: "#0D0C0A",
  bgSoft: "#15130F",
  text: "#E7DCCF",
  textDim: "#8a8074",
  gold: "#C9A961",
  green: "#6DB89A",
};

export function ModernCertificate({ data }: { data: CertData }) {
  const fullName = data.name.trim() || "Выпускник Школы ПК";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: MODERN.bg,
        color: MODERN.text,
        padding: "20mm 22mm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
        position: "relative",
      }}
    >
      {/* Тонкие золотые линии сверху/снизу */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 22,
          right: 22,
          height: 1,
          background: `linear-gradient(90deg,transparent,${MODERN.gold} 20%,${MODERN.gold} 80%,transparent)`,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 22,
          right: 22,
          height: 1,
          background: `linear-gradient(90deg,transparent,${MODERN.gold} 20%,${MODERN.gold} 80%,transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Шапка */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 2,
            color: MODERN.text,
          }}
        >
          <span style={{ color: MODERN.gold, marginRight: 6 }}>▌</span>ШКОЛА ПК
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: MODERN.textDim,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: MODERN.green }}>●</span> certified
        </div>
      </div>

      {/* Центр */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 15,
            letterSpacing: 10,
            color: MODERN.gold,
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Сертификат
        </div>

        <div
          style={{
            fontSize: 15,
            color: MODERN.textDim,
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          подтверждает, что курс прошёл
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: MODERN.text,
            letterSpacing: 0.5,
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          {fullName}
        </div>

        {/* Линия-разделитель с золотой серединкой */}
        <div
          style={{
            width: 320,
            height: 1,
            background: `linear-gradient(90deg,transparent,${MODERN.textDim},transparent)`,
            position: "relative",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 8,
              height: 8,
              background: MODERN.bg,
              border: `1.5px solid ${MODERN.gold}`,
              transform: "translate(-50%,-50%) rotate(45deg)",
            }}
          />
        </div>

        <div style={{ fontSize: 18, color: MODERN.text, fontWeight: 500 }}>
          «{data.course}»
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: MODERN.textDim,
            marginTop: 8,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{LESSON_COUNT} уроков</span>
          <span style={{ color: MODERN.gold }}>·</span>
          <span style={{ color: MODERN.green }}>100% завершено</span>
        </div>
      </div>

      {/* Низ — метаданные в линию + подпись */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            fontSize: 11,
            color: MODERN.textDim,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          <Meta label="№" value={data.number} />
          <Divider />
          <Meta label="Дата" value={data.date} />
          <Divider />
          <Meta label="Школа ПК" value="велеслав.рус" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Печать ✦ */}
          <div
            aria-hidden
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              border: `1.5px solid ${MODERN.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MODERN.gold,
              fontSize: 24,
              boxShadow: `0 0 0 4px ${MODERN.bg}, 0 0 0 5px ${MODERN.gold}55`,
            }}
          >
            ✦
          </div>

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 16,
                fontStyle: "italic",
                color: MODERN.gold,
                letterSpacing: 0.3,
                opacity: 0.9,
              }}
            >
              {SIGNATURE_NAME}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: MODERN.textDim,
                marginTop: 2,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {SIGNATURE_ROLE}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ color: "#6a6258" }}>{label}</span>
      <span style={{ color: MODERN.text, fontWeight: 600 }}>{value}</span>
    </span>
  );
}

function Divider() {
  return (
    <span
      style={{ color: MODERN.gold, opacity: 0.6, padding: "0 16px" }}
      aria-hidden
    >
      |
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  TEMPLATE 3 — MINIMAL (светлый, дружелюбный)                                */
/* ────────────────────────────────────────────────────────────────────────── */

const MINIMAL = {
  bg: "#FFFFFF",
  text: "#1A1A24",
  textSoft: "#5b5b66",
  green: "#6DB89A",
  greenDeep: "#4a9d80",
  line: "#E0E0E0",
};

/** Полоса прогресса из CSS-блоков */
function ProgressBlocks({ total, done }: { total: number; done: number }) {
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 12,
            borderRadius: 2,
            background: i < done ? MINIMAL.green : MINIMAL.line,
            display: "inline-block",
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function Pipe() {
  return (
    <span
      aria-hidden
      style={{ color: "#d6d6db", fontSize: 20, fontWeight: 300 }}
    >
      │
    </span>
  );
}

function FooterCol({
  top,
  value,
  valueColor,
  right,
}: {
  top: string;
  value: string;
  valueColor: string;
  right?: boolean;
}) {
  return (
    <div style={{ textAlign: right ? "right" : "left" }}>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: MINIMAL.textSoft,
        }}
      >
        {top}
      </div>
      <div
        style={{
          fontSize: 13,
          color: valueColor,
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function MinimalCertificate({ data }: { data: CertData }) {
  const fullName = data.name.trim() || "Выпускник Школы ПК";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: MINIMAL.bg,
        color: MINIMAL.text,
        padding: "22mm 26mm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
      }}
    >
      {/* Шапка */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
            ШКОЛА ПОТРЕБИТЕЛЬСКИХ КООПЕРАЦИЙ
          </div>
          <div
            style={{
              fontSize: 11,
              color: MINIMAL.textSoft,
              letterSpacing: 1,
            }}
          >
            {data.number}
          </div>
        </div>
        <div
          style={{
            height: 1,
            background: MINIMAL.line,
            marginTop: 10,
          }}
        />
      </div>

      {/* Центр */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 13,
            letterSpacing: 6,
            color: MINIMAL.greenDeep,
            fontWeight: 700,
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: MINIMAL.green,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✓
          </span>
          Сертификат о прохождении
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: MINIMAL.text,
            letterSpacing: -0.5,
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          {fullName}
        </div>

        <div style={{ fontSize: 15, color: MINIMAL.textSoft, marginBottom: 22 }}>
          завершил(а) курс{" "}
          <span style={{ color: MINIMAL.text, fontWeight: 600 }}>
            «{data.course}»
          </span>
        </div>

        {/* Прогресс */}
        <ProgressBlocks total={LESSON_COUNT} done={LESSON_COUNT} />
        <div
          style={{
            fontSize: 12,
            color: MINIMAL.greenDeep,
            fontWeight: 600,
            marginTop: 8,
            letterSpacing: 0.5,
          }}
        >
          {LESSON_COUNT}/{LESSON_COUNT} уроков · курс пройден полностью
        </div>
      </div>

      {/* Низ — дата │ id │ подпись │ Школа ПК */}
      <div>
        <div
          style={{
            height: 1,
            background: MINIMAL.line,
            marginBottom: 16,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: MINIMAL.textSoft,
          }}
        >
          <FooterCol
            top="Дата"
            value={data.date}
            valueColor={MINIMAL.text}
          />
          <Pipe />
          <FooterCol top="id" value={data.number} valueColor={MINIMAL.text} />
          <Pipe />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: MINIMAL.textSoft,
              }}
            >
              Подпись
            </div>
            <div
              style={{
                fontSize: 13,
                color: MINIMAL.text,
                fontWeight: 600,
                fontStyle: "italic",
                marginTop: 2,
              }}
            >
              {SIGNATURE_NAME}
            </div>
            <div style={{ fontSize: 9.5, marginTop: 1, color: MINIMAL.textSoft }}>
              {SIGNATURE_ROLE}
            </div>
          </div>
          <Pipe />
          <FooterCol
            top="Школа"
            value="Школа ПК"
            valueColor={MINIMAL.greenDeep}
            right
          />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Карта стилей + типы                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

export type CertStyle = "classic" | "modern" | "minimal";

export const STYLE_META: Record<
  CertStyle,
  { title: string; subtitle: string; accent: string }
> = {
  classic: {
    title: "Классический",
    subtitle: "Бордовый диплом с золотом",
    accent: "#5C2A2A",
  },
  modern: {
    title: "Современный",
    subtitle: "Премиум, тёмная тема",
    accent: "#C9A961",
  },
  minimal: {
    title: "Минималистичный",
    subtitle: "Светлый, чистый",
    accent: "#6DB89A",
  },
};

export function renderCertificate(
  style: CertStyle,
  data: CertData
): ReactNode {
  switch (style) {
    case "classic":
      return <ClassicCertificate data={data} />;
    case "modern":
      return <ModernCertificate data={data} />;
    case "minimal":
      return <MinimalCertificate data={data} />;
    default:
      return <ClassicCertificate data={data} />;
  }
}
