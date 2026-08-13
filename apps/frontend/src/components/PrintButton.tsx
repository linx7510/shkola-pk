"use client";

/**
 * PrintButton — компактная клиентская кнопка «Скачать PDF».
 * Вызывает window.print(); пользователь сохраняет результат как PDF
 * (Chrome/Edge/Firefox: «Сохранить как PDF» в диалоге печати).
 *
 * Скрыт в @media print через класс .cert-no-print.
 */
interface PrintButtonProps {
  label?: string;
}

export default function PrintButton({ label = "🖨 Скачать PDF" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      style={{
        appearance: "none",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.18)",
        background: "linear-gradient(180deg,#1c1c1c,#0d0d0d)",
        color: "#fff",
        padding: "11px 22px",
        borderRadius: 9,
        fontSize: 14.5,
        fontWeight: 600,
        letterSpacing: 0.2,
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,'Helvetica Neue',Arial,sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 22px rgba(0,0,0,0.22)",
      }}
    >
      {label}
    </button>
  );
}
