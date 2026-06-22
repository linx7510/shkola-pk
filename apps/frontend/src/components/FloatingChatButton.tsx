"use client";
import { useState } from "react";

/**
 * FloatingChatButton — плавающая круглая кнопка чата с AI-консультантом.
 * Отображается в правом нижнем углу на ВСЕХ страницах сайта.
 * При клике раскрывается окно чата с AI.
 *
 * Встраивается в layout.tsx (глобально для всех страниц).
 */
export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string; text: string}[]>([
    {role: "bot", text: "Привет! 👋 Я AI-ассистент Школы Кооперативов. Помогу разобраться с потребительской кооперацией — просто и понятно. Спрашивай! 😊"},
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, {role: "user", text: msg}]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message: msg}),
      });
      const data = await res.json();
      const reply = data.reply || data.message || data.text ||
        "Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38.";
      setMessages(prev => [...prev, {role: "bot", text: reply}]);
    } catch {
      setMessages(prev => [...prev, {role: "bot", text: "Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38."}]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Кнопка чата */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Открыть чат с AI-консультантом"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #C96E4D, #E68863)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(201,110,77,0.4), 0 0 30px rgba(230,136,99,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "#0D0C0A",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Окно чата */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            zIndex: 9999,
            width: 340,
            maxHeight: 480,
            background: "#0D0C0A",
            border: "1px solid rgba(214,198,178,0.15)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(201,110,77,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid rgba(214,198,178,0.1)",
              background: "rgba(201,110,77,0.08)",
            }}
          >
            <div style={{fontWeight: 600, color: "#E7DCCF", fontSize: "0.9rem"}}>
              🤖 AI-консультант
            </div>
            <div style={{fontSize: "0.7rem", color: "rgba(214,198,178,0.97)"}}>
              Школа Потребительских Кооперативов
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: 12,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  background:
                    m.role === "user"
                      ? "rgba(201,110,77,0.15)"
                      : "rgba(214,198,178,0.06)",
                  color:
                    m.role === "user" ? "#E68863" : "rgba(214,198,178,0.97)",
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  fontSize: "0.8rem",
                  color: "rgba(214,198,178,0.78)",
                }}
              >
                Печатаю...
              </div>
            )}
          </div>

          {/* Quick buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              padding: "0.5rem 0.75rem",
              borderTop: "1px solid rgba(214,198,178,0.08)",
            }}
          >
            {["Как обнулить НДС? 💰", "Что такое ПК? 🤔", "Сколько стоит? 💬"].map(
              (q, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setInput(q.replace(/[💰🤔💬]/g, "").trim())
                  }
                  style={{
                    padding: "0.3rem 0.7rem",
                    background: "rgba(214,198,178,0.05)",
                    border: "1px solid rgba(214,198,178,0.12)",
                    borderRadius: 999,
                    color: "#BCA891",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(230,136,99,0.3)";
                    e.currentTarget.style.color = "#E68863";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(214,198,178,0.12)";
                    e.currentTarget.style.color = "#BCA891";
                  }}
                >
                  {q}
                </button>
              )
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid rgba(214,198,178,0.1)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Спросите о кооперации..."
              style={{
                flex: 1,
                padding: "0.6rem 0.9rem",
                borderRadius: 10,
                background: "rgba(214,198,178,0.05)",
                border: "1px solid rgba(214,198,178,0.1)",
                color: "#D6C6B2",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: 10,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "rgba(201,110,77,0.4)" : "#C96E4D",
                color: "#0D0C0A",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
