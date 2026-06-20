"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const [status, setStatus] = useState<"loading" | "success" | "test" | "error">("loading");
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const isTest = searchParams.get("test") === "1";

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    if (isTest) {
      // Test mode — simulate payment completion
      const token = localStorage.getItem("token");
      if (token) {
        // Auto-complete test payment
        fetch("/api/payment/complete-test", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId }),
        }).then(() => setStatus("test")).catch(() => setStatus("error"));
      } else {
        setStatus("test");
      }
      return;
    }

    // Real payment — check status
    // For now, just show success
    setStatus("success");
  }, [orderId, isTest]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 500, padding: "2rem" }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <h1 style={{ color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Проверяем оплату...</h1>
            <p style={{ color: "var(--color-text-muted)" }}>Пожалуйста, подождите</p>
          </>
        )}
        {(status === "success" || status === "test") && (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h1 style={{ color: "var(--color-green-400)", marginBottom: "0.5rem" }}>Оплата прошла успешно!</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
              {isTest ? "Тестовый режим: платёж симулирован. Вы автоматически записаны на курс." : "Вы успешно оплатили курс и записаны на обучение."}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none" }}>Перейти к обучению</Link>
              <Link href="/courses" className="btn-secondary" style={{ textDecoration: "none" }}>Все курсы</Link>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h1 style={{ color: "var(--color-orange-400)", marginBottom: "0.5rem" }}>Не удалось подтвердить оплату</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Если деньги списались — свяжитесь с нами, мы разберёмся.</p>
            <a href="/contacts" className="btn-primary" style={{ textDecoration: "none" }}>Связаться с нами</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-beige-300)" }}>Загрузка...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
