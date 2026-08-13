import Link from "next/link";
import type { Metadata } from "next";
import { CertStyle, STYLE_META } from "./[style]/templates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сертификат — выбор стиля",
  description:
    "Три варианта сертификата о прохождении онлайн-курса Школы ПК: классический, современный и минималистичный.",
  robots: { index: false, follow: false },
};

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,'Helvetica Neue',Arial,sans-serif";

const ORDER: CertStyle[] = ["classic", "modern", "minimal"];

export default async function CertificateSelectorPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    course?: string;
    date?: string;
    number?: string;
    style?: string;
  }>;
}) {
  const sp = await searchParams;

  const name = (sp.name ?? "").trim();
  const course = (sp.course ?? "").trim() || "Спецпредложение Старт";

  // Базовые параметры для предзаполнения ссылок
  const baseParams = new URLSearchParams();
  if (name) baseParams.set("name", name);
  if (sp.course) baseParams.set("course", sp.course);
  if (sp.date) baseParams.set("date", sp.date);
  if (sp.number) baseParams.set("number", sp.number);
  const baseQs = baseParams.toString();

  const previewName = name || "Имя Выпускника";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D0C0A",
        color: "#E7DCCF",
        fontFamily: SANS,
        padding: "64px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 6,
              color: "#C9A961",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            ▌ Школа ПК
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              margin: "0 0 12px",
              letterSpacing: -0.5,
            }}
          >
            Сертификат о прохождении курса
          </h1>
          <p style={{ fontSize: 16, color: "#8a8074", maxWidth: 620, margin: "0 auto" }}>
            Выберите один из трёх стилей оформления. Все варианты — A4 (альбомная),
            готовы к печати в PDF через диалог браузера.
          </p>
        </div>

        {/* Форма предзаполнения (GET — просто перезагружает страницу с параметрами) */}
        <form
          method="get"
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 40,
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <InputField name="name" placeholder="Имя выпускника" defaultValue={name} />
          <InputField
            name="course"
            placeholder="Название курса"
            defaultValue={sp.course}
          />
          <InputField name="date" placeholder="Дата" defaultValue={sp.date} />
          <InputField
            name="number"
            placeholder="№ сертификата"
            defaultValue={sp.number}
          />
          <button
            type="submit"
            style={{
              cursor: "pointer",
              border: "1px solid #C9A961",
              background: "#C9A961",
              color: "#0D0C0A",
              fontWeight: 700,
              padding: "11px 20px",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            Применить
          </button>
        </form>

        {/* Карточки стилей */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          {ORDER.map((style) => {
            const meta = STYLE_META[style];
            const href = `/certificate/${style}?${baseQs}`;
            return (
              <Link
                key={style}
                href={href}
                prefetch={false}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  className="cert-card"
                  style={{
                    background: "#15130F",
                    border: "1px solid #2a2620",
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "transform .15s, border-color .15s",
                  }}
                >
                  {/* Мини-превью (имитация сертификата) */}
                  <MiniPreview style={style} name={previewName} course={course} />

                  <div style={{ padding: "20px 22px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: meta.accent,
                          display: "inline-block",
                        }}
                      />
                      <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>
                        {meta.title}
                      </h2>
                    </div>
                    <p style={{ color: "#8a8074", fontSize: 14, margin: "0 0 14px" }}>
                      {meta.subtitle}
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#C9A961",
                      }}
                    >
                      Открыть сертификат →
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#5a5048",
            fontSize: 13,
            marginTop: 40,
          }}
        >
          На странице сертификата нажмите «🖨 Скачать PDF» и выберите
          «Сохранить как PDF». {name ? <>Текущее имя: <b style={{ color: "#C9A961" }}>{name}</b>.</> : null}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cert-card:hover { transform: translateY(-3px); border-color: #C9A961 !important; }
        .cert-card { display: block; }
      `}} />
    </main>
  );
}

function InputField({
  name,
  placeholder,
  defaultValue,
}: {
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{
        background: "#15130F",
        border: "1px solid #2a2620",
        color: "#E7DCCF",
        borderRadius: 8,
        padding: "11px 14px",
        fontSize: 14,
        minWidth: 150,
        fontFamily: "inherit",
      }}
    />
  );
}

/* Мини-превью каждого стиля — стилизованная плашка 16:10 */
function MiniPreview({
  style,
  name,
  course,
}: {
  style: CertStyle;
  name: string;
  course: string;
}) {
  if (style === "classic") {
    return (
      <div
        style={{
          aspectRatio: "297 / 180",
          background: "#5C2A2A",
          padding: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            background: "#FAF6EE",
            border: "2px double #C9A961",
            outline: "1px solid #5C2A2A",
            outlineOffset: -5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#2A1A1A",
            fontFamily: "Georgia, serif",
            padding: 8,
          }}
        >
          <div style={{ fontSize: 8, letterSpacing: 2, color: "#A88845", fontWeight: 700 }}>
            ❦ ШКОЛА ПК · с 2015 ❦
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#5C2A2A", letterSpacing: 3, marginTop: 4 }}>
            СЕРТИФИКАТ
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3F1B1B", marginTop: 3 }}>
            {name}
          </div>
          <div style={{ fontSize: 7.5, color: "#5a4646", marginTop: 2 }}>
            курс «{course}»
          </div>
        </div>
      </div>
    );
  }

  if (style === "modern") {
    return (
      <div
        style={{
          aspectRatio: "297 / 180",
          background: "#0D0C0A",
          color: "#E7DCCF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 12,
          fontFamily: SANS,
          position: "relative",
        }}
      >
        <div style={{ fontSize: 8, letterSpacing: 5, color: "#C9A961", textTransform: "uppercase" }}>
          ▌ Школа ПК
        </div>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#C9A961", marginTop: 8 }}>
          СЕРТИФИКАТ
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{name}</div>
        <div style={{ width: 60, height: 1, background: "#8a8074", margin: "5px 0" }} />
        <div style={{ fontSize: 7.5, color: "#8a8074" }}>«{course}» · 100%</div>
      </div>
    );
  }

  // minimal
  return (
    <div
      style={{
        aspectRatio: "297 / 180",
        background: "#FFFFFF",
        color: "#1A1A24",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 12,
        fontFamily: SANS,
      }}
    >
      <div style={{ fontSize: 7.5, letterSpacing: 3, fontWeight: 700 }}>
        ШКОЛА ПОТРЕБИТЕЛЬСКИХ КООПЕРАЦИЙ
      </div>
      <div style={{ width: "70%", height: 1, background: "#E0E0E0", margin: "6px 0" }} />
      <div style={{ fontSize: 9, color: "#4a9d80", fontWeight: 700, letterSpacing: 2 }}>
        ✓ СЕРТИФИКАТ
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{name}</div>
      <div style={{ fontSize: 7.5, color: "#5b5b66", marginTop: 2 }}>«{course}»</div>
      <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
        {Array.from({ length: 13 }).map((_, i) => (
          <span
            key={i}
            style={{ width: 8, height: 5, borderRadius: 1, background: "#6DB89A", display: "inline-block" }}
          />
        ))}
      </div>
    </div>
  );
}
