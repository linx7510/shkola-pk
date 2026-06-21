"use client";
import ClientDashboard from "@/components/ClientDashboard";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LessonProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

interface ModuleProgress {
  id: string;
  title: string;
  order: number;
  lessons: { id: string; title: string; order: number; isFree: boolean; duration: number }[];
}

interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  shortDesc: string | null;
  icon: string | null;
  enrollment: {
    id: string;
    progress: number;
    createdAt: string;
  };
  stats: {
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
  };
  modules: ModuleProgress[];
  lessonProgress: { lessonId: string; completed: boolean }[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "profile" | "projects">("overview");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });

    // Fetch enrollments with progress
    fetch("/api/progress", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.enrollments) {
          setCourses(data.enrollments);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleEnroll = async (courseId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (data.enrollment) {
        // Refetch progress
        const progressRes = await fetch("/api/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const progressData = await progressRes.json();
        if (progressData.enrollments) {
          setCourses(progressData.enrollments);
        }
      }
    } catch (err) {
      console.error("Enrollment error:", err);
    }
  };

  const toggleLesson = async (lessonId: string, currentCompleted: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonId, completed: !currentCompleted }),
      });
      // Refetch
      const progressRes = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progressData = await progressRes.json();
      if (progressData.enrollments) {
        setCourses(progressData.enrollments);
      }
    } catch (err) {
      console.error("Toggle lesson error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--color-beige-300)", fontSize: "1.1rem" }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-950)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--glass-border)", padding: "1rem var(--container-px)", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <img src="/images/header-logo-tiny.webp" alt="" style={{ width: 32, height: 32, filter: "brightness(1.2)" }} />
          <span style={{ fontWeight: 700, color: "var(--color-beige-200)" }}>Школа ПК</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{user?.name}</span>
          <button onClick={logout} style={{ fontSize: "0.8rem", color: "var(--color-orange-400)", background: "none", border: "1px solid rgba(201,110,77,0.3)", padding: "0.4rem 1rem", borderRadius: 6, cursor: "pointer" }}>Выйти</button>
        </div>
      </header>

      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "2rem var(--container-px)" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {(["overview", "courses", "projects", "profile"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.6rem 1.5rem",
                borderRadius: 8,
                border: activeTab === tab ? "1px solid rgba(214,198,178,0.2)" : "1px solid transparent",
                background: activeTab === tab ? "rgba(214,198,178,0.08)" : "transparent",
                color: activeTab === tab ? "var(--color-beige-200)" : "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: activeTab === tab ? 600 : 400,
                transition: "all 0.2s",
              }}
            >
              {tab === "overview" ? "Обзор" : tab === "courses" ? "Мои курсы" : tab === "projects" ? "📁 Мои проекты" : "Профиль"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h1 className="heading-sweep" style={{ fontSize: "1.8rem", color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>
              Добро пожаловать, {user?.name}!
            </h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
              Отслеживайте прогресс обучения и продолжайте с того места, где остановились.
            </p>

            {/* Stats cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
              <div className="glass-2" style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-orange-400)" }}>{courses.length}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Курсов пройдено/в процессе</div>
              </div>
              <div className="glass-2" style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-green-400)" }}>
                  {courses.reduce((sum, c) => sum + c.stats.completedLessons, 0)}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Уроков завершено</div>
              </div>
              <div className="glass-2" style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-blue-400)" }}>
                  {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.stats.progressPercent, 0) / courses.length) : 0}%
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Средний прогресс</div>
              </div>
            </div>

            {/* Course progress list */}
            {courses.length === 0 ? (
              <div className="glass-2" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                <div style={{ color: "var(--color-beige-200)", marginBottom: "0.5rem", fontWeight: 600 }}>У вас пока нет курсов</div>
                <div style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Запишитесь на первый курс и начните обучение</div>
                <Link href="/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" className="btn-primary" style={{ display: "inline-block" }}>Выбрать курс</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {courses.map((course) => (
                  <div key={course.id} className="glass-2" style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{course.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-beige-200)" }}>{course.title}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                            {course.stats.completedLessons} из {course.stats.totalLessons} уроков
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: course.stats.progressPercent === 100 ? "var(--color-green-400)" : "var(--color-orange-400)" }}>
                        {course.stats.progressPercent}%
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(214,198,178,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${course.stats.progressPercent}%`, borderRadius: 3, background: `linear-gradient(90deg, var(--color-orange-500), var(--color-green-500))`, transition: "width 0.5s var(--ease-premium)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Courses Tab with lesson tracking */}
        {activeTab === "courses" && (
          <div>
            {courses.length === 0 ? (
              <div className="glass-2" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                <div style={{ color: "var(--color-beige-200)", marginBottom: "0.5rem", fontWeight: 600 }}>Нет записанных курсов</div>
                <Link href="/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" className="btn-primary" style={{ display: "inline-block" }}>Выбрать курс</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {courses.map((course) => (
                  <CourseDetail
                    key={course.id}
                    course={course}
                    onToggleLesson={toggleLesson}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <h1 className="heading-sweep" data-text="📁 Мои проекты" style={{ fontSize: "1.8rem", color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>
              📁 Мои проекты
            </h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
              Отслеживайте прогресс создания вашего кооператива — от анкет до регистрации в ФНС.
            </p>
            <ClientDashboard />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && user && (
          <div className="glass-2" style={{ padding: "2rem", maxWidth: 500 }}>
            <h2 className="heading-sweep" style={{ fontSize: "1.3rem", color: "var(--color-beige-200)", marginBottom: "1.5rem" }}>Профиль</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-disabled)", marginBottom: "0.25rem" }}>Имя</div>
                <div style={{ color: "var(--color-beige-200)" }}>{user.name}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-disabled)", marginBottom: "0.25rem" }}>Email</div>
                <div style={{ color: "var(--color-beige-200)" }}>{user.email}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-disabled)", marginBottom: "0.25rem" }}>Роль</div>
                <div style={{ color: "var(--color-orange-400)" }}>{user.role === "ADMIN" ? "Администратор" : user.role === "TEACHER" ? "Преподаватель" : "Студент"}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Course Detail with lesson checkboxes ─── */
function CourseDetail({ course, onToggleLesson }: { course: CourseWithProgress; onToggleLesson: (lessonId: string, completed: boolean) => void }) {
  const [expandedModule, setExpandedModule] = useState<string | null>(course.modules[0]?.id || null);

  return (
    <div className="glass-2" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>{course.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-beige-200)", fontSize: "1.1rem" }}>{course.title}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{course.stats.progressPercent}% завершено</div>
          </div>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--color-green-400)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--color-green-400)", fontSize: "0.85rem" }}>
          {course.stats.progressPercent}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(214,198,178,0.08)", overflow: "hidden", marginBottom: "1.5rem" }}>
        <div style={{ height: "100%", width: `${course.stats.progressPercent}%`, borderRadius: 3, background: "linear-gradient(90deg, var(--color-orange-500), var(--color-green-500))", transition: "width 0.5s var(--ease-premium)" }} />
      </div>

      {/* Modules */}
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {course.modules.map((mod) => {
          const modLessons = mod.lessons;
          const modCompleted = modLessons.filter((l) =>
            course.lessonProgress.some((lp) => lp.lessonId === l.id && lp.completed)
          ).length;

          return (
            <div key={mod.id}>
              <button
                onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  background: "rgba(214,198,178,0.04)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "var(--color-beige-200)",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ fontWeight: 500 }}>{mod.title}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{modCompleted}/{modLessons.length}</span>
              </button>

              {expandedModule === mod.id && (
                <div style={{ padding: "0.5rem 0 0.5rem 1rem", display: "grid", gap: "0.25rem" }}>
                  {modLessons.map((lesson) => {
                    const isCompleted = course.lessonProgress.some(
                      (lp) => lp.lessonId === lesson.id && lp.completed
                    );
                    return (
                      <div
                        key={lesson.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: 6,
                          background: isCompleted ? "rgba(76,154,122,0.06)" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onClick={() => onToggleLesson(lesson.id, isCompleted)}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            border: isCompleted ? "none" : "2px solid rgba(214,198,178,0.2)",
                            background: isCompleted ? "var(--color-green-400)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "0.7rem",
                            color: isCompleted ? "#0D0C0A" : "transparent",
                            transition: "all 0.2s",
                          }}
                        >
                          ✓
                        </div>
                        <span style={{ fontSize: "0.85rem", color: isCompleted ? "var(--color-green-400)" : "var(--color-text-muted)", textDecoration: isCompleted ? "line-through" : "none" }}>
                          {lesson.title}
                        </span>
                        {lesson.isFree && (
                          <span style={{ fontSize: "0.7rem", color: "var(--color-orange-400)", background: "rgba(201,110,77,0.1)", padding: "0.15rem 0.5rem", borderRadius: 4, marginLeft: "auto" }}>Бесплатно</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

