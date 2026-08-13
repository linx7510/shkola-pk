"use client";

import { useState, useEffect, type CSSProperties } from "react";

/**
 * DonateForm — публичная форма пожертвований (страница «Помощь проекту»).
 * Авторизация НЕ требуется: донат открыт для всех. Если пользователь залогинен,
 * email подставляется из JWT (localStorage.auth_token).
 *
 * Flow:
 *   1. Пользователь выбирает сумму (preset / своя) + email (+ имя по желанию).
 *   2. POST /api/payment/create { type:'donation', amount, email, description }.
 *   3. При успехе → window.location.href = confirmationUrl (редирект на YooKassa).
 */
const PRESETS = [500, 1000, 3000, 5000] as const;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 1_000_000;

const COLORS = {
  bg: "#0D0C0A",
  text: "#D6C6B2",
  textBright: "#E7DCCF",
  green: "#6DB89A",
  amber: "#E68863",
} as const;

/** Безопасно декодирует payload JWT из localStorage, чтобы подставить email. */
function readEmailFromToken(): string | null {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(decodeURIComponent(escape(atob(padded))));
    return typeof json.email === "string" ? json.email : null;
  } catch {
    return null;
  }
}

export default function DonateForm() {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = readEmailFromToken();
    if (e) setEmail(e);
  }, []);

  const effectiveAmount = useCustom
    ? parseInt(customAmount.replace(/\D/g, ""), 10) || 0
    : amount;

  const isValidAmount =
    Number.isFinite(effectiveAmount) &&
    effectiveAmount >= MIN_AMOUNT &&
    effectiveAmount <= MAX_AMOUNT;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isValidAmount && isValidEmail && !loading;

  const handlePreset = (value: number) => {
    setAmount(value);
    setUseCustom(false);
    setCustomAmount("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!isValidAmount) setError(`Минимальная сумма пожертвования — ${MIN_AMOUNT} ₽`);
      else if (!isValidEmail) setError("Укажите корректный email — на него придёт чек");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token) headers["Authorization"] = `JWT ${token}`;

      const description = name.trim()
        ? `Пожертвование от ${name.trim()} — ${effectiveAmount} ₽`
        : `Пожертвование — ${effectiveAmount} ₽`;

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "donation", amount: effectiveAmount, email: email.trim(), description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Не удалось создать платёж. Попробуйте позже.");
        setLoading(false);
        return;
      }
      const redirectUrl = data.confirmationUrl || data.paymentUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setError("Платёж создан, но ссылка оплаты не получена.");
        setLoading(false);
      }
    } catch {
      setError("Ошибка соединения с сервером. Проверьте интернет и попробуйте снова.");
      setLoading(false);
    }
  };

  const formatAmount = (n: number) => n.toLocaleString("ru-RU");

  const presetBtn = (active: boolean): CSSProperties => ({
    flex: "1 1 calc(50% - 0.5rem)",
    minWidth: 120,
    padding: "0.85rem 0.5rem",
    background: active ? COLORS.green : "rgba(214,198,178,0.06)",
    color: active ? "#0D0C0A" : COLORS.text,
    border: `1px solid ${active ? COLORS.green : "rgba(214,198,178,0.18)"}`,
    borderRadius: 10,
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "0.75rem 0.9rem",
    background: "#16140f",
    border: "1px solid rgba(214,198,178,0.18)",
    borderRadius: 10,
    color: COLORS.textBright,
    fontSize: "0.95rem",
    outline: "none",
  };

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "1.75rem",
        background: "rgba(214,198,178,0.04)",
        border: `1px solid ${COLORS.amber}40`,
        borderRadius: 16,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>💳</div>
        <h2
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
            fontWeight: 800,
            color: COLORS.textBright,
            marginBottom: "0.4rem",
          }}
        >
          Поддержать проект
        </h2>
        <p style={{ fontSize: "0.9rem", color: "rgba(214,198,178,0.7)", lineHeight: 1.5 }}>
          Любой взнос помогает развивать Школу потребительской кооперации —
          бесплатные материалы, новые курсы и помощь кооперативам по всей России.
        </p>
      </div>

      <label
        style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.7)", marginBottom: "0.5rem", fontWeight: 600 }}
      >
        Сумма пожертвования
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePreset(p)}
            style={presetBtn(!useCustom && amount === p)}
          >
            {formatAmount(p)} ₽
          </button>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Своя сумма"
          value={customAmount}
          onFocus={() => setUseCustom(true)}
          onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ""))}
          style={{ ...inputStyle, paddingRight: "2.5rem" }}
        />
        <span
          style={{
            position: "absolute",
            right: "0.9rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(214,198,178,0.5)",
            fontSize: "1rem",
            pointerEvents: "none",
          }}
        >
          ₽
        </span>
      </div>

      <label
        style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.7)", marginBottom: "0.4rem", fontWeight: 600 }}
      >
        Email <span style={{ color: COLORS.amber }}>*</span>{" "}
        <span style={{ fontWeight: 400, color: "rgba(214,198,178,0.5)" }}>— для отправки чека</span>
      </label>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ ...inputStyle, marginBottom: "1rem" }}
      />

      <label
        style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.7)", marginBottom: "0.4rem", fontWeight: 600 }}
      >
        Ваше имя{" "}
        <span style={{ fontWeight: 400, color: "rgba(214,198,178,0.5)" }}>— по желанию</span>
      </label>
      <input
        type="text"
        placeholder="Как к вам обращаться"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ ...inputStyle, marginBottom: "1.25rem" }}
      />

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.6rem 0.85rem",
            background: "rgba(201,110,77,0.1)",
            border: "1px solid rgba(201,110,77,0.3)",
            borderRadius: 8,
            color: "#C96E4D",
            fontSize: "0.85rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: "100%",
          padding: "0.95rem",
          background: canSubmit
            ? `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.amber}cc)`
            : "rgba(214,198,178,0.1)",
          color: canSubmit ? "#fff" : "rgba(214,198,178,0.4)",
          border: "none",
          borderRadius: 12,
          fontSize: "1.05rem",
          fontWeight: 700,
          cursor: canSubmit ? "pointer" : "not-allowed",
          transition: "all 0.15s ease",
        }}
      >
        {loading
          ? "Обработка..."
          : isValidAmount
          ? `Пожертвовать ${formatAmount(effectiveAmount)} ₽`
          : "Пожертвовать"}
      </button>

      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.75rem",
          color: "rgba(214,198,178,0.45)",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        Оплата через ЮKassa · минимальная сумма {MIN_AMOUNT} ₽ · электронный чек
        придёт на указанный email согласно 54-ФЗ.
      </p>
    </div>
  );
}
