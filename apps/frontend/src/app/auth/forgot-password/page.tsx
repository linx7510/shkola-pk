"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Ошибка. Попробуйте позже.");
      else setSent(true);
    } catch {
      setError("Ошибка соединения. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", background: "#0D0C0A" }}>
        <div style={{ width: "100%", maxWidth: 460, background: "#14110d", border: "1px solid #2a2520", borderRadius: 16, padding: "2.5rem" }}>
          <h1 style={{ color: "#F5E6D3", textAlign: "center", marginTop: 0 }}>Восстановление пароля</h1>
          {sent ? (
            <p style={{ color: "#D6C6B2", lineHeight: 1.7, textAlign: "center" }}>
              Если такой аккаунт существует, письмо со ссылкой для установки нового пароля уже отправлено. Проверьте почту (ссылка действует 1 час).
            </p>
          ) : (
            <form onSubmit={submit}>
              <p style={{ color: "#D6C6B2" }}>Укажите email — пришлём ссылку для установки нового пароля.</p>
              {error && <div style={{ background: "rgba(201,80,60,.12)", border: "1px solid rgba(201,80,60,.4)", color: "#E68863", borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "1rem", fontSize: "0.95rem" }}>{error}</div>}
              <label style={{ display: "block", color: "#8B7E6B", fontSize: "0.9rem", marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid #2a2520", background: "#1c1814", color: "#F5E6D3", marginBottom: "1.2rem", fontSize: "1rem" }} />
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.95rem", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C96E4D,#E68863)", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                {loading ? "Отправляем..." : "Отправить ссылку"}
              </button>
            </form>
          )}
          <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/login" style={{ color: "#B8956A", fontSize: "0.95rem" }}>← Вернуться ко входу</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
