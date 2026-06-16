"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Обзор", href: "/admin", icon: "📊" },
  { label: "Курсы", href: "/admin/courses", icon: "📚" },
  { label: "Блог", href: "/admin/blog", icon: "📝" },
  { label: "Глоссарий", href: "/admin/glossary", icon: "📖" },
  { label: "FAQ", href: "/admin/faqs", icon: "❓" },
  { label: "Пользователи", href: "/admin/users", icon: "👥" },
  { label: "Записи", href: "/admin/enrollments", icon: "📋" },
  { label: "Лиды", href: "/admin/leads", icon: "🎯" },
  { label: "Аудит", href: "/admin/audit", icon: "🔍" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/login"; return; }
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.role !== "ADMIN") { window.location.href = "/dashboard"; return; }
        setUser(payload);
      }
    } catch { window.location.href = "/login"; }
  }, []);

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <aside
        style={{
          width: collapsed ? 60 : 220,
          background: "rgba(214,198,178,0.03)",
          borderRight: "1px solid rgba(214,198,178,0.08)",
          padding: "1rem 0",
          transition: "width 0.2s",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid rgba(214,198,178,0.08)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: "none", border: "none", color: "#D6C6B2", cursor: "pointer", fontSize: "1.2rem" }}
          >
            {collapsed ? ">" : "<"}
          </button>
          {!collapsed && <span style={{ color: "#D6C6B2", fontWeight: 700, fontSize: "0.95rem" }}>Админ</span>}
        </div>

        <nav style={{ flex: 1, padding: "0.5rem 0" }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 1rem",
                  color: isActive ? "#E68863" : "rgba(214,198,178,0.6)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  background: isActive ? "rgba(230,136,99,0.08)" : "transparent",
                  borderRight: isActive ? "2px solid #E68863" : "2px solid transparent",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "0.5rem 1rem", borderTop: "1px solid rgba(214,198,178,0.08)" }}>
          <Link href="/" style={{ fontSize: "0.8rem", color: "rgba(214,198,178,0.4)", textDecoration: "none", display: "block", whiteSpace: "nowrap", overflow: "hidden" }}>
            {!collapsed ? "← На сайт" : "←"}
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "1.5rem", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
