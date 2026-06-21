"use client"
import { useState } from "react"
import Reveal from "@/components/Reveal"

/**
 * AIConsultant — переиспользуемый блок AI-консультанта.
 * Точная копия блока с главной страницы (HomePageClient.tsx, секция #ai-consultant).
 * Включает: аватар, статус «Онлайн», ленту сообщений, быстрые кнопки, поле ввода.
 *
 * Используется на:
 *   - /  (главная)
 *   - /besplatno
 *   - /potrebitelskiy-kooperativ-konsultatsii
 *   - любых других страницах, где нужен живой AI-чат
 */
export default function AIConsultant() {
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "bot",
      text:
        "Привет! 👋 Я AI-ассистент Школы Кооперативов. Помогу разобраться с потребительской кооперацией — просто и понятно. Спрашивай! 😊",
    },
  ])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const sendAi = async () => {
    if (!aiInput.trim() || aiLoading) return
    const msg = aiInput.trim()
    setAiInput("")
    setAiMessages((prev) => [...prev, { role: "user", text: msg }])
    setAiLoading(true)
    try {
      // Используем тот же /api/ai endpoint что и на главной
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      })
      if (res.ok) {
        const data = await res.json()
        const reply =
          data.reply ||
          data.message ||
          data.text ||
          "Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38."
        setAiMessages((prev) => [...prev, { role: "bot", text: reply }])
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38.",
          },
        ])
      }
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38.",
        },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  const S: React.CSSProperties = { padding: "4rem 0" }
  const I: React.CSSProperties = {
    maxWidth: "var(--container-max,1600px)",
    margin: "0 auto",
    padding: "0 var(--container-px,clamp(1rem,4vw,4rem))",
  }

  return (
    <section id="ai-consultant" style={{ ...S, background: "rgba(214,198,178,0.02)" }}>
      <div style={I}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="section-label">AI-АССИСТЕНТ</div>
            <h2
              className="section-title heading-sweep"
              data-text="🤖 Задайте вопрос AI-ассистенту"
            >
              🤖 Задайте вопрос AI-ассистенту
            </h2>
            <p className="section-subtitle">
              Наш AI-помощник специально натренирован на потребительскую кооперацию и законодательство РФ
            </p>
          </div>
        </Reveal>
        <Reveal delay={2}>
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              padding: "1.5rem",
              background: "rgba(214,198,178,0.04)",
              border: "1px solid rgba(214,198,178,0.12)",
              borderRadius: 16,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 0",
                borderBottom: "1px solid rgba(214,198,178,0.08)",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C96E4D, #E68863)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#E7DCCF", fontSize: "0.92rem" }}>
                  Ассистент Школы Кооперативов
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6DB89A",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#6DB89A",
                      display: "inline-block",
                    }}
                  />
                  Онлайн
                </div>
              </div>
            </div>
            {/* Messages */}
            <div
              style={{
                maxHeight: 320,
                overflowY: "auto",
                marginBottom: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {aiMessages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "0.6rem 0.9rem",
                    borderRadius: 12,
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                    background: m.role === "user" ? "rgba(201,110,77,0.15)" : "rgba(214,198,178,0.06)",
                    color: m.role === "user" ? "#E68863" : "rgba(214,198,178,0.97)",
                  }}
                >
                  {m.text}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: "flex-start", fontSize: "0.85rem", color: "rgba(214,198,178,0.78)" }}>
                  Печатаю...
                </div>
              )}
            </div>
            {/* Quick buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {[
                "Как обнулить НДС? 💰",
                "Что такое ПК? 🤔",
                "Сколько стоит? 💬",
                "Как зарегистрировать ПК? 📝",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setAiInput(q.replace(/[💰🤔💬📝]/g, "").trim())}
                  style={{
                    padding: "0.4rem 0.85rem",
                    background: "rgba(214,198,178,0.05)",
                    border: "1px solid rgba(214,198,178,0.12)",
                    borderRadius: 999,
                    color: "#BCA891",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(230,136,99,0.3)"
                    e.currentTarget.style.color = "#E68863"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(214,198,178,0.12)"
                    e.currentTarget.style.color = "#BCA891"
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendAi()
              }}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Спросите о кооперации..."
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  background: "rgba(214,198,178,0.05)",
                  border: "1px solid rgba(214,198,178,0.12)",
                  borderRadius: 10,
                  color: "#D6C6B2",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={aiLoading}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: "#C96E4D",
                  color: "#0D0C0A",
                  border: "none",
                  borderRadius: 10,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: aiLoading ? "not-allowed" : "pointer",
                }}
              >
                →
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
