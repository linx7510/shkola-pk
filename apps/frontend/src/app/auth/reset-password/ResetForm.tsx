"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Пароль должен быть не короче 8 символов"); return; }
    if (password !== password2) { setError("Пароли не совпадают"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Ошибка. Попробуйте позже.");
      else {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Ошибка соединения. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <p style={{ color: "#6DB89A", textAlign: "center", lineHeight: 1.7 }}>Пароль обновлён! Перенаправляем на страницу входа...</p>;
  }

  if (!token) {
    return (
      <p style={{ color: "#D6C6B2", textAlign: "center", lineHeight: 1.7 }}>
        Ссылка недействительна — не хватает кода восстановления. Запросите восстановление заново:{" "}
        <Link href="/auth/forgot-password" style={{ color: "#B8956A" }}>Напомнить пароль</Link>
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      {error && <div style={{ background: "rgba(201,80,60,.12)", border: "1px solid rgba(201,80,60,.4)", color: "#E68863", borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "1rem", fontSize: "0.95rem" }}>{error}</div>}
      <label style={{ display: "block", color: "#8B7E6B", fontSize: "0.9rem", marginBottom: 6 }}>Новый пароль (не короче 8 символов)</label>
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          type={show ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.85rem 3rem 0.85rem 1rem", borderRadius: 10, border: "1px solid #2a2520", background: "#1c1814", color: "#F5E6D3", fontSize: "1rem", boxSizing: "border-box" }}
        />
        <button type="button" aria-label="Показать пароль" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#8B7E6B" }}>
          {show ? "🙈" : "👁"}
        </button>
      </div>
      <label style={{ display: "block", color: "#8B7E6B", fontSize: "0.9rem", marginBottom: 6 }}>Повторите пароль</label>
      <input
        type={show ? "text" : "password"}
        required
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid #2a2520", background: "#1c1814", color: "#F5E6D3", marginBottom: "1.2rem", fontSize: "1rem", boxSizing: "border-box" }}
      />
      <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.95rem", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C96E4D,#E68863)", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
        {loading ? "Сохраняем..." : "Установить пароль"}
      </button>
    </form>
  );
}
