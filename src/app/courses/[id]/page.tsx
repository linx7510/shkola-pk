import { notFound } from "next/navigation";
import { Metadata } from "next";
import Header from "@/components/Header";
import CursorLight from "@/components/CursorLight";
import Reveal from "@/components/Reveal";
import CourseDetailClient from "./CourseDetailClient";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await payloadApi(`/courses/${id}?depth=1`);
  if (!course) return { title: "Курс не найден" };
  return {
    title: `${course.title} | Школа ПК`,
    description: course.shortDesc || course.description?.substring(0, 160) || "",
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;

  // Fetch course, modules, and lessons in parallel
  const [course, modulesData, lessonsData] = await Promise.all([
    payloadApi(`/courses/${id}?depth=1`),
    payloadApi(`/modules?where[course][equals]=${id}&sort=order&limit=50&depth=0`),
    payloadApi(`/lessons?limit=500&depth=0`),
  ]);

  if (!course || !course.isPublished) notFound();

  // Group lessons by module
  const modules = (modulesData?.docs || []).map((mod: any) => {
    const moduleLessons = (lessonsData?.docs || [])
      .filter((l: any) => {
        const modId = l.module?.id || l.module;
        return modId === mod.id;
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((l: any) => ({
        id: String(l.id),
        title: l.title,
        duration: l.duration || 0,
        isFree: l.isFree || false,
        order: l.order || 0,
      }));

    return {
      id: String(mod.id),
      title: mod.title,
      order: mod.order || 0,
      lessons: moduleLessons,
    };
  }).sort((a: any, b: any) => a.order - b.order);

  const totalLessons = modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);

  const courseData = {
    id: String(course.id),
    title: course.title,
    slug: course.slug || '',
    description: course.description || '',
    shortDesc: course.shortDesc || null,
    icon: course.icon || null,
    price: course.price || null,
    modules,
    totalLessons,
    totalModules: modules.length,
  };

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
              <a href="/courses" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
                Каталог
              </a>
              <span>/</span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {courseData.title}
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
                {courseData.icon || "📚"}
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {courseData.title}
                </h1>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    lineHeight: 1.7,
                    maxWidth: 600,
                  }}
                >
                  {courseData.description}
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
                  <span>{courseData.totalModules} модулей</span>
                  <span>{courseData.totalLessons} уроков</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Modules */}
          <CourseDetailClient modules={courseData.modules} />

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
