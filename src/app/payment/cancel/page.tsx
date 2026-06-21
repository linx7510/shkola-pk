"use client";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 500, padding: "2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
        <h1 style={{ color: "var(--color-orange-400)", marginBottom: "0.5rem" }}>Оплата отменена</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Платёж не был завершён. Вы можете попробовать ещё раз или связаться с нами для получения помощи.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" className="btn-primary" style={{ textDecoration: "none" }}>Вернуться к курсам</Link>
          <a href="/#contacts" className="btn-secondary" style={{ textDecoration: "none" }}>Связаться с нами</a>
        </div>
      </div>
    </div>
  );
}

