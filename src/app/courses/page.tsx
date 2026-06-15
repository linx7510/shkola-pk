"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import CursorLight from "@/components/CursorLight";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";

interface Course {
  id: string;
  title: string;
  description: string;
  shortDesc: string | null;
  icon: string | null;
  image: string | null;
  isPublished: boolean;
  modules: { id: string; title: string; lessons: { id: string; title: string; duration: number; isFree: boolean }[] }[];
  _count: { enrollments: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const courseIcons = ["🏛️", "📋", "💰", "🛡️", "⚖️", "🎓"];
  const badgeColors = ["orange", "green", "blue"] as const;

  return (
    <div style={{ background: "var(--color-bg-950)", minHeight: "100vh" }}>
      <CursorLight />
      <Header />

      <div
        style={{
          paddingTop: "calc(var(--header-h) + 2rem)",
          paddingBottom: "var(--section-py)",
        }}
      >
        <div className="container content-area">
          <Reveal>
            <span className="section-label">Каталог</span>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
              Курсы Школы ПК
            </h1>
            <p
              style={{
                color: "var(--color-text-muted)",
                maxWidth: 600,
                marginBottom: "2.5rem",
                fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                lineHeight: 1.7,
              }}
            >
              Практическое обучение созданию и ведению потребительских
              кооперативов. От регистрации до уверенной работы.
            </p>
          </Reveal>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                color: "var(--color-text-muted)",
              }}
            >
              Загрузка курсов...
            </div>
          ) : courses.length === 0 ? (
            <Reveal delay={1}>
              <div
                className="glass-2"
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  borderRadius: 20,
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  🚧
                </div>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Курсы скоро появятся
                </h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
                  Мы готовим обучающие программы. Оставьте заявку, и мы
                  уведомим вас о старте.
                </p>
                <a href="/#contacts" className="btn-primary">
                  Оставить заявку
                </a>
              </div>
            </Reveal>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {courses.map((course, i) => (
                <Reveal key={course.id} delay={Math.min(i + 1, 6)}>
                  <Link href={`/courses/${course.id}`} style={{ textDecoration: "none" }}>
                    <div className="course-card">
                      <div className="course-card__image">
                        {course.icon || courseIcons[i % courseIcons.length]}
                      </div>
                      <div className="course-card__body">
                        <span className={`course-card__badge course-card__badge--${badgeColors[i % 3]}`}>
                          {course.modules.length} модулей
                        </span>
                        <div className="course-card__title">{course.title}</div>
                        <div className="course-card__desc">
                          {course.shortDesc || course.description.slice(0, 120) + "..."}
                        </div>
                        <div className="course-card__meta">
                          <span>{course._count.enrollments} студентов</span>
                          <span
                            style={{
                              color: "var(--color-orange-400)",
                              fontWeight: 600,
                            }}
                          >
                            Подробнее →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
