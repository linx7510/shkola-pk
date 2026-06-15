"use client";
import { useState, useEffect } from "react";

interface EnrollmentItem {
  id: string;
  progress: number;
  createdAt: string;
  userId: string;
  courseId: string;
  user: { name: string; email: string };
  course: { title: string; icon: string | null };
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setEnrollments(data.recentEnrollments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "3rem", color: "var(--color-beige-300)" }}>Загрузка записей...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Записи на курсы</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "2rem" }}>{enrollments.length} последних записей</p>

      <div className="glass-2" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Пользователь</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Курс</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Прогресс</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Дата записи</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid rgba(214,198,178,0.04)" }}>
                <td style={{ padding: "0.6rem 1rem" }}>
                  <div style={{ fontSize: "0.88rem", color: "var(--color-beige-200)" }}>{e.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)" }}>{e.user.email}</div>
                </td>
                <td style={{ padding: "0.6rem 1rem", fontSize: "0.88rem", color: "var(--color-beige-200)" }}>
                  {e.course.icon} {e.course.title}
                </td>
                <td style={{ padding: "0.6rem 1rem", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                    <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(214,198,178,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${e.progress}%`, borderRadius: 2, background: "linear-gradient(90deg, var(--color-orange-500), var(--color-green-500))" }} />
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: e.progress === 100 ? "var(--color-green-400)" : "var(--color-beige-200)" }}>{e.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", color: "var(--color-text-disabled)" }}>
                  {new Date(e.createdAt).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {enrollments.length === 0 && <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>Нет записей</div>}
      </div>
    </div>
  );
}
