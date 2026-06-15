"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CursorLight from "@/components/CursorLight";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  enrollments: { id: string; courseId: string; progress: number; course: { id: string; title: string; icon: string | null } }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div
        style={{
          background: "var(--color-bg-950)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (!user) return null;

  const sidebarItems = [
    { id: "overview", icon: "📊", label: "Обзор" },
    { id: "courses", icon: "📚", label: "Мои курсы" },
    { id: "profile", icon: "👤", label: "Профиль" },
  ];

  return (
    <div style={{ background: "var(--color-bg-950)", minHeight: "100vh" }}>
      <CursorLight />
      <Header />

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, var(--color-orange-500), var(--color-beige-400))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0D0C0A",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item${activeTab === item.id ? " active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ padding: "1rem 1.5rem", marginTop: "auto" }}>
            <Link
              href="/courses"
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: "0.85rem",
                padding: "0.7rem 1rem",
              }}
            >
              Каталог курсов
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-item"
            style={{ color: "var(--color-orange-400)", marginTop: "1rem" }}
          >
            <span>🚪</span>
            Выйти
          </button>
        </aside>

        {/* Main content */}
        <main className="dashboard-content">
          {activeTab === "overview" && (
            <div>
              <Reveal>
                <h1
                  style={{
                    fontSize: "1.8rem",
                    marginBottom: "0.5rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Добро пожаловать, {user.name.split(" ")[0]}!
                </h1>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    marginBottom: "2rem",
                  }}
                >
                  Ваш персональный кабинет в Школе ПК
                </p>
              </Reveal>

              {/* Stats */}
              <Reveal delay={1}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  <div className="dashboard-card dashboard-stat">
                    <div className="dashboard-stat__number" style={{ color: "var(--color-orange-400)" }}>
                      {user.enrollments?.length || 0}
                    </div>
                    <div className="dashboard-stat__label">Курсов</div>
                  </div>
                  <div className="dashboard-card dashboard-stat">
                    <div className="dashboard-stat__number" style={{ color: "var(--color-green-400)" }}>
                      {user.enrollments?.length ? Math.round(user.enrollments.reduce((a, e) => a + e.progress, 0) / user.enrollments.length) : 0}%
                    </div>
                    <div className="dashboard-stat__label">Средний прогресс</div>
                  </div>
                  <div className="dashboard-card dashboard-stat">
                    <div className="dashboard-stat__number" style={{ color: "var(--color-blue-400)" }}>
                      {user.role === "ADMIN" ? "Админ" : user.role === "TEACHER" ? "Преподаватель" : "Студент"}
                    </div>
                    <div className="dashboard-stat__label">Роль</div>
                  </div>
                </div>
              </Reveal>

              {/* Enrollments */}
              <Reveal delay={2}>
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "1rem",
                  }}
                >
                  Мои курсы
                </h2>
                {user.enrollments && user.enrollments.length > 0 ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {user.enrollments.map((enrollment) => (
                      <Link
                        key={enrollment.id}
                        href={`/courses/${enrollment.courseId}`}
                        className="dashboard-card"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          textDecoration: "none",
                          transition: "all 0.3s",
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "rgba(201,110,77,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            flexShrink: 0,
                          }}
                        >
                          {enrollment.course.icon || "📚"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                              marginBottom: "0.35rem",
                            }}
                          >
                            {enrollment.course.title}
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar__fill"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                        <div
                          className="mono"
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {Math.round(enrollment.progress)}%
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div
                    className="dashboard-card"
                    style={{
                      textAlign: "center",
                      padding: "3rem 2rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                      📖
                    </div>
                    <p style={{ marginBottom: "1rem" }}>
                      Вы ещё не записаны ни на один курс
                    </p>
                    <Link href="/courses" className="btn-primary">
                      Перейти к каталогу
                    </Link>
                  </div>
                )}
              </Reveal>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <Reveal>
                <h1
                  style={{
                    fontSize: "1.8rem",
                    marginBottom: "1.5rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Профиль
                </h1>
              </Reveal>
              <Reveal delay={1}>
                <div className="dashboard-card" style={{ maxWidth: 500 }}>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.25rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Имя
                      </div>
                      <div
                        style={{
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {user.name}
                      </div>
                    </div>
                    <div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.25rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Email
                      </div>
                      <div
                        style={{
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.25rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Телефон
                      </div>
                      <div
                        style={{
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {user.phone || "Не указан"}
                      </div>
                    </div>
                    <div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.25rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Роль
                      </div>
                      <div
                        style={{
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {user.role === "ADMIN"
                          ? "Администратор"
                          : user.role === "TEACHER"
                            ? "Преподаватель"
                            : "Студент"}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <Reveal>
                <h1
                  style={{
                    fontSize: "1.8rem",
                    marginBottom: "1.5rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Мои курсы
                </h1>
              </Reveal>
              {user.enrollments && user.enrollments.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {user.enrollments.map((enrollment) => (
                    <Reveal key={enrollment.id} delay={1}>
                      <Link
                        href={`/courses/${enrollment.courseId}`}
                        className="dashboard-card"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          textDecoration: "none",
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: "rgba(201,110,77,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.8rem",
                            flexShrink: 0,
                          }}
                        >
                          {enrollment.course.icon || "📚"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {enrollment.course.title}
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar__fill"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="btn-secondary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}>
                          Продолжить
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Reveal delay={1}>
                  <div
                    className="dashboard-card"
                    style={{
                      textAlign: "center",
                      padding: "3rem 2rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                      📖
                    </div>
                    <p style={{ marginBottom: "1rem" }}>
                      Вы ещё не записаны ни на один курс
                    </p>
                    <Link href="/courses" className="btn-primary">
                      Перейти к каталогу
                    </Link>
                  </div>
                </Reveal>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
