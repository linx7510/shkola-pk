"use client";
import { useState, useEffect } from "react";

interface OrderItem {
  id: string;
  amount: number;
  description: string | null;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  user: { name: string; email: string };
  course: { title: string; icon: string | null } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async (status = "") => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const params = status ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/orders${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleFilter = (status: string) => {
    setStatusFilter(status);
    setLoading(true);
    fetchOrders(status);
  };

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: "rgba(201,110,77,0.12)", color: "var(--color-orange-400)", label: "Ожидает" },
    COMPLETED: { bg: "rgba(76,154,122,0.12)", color: "var(--color-green-400)", label: "Завершён" },
    FAILED: { bg: "rgba(168,85,56,0.12)", color: "var(--color-orange-600)", label: "Ошибка" },
    REFUNDED: { bg: "rgba(58,109,140,0.12)", color: "var(--color-blue-400)", label: "Возврат" },
  };

  const totalRevenue = orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.amount, 0);

  if (loading) return <div style={{ padding: "3rem", color: "var(--color-beige-300)" }}>Загрузка...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Заказы и платежи</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>{total} заказов · Выручка: {totalRevenue.toLocaleString("ru-RU")} ₽</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["", "PENDING", "COMPLETED", "FAILED"].map((s) => (
          <button key={s} onClick={() => handleFilter(s)} style={{ padding: "0.4rem 0.75rem", borderRadius: 6, border: statusFilter === s ? "1px solid rgba(214,198,178,0.2)" : "1px solid transparent", background: statusFilter === s ? "rgba(214,198,178,0.08)" : "transparent", color: statusFilter === s ? "var(--color-beige-200)" : "var(--color-text-muted)", cursor: "pointer", fontSize: "0.8rem" }}>
            {s || "Все"}
          </button>
        ))}
      </div>

      <div className="glass-2" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>ID</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Пользователь</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Курс</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Сумма</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Статус</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const sc = statusColors[o.status] || statusColors.PENDING;
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid rgba(214,198,178,0.04)" }}>
                  <td style={{ padding: "0.6rem 1rem", fontSize: "0.75rem", color: "var(--color-text-disabled)", fontFamily: "monospace" }}>{o.id.substring(0, 12)}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{o.user.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)" }}>{o.user.email}</div>
                  </td>
                  <td style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{o.course ? `${o.course.icon || ""} ${o.course.title}` : "—"}</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "right", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-beige-200)" }}>{o.amount.toLocaleString("ru-RU")} ₽</td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center" }}><span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                  <td style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", color: "var(--color-text-disabled)" }}>{new Date(o.createdAt).toLocaleDateString("ru-RU")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>Нет заказов</div>}
      </div>
    </div>
  );
}
