import Link from "next/link";
import type { Metadata } from "next";
import PrintButton from "@/components/PrintButton";
import {
  CertData,
  CertStyle,
  STYLE_META,
  renderCertificate,
} from "./templates";

export const dynamic = "force-dynamic";

/* ── Helpers ───────────────────────────────────────────────────────────── */

const RU_MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function defaultRuDate(d = new Date()): string {
  return `${d.getDate()} ${RU_MONTHS_GEN[d.getMonth()]} ${d.getFullYear()} г.`;
}

function genCertNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000); // 4 цифры
  return `ШПК-${year}-${rand}`;
}

const VALID_STYLES: CertStyle[] = ["classic", "modern", "minimal"];

function coerceStyle(value: string | undefined): CertStyle {
  return VALID_STYLES.includes(value as CertStyle)
    ? (value as CertStyle)
    : "classic";
}

function buildQuery(data: CertData, style?: CertStyle): string {
  const params = new URLSearchParams({
    name: data.name,
    course: data.course,
    date: data.date,
    number: data.number,
  });
  if (style) params.set("style", style);
  return params.toString();
}

/* ── Metadata ──────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  const s = coerceStyle(style);
  return {
    title: `Сертификат · ${STYLE_META[s].title}`,
    description: `${STYLE_META[s].subtitle} — сертификат о прохождении онлайн-курса Школы ПК.`,
    robots: { index: false, follow: false },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ style: string }>;
  searchParams: Promise<{
    name?: string;
    course?: string;
    date?: string;
    number?: string;
  }>;
}) {
  const { style: rawStyle } = await params;
  const sp = await searchParams;

  const style = coerceStyle(rawStyle);

  const data: CertData = {
    name: (sp.name ?? "").trim() || "Выпускник Школы ПК",
    course: (sp.course ?? "").trim() || "Спецпредложение Старт",
    date: (sp.date ?? "").trim() || defaultRuDate(),
    number: (sp.number ?? "").trim() || genCertNumber(),
  };

  const qs = buildQuery(data);

  return (
    <>
      <StyleInjection />
      <div className="cert-stage">
        {/* Тулбар (не печатается) */}
        <div className="cert-toolbar cert-no-print">
          <PrintButton />
          <div className="cert-links">
            {VALID_STYLES.map((s) => (
              <Link
                key={s}
                href={`/certificate/${s}?${qs}`}
                prefetch={false}
                className={s === style ? "active" : ""}
              >
                {STYLE_META[s].title}
              </Link>
            ))}
            <Link
              href={`/certificate?${qs}`}
              prefetch={false}
              className="cert-back"
            >
              ← Все стили
            </Link>
          </div>
        </div>

        {/* Сам сертификат (A4 landscape) */}
        <div id="certificate" className="cert-card-wrap">
          {renderCertificate(style, data)}
        </div>

        <p className="cert-hint cert-no-print">
          Нажмите «Скачать PDF» и в диалоге печати выберите{" "}
          <b>«Сохранить как PDF»</b>. Ориентация — альбомная, поля — «Нет».
        </p>
      </div>
    </>
  );
}

/* ── Scoped CSS (print + screen) ───────────────────────────────────────── */

function StyleInjection() {
  const css = `
@page { size: A4 landscape; margin: 0; }

.cert-stage {
  min-height: 100vh;
  background: #e8e8ee;
  padding: 28px 16px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif;
  color: #1a1a24;
  box-sizing: border-box;
}
.cert-stage * { box-sizing: border-box; }

.cert-toolbar {
  width: 297mm;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.cert-links { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.cert-links a {
  font-size: 13px;
  color: #1a1a24;
  text-decoration: none;
  padding: 8px 13px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.14);
  background: #fff;
  transition: background .15s, color .15s;
}
.cert-links a:hover { background: #f1f1f4; }
.cert-links a.active { border-color: #111; background: #111; color: #fff; }
.cert-links a.cert-back { border-style: dashed; }

.cert-card-wrap {
  width: 297mm;
  height: 210mm;
  max-width: 100%;
  background: #fff;
  box-shadow: 0 22px 60px rgba(0,0,0,0.28);
  overflow: hidden;
}

.cert-hint {
  width: 297mm;
  max-width: 100%;
  margin-top: 16px;
  font-size: 12.5px;
  color: #5b5b66;
  text-align: center;
}

/* На узких экранах — подгоняем по ширине с сохранением пропорций */
@media (max-width: 1180px) {
  .cert-toolbar, .cert-card-wrap, .cert-hint { width: 100%; }
  .cert-card-wrap { height: auto; aspect-ratio: 297 / 210; }
}

@media print {
  /* Скрываем вообще всё (включая глобальный чат-виджет и тулбар),
     затем показываем только сам сертификат */
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  body * { visibility: hidden !important; }
  #certificate, #certificate * { visibility: visible !important; }
  #certificate {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 297mm !important;
    height: 210mm !important;
    box-shadow: none !important;
  }
  .cert-no-print { display: none !important; }
  .cert-stage { background: #fff !important; padding: 0 !important; min-height: 0 !important; }
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
