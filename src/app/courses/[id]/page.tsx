"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CursorLight from "@/components/CursorLight";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  isFree: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  shortDesc: string | null;
  icon: string | null;
  modules: Module[];
  _count: { enrollments: number };
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCourse(data.course);
        // Expand first module by default
        if (data.course?.modules?.[0]?.id) {
          setExpandedModules(new Set([data.course.modules[0].id]));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
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

  if (!course) {
    return (
      <div
        style={{
          background: "var(--color-bg-950)",
          minHeight: "100vh",
          paddingTop: "calc(var(--header-h) + 3rem)",
        }}
      >
        <CursorLight />
        <Header />
        <div className="container content-area" style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Курс не найден</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Возможно, он был удалён или вы перешли по неверной ссылке.
          </p>
          <Link href="/courses" className="btn-primary">
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div style={{ background: "var(--color-bg-950)", minHeight: "100vh" }}>
      <CursorLight />
      <Header />

      <div style={{ paddingTop: "calc(var(--header-h) + 2rem)" }}>
        <div className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Breadcrumbs */}
          <Reveal>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                marginBottom: "2rem",
              }}
            >
              <Link href="/courses" style={{ color: "var(--color-text-muted)" }}>
                Каталог
              </Link>
              <span>/</span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {course.title}
              </span>
            </div>
          </Reveal>

          {/* Course header */}
          <Reveal>
            <div
              className="glass-3"
              style={{
                padding: "2.5rem",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  background: "rgba(201,110,77,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  flexShrink: 0,
                }}
              >
                {course.icon || "📚"}
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {course.title}
                </h1>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    lineHeight: 1.7,
                    maxWidth: 600,
                  }}
                >
                  {course.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginTop: "1rem",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span>
                    {course.modules.length} модулей
                  </span>
                  <span>{totalLessons} уроков</span>
                  <span>{course._count.enrollments} студентов</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Modules */}
          <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
            {course.modules.map((mod, idx) => (
              <Reveal key={mod.id} delay={Math.min(idx + 1, 6)}>
                <div className="glass-2" style={{ overflow: "hidden" }}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.25rem 1.5rem",
                      background: "none",
                      border: "none",
                      color: "var(--color-text-primary)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "rgba(201,110,77,0.12)",
                          color: "var(--color-orange-400)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </span>
                      {mod.title}
                      <span
                        className="mono"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-disabled)",
                        }}
                      >
                        {mod.lessons.length} уроков
                      </span>
                    </span>
                    <span
                      style={{
                        transition: "transform 0.3s",
                        transform: expandedModules.has(mod.id)
                          ? "rotate(180deg)"
                          : "none",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {expandedModules.has(mod.id) && (
                    <div
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        padding: "0.5rem 1.5rem 1rem",
                      }}
                    >
                      {mod.lessons.map((lesson, li) => (
                        <div
                          key={lesson.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem 0",
                            borderBottom:
                              li < mod.lessons.length - 1
                                ? "1px solid rgba(255,255,255,0.03)"
                                : "none",
                          }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: lesson.isFree
                                ? "rgba(76,154,122,0.15)"
                                : "rgba(255,255,255,0.04)",
                              color: lesson.isFree
                                ? "var(--color-green-400)"
                                : "var(--color-text-disabled)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                            }}
                          >
                            {lesson.isFree ? "✓" : "🔒"}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              color: lesson.isFree
                                ? "var(--color-text-secondary)"
                                : "var(--color-text-disabled)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {lesson.title}
                          </span>
                          {lesson.duration > 0 && (
                            <span
                              className="mono"
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-disabled)",
                              }}
                            >
                              {Math.floor(lesson.duration / 60)}:
                              {(lesson.duration % 60).toString().padStart(2, "0")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal>
            <div
              className="glass-4"
              style={{
                padding: "2rem",
                textAlign: "center",
                marginBottom: "3rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                Готовы начать обучение?
              </h2>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  marginBottom: "1.5rem",
                }}
              >
                Запишитесь на курс и получите доступ к материалам
              </p>
              <a href="/#contacts" className="btn-primary">
                Записаться на курс
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
