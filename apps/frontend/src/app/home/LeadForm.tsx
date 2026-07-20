"use client";
import { useState } from "react";

/**
 * LeadForm — клиентский компонент для формы заявки
 * Вынесен из HomePageClient для code splitting
 */
export function LeadForm() {
  const [form, setForm] = useState({ name: '', phone: '', message: '', consentAccepted: false });
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const submit = async () => {
    if (!form.name || !form.phone || !form.consentAccepted) return;
    setStatus({ type: 'loading' });
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          message: form.message,
          source: 'home_cta',
          consentAccepted: form.consentAccepted,
          consentAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.' });
        setForm({ name: '', phone: '', message: '', consentAccepted: false });
      } else {
        setStatus({ type: 'error', message: 'Ошибка отправки. Попробуйте позже или позвоните.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Ошибка сети. Позвоните: +7 (902) 472-07-38' });
    }
  };

  return (
    <div style={{ padding: "2rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 16 }}>
      <form style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input
          type="text"
          placeholder="Ваше имя *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          type="tel"
          placeholder="Телефон *"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={inputStyle}
          required
        />
        <textarea
          placeholder="Сообщение (необязательно)"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(214,198,178,0.9)", cursor: "pointer", lineHeight: 1.5 }}>
          <input
            type="checkbox"
            style={{ marginTop: "0.2rem", accentColor: "#E68863" }}
            checked={form.consentAccepted}
            onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })}
            required
          />
          <span>Я согласен на обработку персональных данных в соответствии с политикой конфиденциальности (152-ФЗ)</span>
        </label>
        <button
          type="submit"
          disabled={status.type === 'loading'}
          style={{
            padding: "1rem 1.5rem",
            background: status.type === 'loading' ? "rgba(214,198,178,0.2)" : "#E68863",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: status.type === 'loading' ? "wait" : "pointer",
            transition: "all 0.25s",
          }}
        >
          {status.type === 'loading' ? '⏳ Отправка...' : 'Отправить заявку'}
        </button>
        {status.type === 'success' && (
          <div style={{ padding: "0.75rem", background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", borderRadius: 8, color: "#27AE60", fontSize: "0.9rem" }}>
            ✓ {status.message}
          </div>
        )}
        {status.type === 'error' && (
          <div style={{ padding: "0.75rem", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 8, color: "#E74C3C", fontSize: "0.9rem" }}>
            ✗ {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "0.85rem 1rem",
  background: "rgba(214,198,178,0.05)",
  border: "1px solid rgba(214,198,178,0.15)",
  borderRadius: 10,
  color: "#E7DCCF",
  fontSize: "1.05rem",
  outline: "none",
} as const;
