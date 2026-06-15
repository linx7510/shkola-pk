"use client";
import { useState, useEffect } from "react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  _count: { enrollments: number; progress: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchUsers = async (p = 1, s = "") => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (s) params.set("search", s);
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const totalPages = Math.ceil(total / 20);

  if (loading) return <div style={{ padding: "3rem", color: "var(--color-beige-300)" }}>Загрузка пользователей...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-beige-200)" }}>Пользователи</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{total} пользователей</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          className="form-field"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.6rem 1.5rem" }}>Найти</button>
      </form>

      {/* Users table */}
      <div className="glass-2" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Имя</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Email</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Роль</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Курсы</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Прогресс</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(214,198,178,0.04)" }}>
                <td style={{ padding: "0.6rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,110,77,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-orange-400)" }}>
                      {u.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: "0.88rem", color: "var(--color-beige-200)" }}>{u.name}</span>
                    {!u.isActive && <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 3, background: "rgba(168,85,56,0.15)", color: "var(--color-orange-600)" }}>Заблокирован</span>}
                  </div>
                </td>
                <td style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{u.email}</td>
                <td style={{ padding: "0.6rem 1rem" }}>
                  <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: 4, background: u.role === "ADMIN" ? "rgba(201,110,77,0.15)" : u.role === "TEACHER" ? "rgba(58,109,140,0.12)" : "rgba(76,154,122,0.1)", color: u.role === "ADMIN" ? "var(--color-orange-400)" : u.role === "TEACHER" ? "var(--color-blue-400)" : "var(--color-green-400)" }}>
                    {u.role === "ADMIN" ? "Админ" : u.role === "TEACHER" ? "Учитель" : "Студент"}
                  </span>
                </td>
                <td style={{ padding: "0.6rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{u._count.enrollments}</td>
                <td style={{ padding: "0.6rem 1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--color-green-400)" }}>{u._count.progress}</td>
                <td style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", color: "var(--color-text-disabled)" }}>{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>Пользователи не найдены</div>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button disabled={page <= 1} onClick={() => { setPage(page - 1); fetchUsers(page - 1, search); }} style={{ padding: "0.4rem 0.75rem", borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--color-text-muted)", cursor: page <= 1 ? "default" : "pointer" }}>←</button>
          <span style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchUsers(page + 1, search); }} style={{ padding: "0.4rem 0.75rem", borderRadius: 6, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--color-text-muted)", cursor: page >= totalPages ? "default" : "pointer" }}>→</button>
        </div>
      )}
    </div>
  );
}
