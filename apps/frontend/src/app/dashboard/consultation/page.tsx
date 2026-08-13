"use client";
import ConsultationBooking from "@/components/ConsultationBooking";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultationPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("auth_token") || "";
    if (!t) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `JWT ${t}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const email = data.user?.email || data.email;
        if (data.error || !email) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }
        setToken(t);
        setUserEmail(email);
        setAuthChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        router.push("/login");
      });
  }, [router]);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#D6C6B2", fontSize: "1.1rem" }}>Загрузка...</div>
      </div>
    );
  }

  return <ConsultationBooking token={token} userEmail={userEmail} />;
}
