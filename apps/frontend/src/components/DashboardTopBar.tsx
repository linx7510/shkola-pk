"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardTopBar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `JWT ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const logout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const displayName = user?.name || user?.email || "Профиль";

  return (
    <div style={{ background: "#14110d", borderBottom: "1px solid #2a2520" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0.7rem 1.5rem", display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/images/header-logo-tiny.webp" alt="Школа ПК" width={40} height={40} style={{ borderRadius: 8 }} />
          <span style={{ color: "#F5E6D3", fontWeight: 700, fontSize: "1rem" }}>Школа Кооперативов</span>
        </Link>
        <nav style={{ display: "flex", gap: "1.1rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "#B8956A", textDecoration: "none", fontSize: "0.95rem" }}>Главная</Link>
          <Link href="/uslugi-dlya-potrebitelskih-kooperativov" style={{ color: "#B8956A", textDecoration: "none", fontSize: "0.95rem" }}>Услуги для ПК</Link>
          <Link href="/blog" style={{ color: "#B8956A", textDecoration: "none", fontSize: "0.95rem" }}>Блог</Link>
          <Link href="/dashboard" style={{ color: "#E68863", textDecoration: "none", fontSize: "0.95rem", fontWeight: 600 }}>Личный кабинет</Link>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.9rem" }}>
          {user && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }} title={user.email}>
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C96E4D,#E68863)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                {(displayName[0] || "?").toUpperCase()}
              </span>
              <span style={{ color: "#D6C6B2", fontSize: "0.9rem" }}>
                {user.name || user.email}
                {user.name ? <span style={{ color: "#8B7E6B", marginLeft: 6 }}>{user.email}</span> : null}
              </span>
            </span>
          )}
          <button onClick={logout} style={{ background: "none", border: "1px solid #2a2520", color: "#8B7E6B", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" }}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
