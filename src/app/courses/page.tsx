"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  shortDesc: string | null;
  icon: string | null;
  order: number;
  isPublished: boolean;
  modules: { id: string; title: string; order: number; lessons: { id: string; isFree: boolean }[] }[];
}

/* Course prices mapping */
const coursePrices: Record<string, { amount: number; label: string }> = {
  "course-pk-basics": { amount: 15000, label: "Базовый" },
  "course-consulting": { amount: 25000, label: "Консалтинг" },
  "course-registration": { amount: 50000, label: "Под ключ" },
  "course-asset-protection": { amount: 35000, label: "Защита активов" },
  "course001": { amount: 15000, label: "Базовый" },
  "course002": { amount: 20000, label: "Налоги" },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data.courses || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/progress", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.enrollments) {
            setEnrollments(data.enrollments.map((e: any) => e.courseId || e.course?.id));
          }
        })
        .catch(() => {});
    }
  }, [router]);

  const handlePurchase = async (courseId: string) => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const price = coursePrices[courseId];
    if (!price) {
      // Free enrollment
      setPurchasing(courseId);
      try {
        const res = await fetch("/api/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId }),
        });
        const data = await res.json();
        if (data.enrollment) {
          setEnrollments((prev) => [...prev, courseId]);
        }
      } catch (err) {
        console.error("Enrollment error:", err);
      } finally {
        setPurchasing(null);
      }
      return;
    }

    // Paid course — create payment
    setPurchasing(courseId);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId, amount: price.amount, description: `Оплата курса: ${courses.find(c => c.id === courseId)?.title}` }),
      });
      const data = await res.json();
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Ошибка создания платежа");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--color-beige-300)" }}>Загрузка курсов...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-950)" }}>
      <header style={{ borderBottom: "1px solid var(--glass-border)", padding: "1rem var(--container-px)", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
          <img src="/images/header-logo-tiny.webp" alt="" style={{ width: 32, height: 32, filter: "brightness(1.2)" }} />
          <span style={{ fontWeight: 700, color: "var(--color-beige-200)" }}>Школа ПК</span>
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/dashboard" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textDecoration: "none" }}>Мой кабинет</Link>
          <Link href="/login" style={{ fontSize: "0.85rem", color: "var(--color-orange-400)", textDecoration: "none" }}>Войти</Link>
        </div>
      </header>

      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "3rem var(--container-px)" }}>
        <h1 className="heading-sweep" style={{ fontSize: "2rem", color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Каталог курсов</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2.5rem" }}>Выберите курс и начните обучение прямо сейчас</p>

        {courses.length === 0 ? (
          <div className="glass-2" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
            <div style={{ color: "var(--color-beige-200)" }}>Курсы скоро появятся</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            {courses.map((course) => {
              const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
              const freeLessons = course.modules.reduce((sum, m) => sum + m.lessons.filter(l => l.isFree).length, 0);
              const isEnrolled = enrollments.includes(course.id);
              const price = coursePrices[course.id];

              return (
                <div key={course.id} className="glass-2" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(201,110,77,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                      {course.icon || "📖"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--color-beige-200)", fontSize: "1.1rem" }}>{course.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                        {course.modules.length} модулей · {totalLessons} уроков · {freeLessons} бесплатных
                      </div>
                    </div>
                  </div>

                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", lineHeight: 1.7, flex: 1 }}>
                    {course.shortDesc || course.description.substring(0, 150) + "..."}
                  </p>

                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
                    <div>
                      {price ? (
                        <div>
                          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-orange-400)" }}>{price.amount.toLocaleString("ru-RU")} ₽</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)", marginLeft: "0.5rem" }}>{price.label}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-green-400)" }}>Бесплатно</span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {isEnrolled ? (
                        <Link href="/dashboard" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.6rem 1.5rem", textDecoration: "none" }}>
                          Продолжить →
                        </Link>
                      ) : (
                        <button
                          onClick={() => handlePurchase(course.id)}
                          disabled={purchasing === course.id}
                          className="btn-primary"
                          style={{ fontSize: "0.85rem", padding: "0.6rem 1.5rem" }}
                        >
                          {purchasing === course.id ? "Обработка..." : price ? "Купить" : "Записаться"}
                        </button>
                      )}
                      <Link
                        href={`/courses/${course.id}`}
                        style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textDecoration: "underline", display: "flex", alignItems: "center" }}
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
