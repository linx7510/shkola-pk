"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type Status = "loading" | "success" | "test" | "pending" | "error";

function PaymentSuccessContent() {
  const [status, setStatus] = useState<Status>("loading");
  const [detail, setDetail] = useState<string>("");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const isTest = searchParams.get("test") === "1";
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!orderId) {
      setStatus("error");
      return;
    }

    // Тестовый режим — симуляция (без вызова YooKassa API).
    if (isTest) {
      fetch("/api/payment/complete-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // auth_token cookie sent automatically
        body: JSON.stringify({ orderId }),
      })
        .then(() => setStatus("test"))
        .catch(() => setStatus("test"));
      return;
    }

    // Боевой платёж — проверяем статус через /api/payment/verify.
    // YooKassa может финализировать платёж с задержкой после редиректа,
    // поэтому делаем несколько попыток с интервалом.
    let cancelled = false;
    const maxAttempts = 5;

    const attempt = async (n: number) => {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/payment/verify?orderId=${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        if (!res.ok && res.status !== 404) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();

        if (cancelled) return;

        if (data.paid && data.status === "paid") {
          setStatus("success");
          return;
        }
        // Ещё не оплачен — повторим, пока есть попытки.
        if (n < maxAttempts) {
          setStatus("pending");
          setTimeout(() => attempt(n + 1), 2500);
        } else {
          // Последняя попытка: если YooKassa вернул succeeded — всё ок,
          // иначе покажем мягкую ошибку (деньги могут списаться позже).
          setStatus(data.status === "succeeded" ? "success" : "error");
        }
      } catch {
        if (cancelled) return;
        if (n < maxAttempts) {
          setTimeout(() => attempt(n + 1), 2500);
        } else {
          setStatus("error");
        }
      }
    };

    attempt(1);
    return () => {
      cancelled = true;
    };
  }, [orderId, isTest]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 500, padding: "2rem" }}>
        {(status === "loading" || status === "pending") && (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <h1 style={{ color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Проверяем оплату...</h1>
            <p style={{ color: "var(--color-text-muted)" }}>
              {status === "pending" ? "Платёж ещё обрабатывается. Пожалуйста, подождите." : "Пожалуйста, подождите"}
            </p>
            {detail && <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{detail}</p>}
          </>
        )}
        {(status === "success" || status === "test") && (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h1 style={{ color: "var(--color-green-400)", marginBottom: "0.5rem" }}>Оплата прошла успешно!</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
              {isTest ? "Тестовый режим: платёж симулирован. Вы автоматически записаны на курс." : "Оплата подтверждена. Статус заказа обновлён."}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/dashboard" prefetch={false} className="btn-primary" style={{ textDecoration: "none" }}>Перейти к услугам</Link>
              <Link href="/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" prefetch={false} className="btn-secondary" style={{ textDecoration: "none" }}>Все курсы</Link>
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
