"use client";
import ClientDashboard from "@/components/ClientDashboard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: { "Authorization": `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        // /api/auth/me возвращает { user: { email: "...", ... } }
        const userEmail = data.user?.email || data.email;
        if (data.error || !userEmail) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }
        setIsAuthenticated(true);
        setAuthChecked(true);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (!authChecked || !isAuthenticated) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#0D0C0A", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "rgba(214,198,178,0.5)",
        fontSize: "1rem",
      }}>
        Загрузка личного кабинета...
      </div>
    );
  }

  return <ClientDashboard />;
}
