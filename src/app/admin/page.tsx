"use client";
import { useState, useEffect } from "react";

interface Stats {
  users: number;
  courses: number;
  enrollments: number;
  lessons: number;
  modules: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentEnrollment {
  id: string;
  progress: number;
  createdAt: string;
  user: { name: string; email: string };
  course: { title: string; icon: string | null };
}

interface CourseStat {
  id: string;
  title: string;
  icon: string | null;
  _count: { enrollments: number; modules: number };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
        setRecentEnrollments(data.recentEnrollments || []);
        setCourseStats(data.courseStats || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "3rem", color: "var(--color-beige-300)" }}>Загрузка статистики...</div>;
  }

  const statCards = [
    { label: "Пользователей", value: stats?.users || 0, color: "var(--color-orange-400)", icon: "👥" },
    { label: "Курсов", value: stats?.courses || 0, color: "var(--color-green-400)", icon: "📚" },
    { label: "Записей на курсы", value: stats?.enrollments || 0, color: "var(--color-blue-400)", icon: "📋" },
    { label: "Уроков", value: stats?.lessons || 0, color: "var(--color-beige-300)", icon: "📖" },
    { label: "Модулей", value: stats?.modules || 0, color: "var(--color-orange-400)", icon: "📦" },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Панель управления</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>Обзор платформы Школа ПК</p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {statCards.map((s) => (
          <div key={s.label} className="glass-2" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
        {/* Course stats */}
        <div className="glass-2" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-beige-200)", marginBottom: "1rem" }}>Курсы — записи</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {courseStats.map((cs) => (
              <div key={cs.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", borderRadius: 6, background: "rgba(214,198,178,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{cs.icon || "📖"}</span>
                  <span style={{ fontSize: "0.88rem", color: "var(--color-beige-200)" }}>{cs.title}</span>
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  <span>{cs._count.modules} мод.</span>
                  <span style={{ color: "var(--color-green-400)", fontWeight: 600 }}>{cs._count.enrollments} зап.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="glass-2" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-beige-200)", marginBottom: "1rem" }}>Новые пользователи</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {recentUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: 6, background: "rgba(214,198,178,0.03)" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{u.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)" }}>{u.email}</div>
                </div>
                <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: 4, background: u.role === "ADMIN" ? "rgba(201,110,77,0.15)" : "rgba(76,154,122,0.1)", color: u.role === "ADMIN" ? "var(--color-orange-400)" : "var(--color-green-400)" }}>
                  {u.role === "ADMIN" ? "Админ" : u.role === "TEACHER" ? "Учитель" : "Студент"}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Пока нет пользователей</div>}
          </div>

          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-beige-200)", marginBottom: "1rem", marginTop: "1.5rem" }}>Последние записи</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {recentEnrollments.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: 6, background: "rgba(214,198,178,0.03)" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{e.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)" }}>{e.course.icon} {e.course.title}</div>
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-green-400)" }}>{e.progress}%</span>
              </div>
            ))}
            {recentEnrollments.length === 0 && <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Нет записей</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
