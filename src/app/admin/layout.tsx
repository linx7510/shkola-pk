"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error || data.user?.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--color-beige-300)" }}>Проверка доступа...</div>
      </div>
    );
  }

  const navItems = [
    { label: "Обзор", href: "/admin", icon: "📊" },
    { label: "Курсы", href: "/admin/courses", icon: "📚" },
    { label: "Пользователи", href: "/admin/users", icon: "👥" },
    { label: "Заказы", href: "/admin/orders", icon: "💳" },
    { label: "Записи", href: "/admin/enrollments", icon: "📋" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 72,
        minHeight: "100vh",
        background: "var(--color-bg-900)",
        borderRight: "1px solid var(--glass-border)",
        padding: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.65rem", borderBottom: "1px solid var(--glass-border)", marginBottom: "1rem" }}>
          <img src="/images/header-logo-tiny.webp" alt="" style={{ width: 36, height: 36, filter: "brightness(1.2)" }} />
          {sidebarOpen && <div>
            <div style={{ fontWeight: 700, color: "var(--color-beige-200)", fontSize: "0.95rem" }}>Школа ПК</div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-orange-400)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Админ-панель</div>
          </div>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0 0.5rem" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: 8,
                background: isActive(item.href) ? "rgba(214,198,178,0.08)" : "transparent",
                border: isActive(item.href) ? "1px solid rgba(214,198,178,0.12)" : "1px solid transparent",
                color: isActive(item.href) ? "var(--color-beige-200)" : "var(--color-text-muted)",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: isActive(item.href) ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            margin: "1rem",
            padding: "0.5rem",
            background: "rgba(214,198,178,0.06)",
            border: "1px solid var(--glass-border)",
            borderRadius: 6,
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: "0.85rem",
          }}
        >
          {sidebarOpen ? "← Свернуть" : "→"}
        </button>

        {/* User */}
        <div style={{ padding: "1rem", borderTop: "1px solid var(--glass-border)", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,110,77,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: "var(--color-orange-400)", fontWeight: 600 }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            {sidebarOpen && <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--color-beige-200)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-disabled)" }}>Администратор</div>
            </div>}
          </div>
          {sidebarOpen && <Link href="/dashboard" style={{ display: "block", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "none" }}>← Вернуться на сайт</Link>}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
