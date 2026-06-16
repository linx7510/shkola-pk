"use client";
import { useState, useEffect } from "react";

interface Lead { id: string; name: string; email: string; phone: string | null; message: string | null; source: string | null; courseSlug: string | null; status: string; createdAt: string; }

const statusColors: Record<string, { bg: string; color: string }> = {
  NEW: { bg: "rgba(33,150,243,0.15)", color: "#64B5F6" },
  CONTACTED: { bg: "rgba(255,152,0,0.15)", color: "#FFB74D" },
  QUALIFIED: { bg: "rgba(76,175,80,0.15)", color: "#81C784" },
  LOST: { bg: "rgba(244,67,54,0.15)", color: "#EF5350" },
  CONVERTED: { bg: "rgba(156,39,176,0.15)", color: "#CE93D8" },
};
const statusLabels: Record<string, string> = { NEW: "Новый", CONTACTED: "Связались", QUALIFIED: "Квалифицир.", LOST: "Потерян", CONVERTED: "Конвертирован" };

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const load = () => {
    fetch("/api/leads?limit=100", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => { setLeads(data.leads || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D6C6B2" }}>Лиды ({total})</h1>
      </div>

      {loading ? <p style={{ color: "rgba(214,198,178,0.4)" }}>Загрузка...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {leads.map(lead => {
            const sc = statusColors[lead.status] || statusColors.NEW;
            return (
              <div key={lead.id} style={{ padding: "0.75rem 1rem", background: "rgba(214,198,178,0.03)", border: "1px solid rgba(214,198,178,0.08)", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 4, background: sc.bg, color: sc.color }}>
                    {statusLabels[lead.status] || lead.status}
                  </span>
                  <span style={{ fontWeight: 600, color: "#D6C6B2" }}>{lead.name}</span>
                  <span style={{ color: "rgba(214,198,178,0.4)", fontSize: "0.85rem" }}>{lead.email}</span>
                  {lead.phone && <span style={{ color: "rgba(214,198,178,0.3)", fontSize: "0.8rem" }}>{lead.phone}</span>}
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: "0.75rem", color: "rgba(214,198,178,0.3)" }}>{new Date(lead.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
                {lead.message && <p style={{ color: "rgba(214,198,178,0.5)", fontSize: "0.85rem", margin: "0.25rem 0" }}>{lead.message}</p>}
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.4rem" }}>
                  {Object.keys(statusColors).map(s => (
                    <button key={s} onClick={() => updateStatus(lead.id, s)} style={{
                      fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: 3,
                      border: lead.status === s ? "1px solid " + statusColors[s].color : "1px solid rgba(214,198,178,0.08)",
                      background: lead.status === s ? statusColors[s].bg : "transparent",
                      color: lead.status === s ? statusColors[s].color : "rgba(214,198,178,0.3)",
                      cursor: "pointer",
                    }}>
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {leads.length === 0 && <p style={{ color: "rgba(214,198,178,0.4)" }}>Нет лидов</p>}
        </div>
      )}
    </div>
  );
}
