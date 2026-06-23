"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CursorLight from "@/components/CursorLight";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при входе");
        return;
      }

      
      
      router.push("/dashboard");
    } catch {
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--color-bg-950)", minHeight: "100vh" }}>
      <CursorLight />
      <Header />

      <div className="auth-page">
        <div className="glass-3 auth-card">
          <h1>Вход</h1>
          <p className="auth-subtitle">Войдите в личный кабинет Школы ПК</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                className="form-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Пароль
              </label>
              <input
                type="password"
                className="form-field"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "0.5rem",
              }}
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

          <div className="auth-divider">или</div>

          <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
            Нет аккаунта?{" "}
            <Link href="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
