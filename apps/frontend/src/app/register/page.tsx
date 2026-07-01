"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CursorLight from "@/components/CursorLight";
import { SmartCaptcha } from "@/components/SmartCaptcha";
import Header from "@/components/Header";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", passwordConfirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Пароль минимум 6 символов");
      return;
    }
    if (!captchaToken) {
      setError("Подтвердите, что вы не робот");
      return;
    }
    if (!consent) {
      setError("Необходимо согласие на обработку персональных данных");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          captchaToken: captchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при регистрации");
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
          <h1>Регистрация</h1>
          <p className="auth-subtitle">Создайте аккаунт в Школе ПК</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Имя
              </label>
              <input
                type="text"
                className="form-field"
                placeholder="Ваше имя"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "1.05rem",
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
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Телефон (необязательно)
              </label>
              <input
                type="tel"
                className="form-field"
                placeholder="+7 (___) ___-__-__"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Пароль
              </label>
              <input
                type="password"
                className="form-field"
                placeholder="Минимум 6 символов"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                Подтвердите пароль
              </label>
              <input
                type="password"
                className="form-field"
                placeholder="Повторите пароль"
                value={form.passwordConfirm}
                onChange={(e) => update("passwordConfirm", e.target.value)}
                required
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                marginBottom: "0.75rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: "0.15rem", cursor: "pointer" }}
              />
              <span>
                Я согласен на обработку персональных данных в соответствии с{" "}
                <Link href="/politika-konfidentsialnosti" style={{ color: "#B8956A", textDecoration: "underline" }}>
                  Политикой конфиденциальности
                </Link>{" "}
                (152-ФЗ)
              </span>
            </label>
            <div style={{ marginBottom: "1rem" }}>
              <SmartCaptcha onVerify={(token) => setCaptchaToken(token)} />
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
              {loading ? "Регистрируем..." : "Зарегистрироваться"}
            </button>
          </form>

          <div className="auth-divider">или</div>

          <p style={{ textAlign: "center", fontSize: "1rem" }}>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
