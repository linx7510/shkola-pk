"use client";
import { useState, useEffect } from "react";

interface AuditLog { id: string; userId: string | null; action: string; entity: string; entityId: string | null; details: string | null; ip: string | null; createdAt: string; user: { name: string; email: string } | null; }

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/audit?limit=100", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => { setLogs(data.logs || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  }, []);

  const actionColors: Record<string, string> = {
    CREATE: "#81C784", UPDATE: "#64B5F6", DELETE: "#EF5350", LEAD_CREATED: "#FFB74D",
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D6C6B2", marginBottom: "1.5rem" }}>Аудит-лог ({total})</h1>

      {loading ? <p style={{ color: "rgba(214,198,178,0.4)" }}>Загрузка...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: "rgba(214,198,178,0.02)", border: "1px solid rgba(214,198,178,0.06)", borderRadius: 6, fontSize: "0.82rem" }}>
              <span style={{ color: "rgba(214,198,178,0.3)", minWidth: 100 }}>{new Date(log.createdAt).toLocaleString("ru-RU")}</span>
              <span style={{ color: actionColors[log.action] || "#D6C6B2", fontWeight: 600, minWidth: 90 }}>{log.action}</span>
              <span style={{ color: "rgba(214,198,178,0.5)" }}>{log.entity}</span>
              {log.details && <span style={{ color: "rgba(214,198,178,0.4)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.details}</span>}
              {log.user && <span style={{ color: "rgba(214,198,178,0.3)", fontSize: "0.75rem" }}>{log.user.name}</span>}
            </div>
          ))}
          {logs.length === 0 && <p style={{ color: "rgba(214,198,178,0.4)" }}>Нет записей</p>}
        </div>
      )}
    </div>
  );
}
