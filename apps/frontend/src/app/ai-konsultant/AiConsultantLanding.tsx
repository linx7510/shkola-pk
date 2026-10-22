"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * AiConsultantLanding — большой диалоговый AI-чат для лендинга /ai-konsultant.
 * Воронка: 2+ содержательных ответа ИИ → плашка мини-книги → подписка (double opt-in)
 * + регистрация в личном кабинете. API: тот же /api/ai (DeepSeek + база знаний Школы ПК).
 */

type Msg = { role: "bot" | "user"; text: string };

const STARTERS = [
  "Как ПК обнуляет исходящий НДС?",
  "Сколько стоит создать ПК и сколько нужно людей?",
  "Покажи кейс: завод экономит на кооперативе",
  "Чем ПК отличается от ООО по-крупному?",
  "Что такое паевой взнос и вернут ли его?",
  "Какие риски у кооператива и как их снять?",
];

const WELCOME: Msg = {
  role: "bot",
  text: "Здравствуйте! Я AI-консультант Школы потребительской кооперации 🤝 Меня воспитали на сотне уставов, двух сотнях кейсов, судебной практике и Законе № 3085-1. Спрашивайте о кооперативах что угодно — от налогов до рисков. Отвечу с цифрами и статьями закона.",
};

export default function AiConsultantLanding() {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Лимит: 15 вопросов в день на пользователя (localStorage)
  const LIMIT = 15;
  const today = () => new Date().toISOString().slice(0, 10);
  const readLimit = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("ai_chat_limit") || "{}");
      if (raw.date === today()) return Number(raw.used) || 0;
    } catch {}
    return 0;
  };
  const [used, setUsed] = useState(0);
  useEffect(() => setUsed(readLimit()), []);
  const limitReached = used >= LIMIT;
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(
    async (raw?: string) => {
      const msg = (raw ?? input).trim();
      if (!msg || loading || limitReached) return;
      setInput("");
      const history = messages.slice(1).map((m) => ({ role: m.role === "user" ? "user" : "bot", text: m.text }));
      setMessages((prev) => [...prev, { role: "user", text: msg }]);
      setLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, history }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply =
            data.response ||
            data.reply ||
            data.text ||
            "Спасибо за вопрос! Уточните его, пожалуйста, — или оставьте заявку через форму на сайте.";
          setMessages((prev) => [...prev, { role: "bot", text: reply }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "bot", text: "Кажется, я задумался слишком глубоко — соединение потерялось. Повторите вопрос, пожалуйста." },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Сеть подвела. Попробуйте ещё раз — или задайте вопрос по телефону +7 (902) 472-07-38." },
        ]);
      } finally {
        setLoading(false);
        const next = Math.min(readLimit() + 1, LIMIT);
        try {
          localStorage.setItem("ai_chat_limit", JSON.stringify({ date: today(), used: next }));
        } catch {}
        setUsed(next);
        inputRef.current?.focus();
      }
    },
    [input, loading, messages, limitReached]
  );

  const bubble = (m: Msg, i: number) => (
    <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.9rem", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
      {m.role === "bot" && (
        <div
          aria-hidden
          style={{
            flex: "0 0 34px",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#C06030,#E68863)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
          }}
        >
          🤝
        </div>
      )}
      <div
        style={{
          maxWidth: "75%",
          padding: "0.7rem 0.95rem",
          borderRadius: 14,
          fontSize: "0.95rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          background: m.role === "user" ? "linear-gradient(135deg,#C06030,#A85028)" : "rgba(214,198,178,0.07)",
          color: m.role === "user" ? "#fff" : "rgba(231,220,207,0.95)",
          border: m.role === "user" ? "none" : "1px solid rgba(214,198,178,0.1)",
          borderBottomRightRadius: m.role === "user" ? 4 : 14,
          borderBottomLeftRadius: m.role === "bot" ? 4 : 14,
        }}
      >
        {m.text}
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: 1160,
        margin: "0 auto",
        background: "rgba(214,198,178,0.04)",
        border: "1px solid rgba(214,198,178,0.14)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
      }}
    >
      {/* Шапка чата */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          padding: "0.9rem 1.2rem",
          borderBottom: "1px solid rgba(214,198,178,0.1)",
          background: "rgba(214,198,178,0.03)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#C06030,#E68863)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 21,
          }}
          aria-hidden
        >
          🤝
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "#E7DCCF", fontSize: "1.02rem" }}>AI-консультант Школы кооперации</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.65)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} aria-hidden />
            онлайн · отвечает сразу
          </div>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(214,198,178,0.5)", textAlign: "right", lineHeight: 1.5 }}>
          воспитан на 100+ уставах
          <br />и 200+ кейсах по ПК
        </div>
      </div>

      {/* Лента сообщений */}
      <div
        ref={feedRef}
        role="log"
        aria-label="Диалог с AI-консультантом"
        style={{ height: "min(62vh, 640px)", overflowY: "auto", padding: "1.1rem 1.2rem", scrollBehavior: "smooth" }}
      >
        {messages.map(bubble)}
        {loading && (
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.9rem" }}>
            <div
              aria-hidden
              style={{
                flex: "0 0 34px", width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#C06030,#E68863)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              }}
            >
              🤝
            </div>
            <div style={{ padding: "0.7rem 0.95rem", borderRadius: 14, background: "rgba(214,198,178,0.07)", fontSize: "0.9rem", color: "rgba(214,198,178,0.7)" }}>
              консультируюсь в базе знаний…
            </div>
          </div>
        )}

      </div>

      {/* Чипсы-стартеры */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", padding: "0.6rem 1.2rem 0" }}>
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={loading || limitReached}
            style={{
              padding: "0.42rem 0.8rem",
              borderRadius: 999,
              border: "1px solid rgba(230,136,99,0.4)",
              background: "rgba(230,136,99,0.08)",
              color: "#E68863",
              fontSize: "0.8rem",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Предупреждение о лимите */}
      <div
        role="note"
        style={{
          padding: "0.55rem 1.2rem 0",
          fontSize: "0.78rem",
          color: limitReached ? "#E57373" : "rgba(214,198,178,0.55)",
          textAlign: "center",
        }}
      >
        {limitReached
          ? "Лимит на сегодня исчерпан: 15 из 15 вопросов. Приходите завтра — ответим на другие ваши вопросы по кооперации!"
          : `Бесплатный лимит — ${LIMIT} вопросов в день. Использовано: ${used} из ${LIMIT}.`}
      </div>

      {/* Ввод */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: "0.6rem", padding: "0.7rem 1.2rem 1.1rem" }}
      >
        <label htmlFor="ai-chat-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Ваш вопрос AI-консультанту
        </label>
        <input
          id="ai-chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спросите: как кооператив экономит на налогах?.."
          maxLength={500}
          disabled={limitReached}
          style={{
            flex: 1,
            padding: "0.8rem 1rem",
            borderRadius: 12,
            border: "1px solid rgba(214,198,178,0.22)",
            background: "rgba(13,12,10,0.6)",
            color: "#E7DCCF",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || limitReached}
          style={{
            padding: "0.8rem 1.5rem",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#C06030,#E68863)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: loading || !input.trim() ? "wait" : "pointer",
          }}
        >
          Спросить
        </button>
      </form>
    </div>
  );
}
