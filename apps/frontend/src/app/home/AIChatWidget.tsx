"use client";
import { useState } from "react";

/**
 * AI Chat Widget — плавающий чат внизу справа.
 * Lazy-loaded — не блокирует первый рендер главной страницы.
 * Не рендерится на SSR (ssr: false).
 */
export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role:string;text:string}[]>([
    {role:"bot", text:"Привет! Я AI-консультант Школы Кооперативов. Задайте вопрос о потребительской кооперации 💬"}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, {role:"user", text:msg}]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:msg}),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {role:"bot", text:data.response || "Попробуйте ещё раз"}]);
    } catch {
      setMessages(prev => [...prev, {role:"bot", text:"Спасибо за ваш вопрос! Наш консультант свяжется с вами в ближайшее время. Также вы можете задать вопрос через форму ниже или по телефону +7 (902) 472-07-38."}]);
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
            maxWidth: "calc(100vw - 3rem)",
            maxHeight: "70vh",
            background: "#0D0C0A",
            border: "1px solid rgba(230,136,99,0.4)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{padding:"1rem 1.25rem", background:"rgba(230,136,99,0.08)", borderBottom:"1px solid rgba(230,136,99,0.2)"}}>
            <div style={{color:"#E68863", fontWeight:600, fontSize:"1rem"}}>AI-консультант</div>
            <div style={{color:"rgba(214,198,178,0.7)", fontSize:"0.8rem", marginTop:"0.2rem"}}>Школа Кооперативов • Онлайн</div>
          </div>
          <div style={{flex:1, overflowY:"auto", padding:"1rem 1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem"}}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "rgba(230,136,99,0.15)" : "rgba(214,198,178,0.05)",
                border: m.role === "user" ? "1px solid rgba(230,136,99,0.3)" : "1px solid rgba(214,198,178,0.1)",
                padding: "0.6rem 0.9rem",
                borderRadius: 12,
                maxWidth: "85%",
                color: "#E7DCCF",
                fontSize: "0.9rem",
                lineHeight: 1.4,
              }}>{m.text}</div>
            ))}
            {loading && (
              <div style={{alignSelf:"flex-start", color:"rgba(214,198,178,0.5)", fontSize:"0.85rem", padding:"0.4rem 0.9rem"}}>Печатаю…</div>
            )}
          </div>
          <div style={{padding:"0.75rem 1rem", borderTop:"1px solid rgba(214,198,178,0.1)", display:"flex", gap:"0.5rem"}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Ваш вопрос…"
              style={{
                flex:1, background:"rgba(214,198,178,0.05)", border:"1px solid rgba(214,198,178,0.15)",
                borderRadius:10, padding:"0.6rem 0.9rem", color:"#E7DCCF", fontSize:"0.9rem", outline:"none"
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background:"linear-gradient(135deg, #C96E4D, #E68863)", border:"none", borderRadius:10,
                padding:"0.6rem 1rem", color:"#0D0C0A", fontWeight:600, cursor:"pointer", fontSize:"0.85rem"
              }}
            >→</button>
          </div>
        </div>
      )}
    </>
  );
}
