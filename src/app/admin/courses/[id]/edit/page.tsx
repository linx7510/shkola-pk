"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  shortDesc: string | null;
  icon: string | null;
  order: number;
  isPublished: boolean;
  modules: Module[];
  _count: { enrollments: number };
}

export default function CourseEditorPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState<string | null>(null); // module id
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  // Module form
  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonIsFree, setLessonIsFree] = useState(false);

  const fetchCourse = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCourse(data.course);
      if (data.course?.modules?.[0]) {
        setExpandedModule(data.course.modules[0].id);
      }
    } catch (err) {
      console.error("Fetch course error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [courseId]);

  const saveCourse = async (updates: Record<string, any>) => {
    const token = localStorage.getItem("token");
    if (!token || !course) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      fetchCourse();
    } catch (err) {
      console.error("Save course error:", err);
    } finally {
      setSaving(false);
    }
  };

  const addModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !course) return;
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: modTitle, description: modDesc, order: course.modules.length + 1 }),
      });
      if (res.ok) {
        setAddingModule(false);
        setModTitle(""); setModDesc("");
        fetchCourse();
      }
    } catch (err) {
      console.error("Add module error:", err);
    }
  };

  const addLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          moduleId,
          title: lessonTitle,
          content: lessonContent,
          duration: lessonDuration,
          isFree: lessonIsFree,
        }),
      });
      if (res.ok) {
        setAddingLesson(null);
        setLessonTitle(""); setLessonContent(""); setLessonDuration(15); setLessonIsFree(false);
        fetchCourse();
      } else {
        const data = await res.json();
        alert(data.error || "Ошибка создания урока");
      }
    } catch (err) {
      console.error("Add lesson error:", err);
    }
  };

  if (loading) return <div style={{ padding: "3rem", color: "var(--color-beige-300)" }}>Загрузка курса...</div>;
  if (!course) return <div style={{ padding: "3rem", color: "var(--color-orange-400)" }}>Курс не найден</div>;

  return (
    <div style={{ padding: "2rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        <Link href="/admin/courses" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Курсы</Link>
        <span>/</span>
        <span style={{ color: "var(--color-beige-200)" }}>{course.title}</span>
      </div>

      {/* Course header with inline editing */}
      <div className="glass-2" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
            <input
              type="text"
              value={course.icon || ""}
              onChange={(e) => saveCourse({ icon: e.target.value })}
              style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(201,110,77,0.1)", border: "1px solid var(--glass-border)", textAlign: "center", fontSize: "1.5rem", color: "var(--color-beige-200)" }}
            />
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                onBlur={(e) => saveCourse({ title: e.target.value })}
                style={{ width: "100%", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-beige-200)", background: "transparent", border: "none", borderBottom: "1px solid var(--glass-border)", padding: "0.25rem 0", outline: "none" }}
              />
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span>{course.modules.length} модулей</span>
                <span>{course.modules.reduce((s, m) => s + m.lessons.length, 0)} уроков</span>
                <span>{course._count.enrollments} записей</span>
                <button
                  onClick={() => saveCourse({ isPublished: !course.isPublished })}
                  style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: 4, border: "none", cursor: "pointer", background: course.isPublished ? "rgba(76,154,122,0.15)" : "rgba(201,110,77,0.1)", color: course.isPublished ? "var(--color-green-400)" : "var(--color-orange-400)" }}
                >
                  {course.isPublished ? "Опубликован" : "Черновик"} — переключить
                </button>
              </div>
            </div>
          </div>
          {saving && <span style={{ fontSize: "0.8rem", color: "var(--color-orange-400)" }}>Сохранение...</span>}
        </div>
        <textarea
          value={course.description}
          onChange={(e) => setCourse({ ...course, description: e.target.value })}
          onBlur={(e) => saveCourse({ description: e.target.value })}
          style={{ width: "100%", fontSize: "0.9rem", color: "var(--color-text-muted)", background: "transparent", border: "1px solid var(--glass-border)", borderRadius: 6, padding: "0.75rem", outline: "none", resize: "vertical", minHeight: 80, lineHeight: 1.6 }}
        />
        <input
          type="text"
          value={course.shortDesc || ""}
          onChange={(e) => setCourse({ ...course, shortDesc: e.target.value })}
          onBlur={(e) => saveCourse({ shortDesc: e.target.value })}
          placeholder="Краткое описание"
          style={{ width: "100%", fontSize: "0.85rem", color: "var(--color-text-muted)", background: "transparent", border: "1px solid var(--glass-border)", borderRadius: 6, padding: "0.5rem 0.75rem", outline: "none", marginTop: "0.5rem" }}
        />
      </div>

      {/* Modules */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-beige-200)" }}>Модули и уроки</h2>
        <button onClick={() => setAddingModule(true)} className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}>+ Добавить модуль</button>
      </div>

      {/* Add module form */}
      {addingModule && (
        <form onSubmit={addModule} className="glass-2" style={{ padding: "1.25rem", marginBottom: "1rem", display: "grid", gap: "0.5rem" }}>
          <input type="text" className="form-field" placeholder="Название модуля *" value={modTitle} onChange={(e) => setModTitle(e.target.value)} required />
          <input type="text" className="form-field" placeholder="Описание модуля" value={modDesc} onChange={(e) => setModDesc(e.target.value)} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}>Создать модуль</button>
            <button type="button" onClick={() => setAddingModule(false)} style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--glass-border)", borderRadius: 6, color: "var(--color-text-muted)", cursor: "pointer" }}>Отмена</button>
          </div>
        </form>
      )}

      {/* Modules list */}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {course.modules.map((mod, mi) => (
          <div key={mod.id} className="glass-2" style={{ overflow: "hidden" }}>
            <button
              onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.25rem",
                background: "rgba(214,198,178,0.04)",
                border: "none",
                cursor: "pointer",
                color: "var(--color-beige-200)",
                fontSize: "0.95rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(201,110,77,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-orange-400)" }}>{mi + 1}</span>
                <span style={{ fontWeight: 500 }}>{mod.title}</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{mod.lessons.length} уроков</span>
            </button>

            {expandedModule === mod.id && (
              <div style={{ padding: "0.75rem 1.25rem 1.25rem", borderTop: "1px solid var(--glass-border)" }}>
                {/* Lessons list */}
                <div style={{ display: "grid", gap: "0.25rem", marginBottom: "0.75rem" }}>
                  {mod.lessons.map((lesson, li) => (
                    <div
                      key={lesson.id}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: 6, background: "rgba(214,198,178,0.02)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)", width: 20 }}>{li + 1}.</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--color-beige-200)" }}>{lesson.title}</span>
                        {lesson.isFree && <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 3, background: "rgba(201,110,77,0.1)", color: "var(--color-orange-400)" }}>Бесплатно</span>}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-disabled)" }}>{lesson.duration} мин</span>
                    </div>
                  ))}
                </div>

                {/* Add lesson button */}
                {addingLesson === mod.id ? (
                  <form onSubmit={(e) => addLesson(e, mod.id)} style={{ display: "grid", gap: "0.5rem", padding: "0.75rem", background: "rgba(214,198,178,0.03)", borderRadius: 8, border: "1px dashed var(--glass-border)" }}>
                    <input type="text" className="form-field" placeholder="Название урока *" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required style={{ fontSize: "0.85rem" }} />
                    <textarea className="form-field form-textarea" placeholder="Содержание урока" value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} rows={3} style={{ fontSize: "0.85rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input type="number" className="form-field" placeholder="Длительность (мин)" value={lessonDuration} onChange={(e) => setLessonDuration(parseInt(e.target.value) || 0)} style={{ width: 140, fontSize: "0.85rem" }} />
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--color-text-muted)", cursor: "pointer" }}>
                        <input type="checkbox" checked={lessonIsFree} onChange={(e) => setLessonIsFree(e.target.checked)} />
                        Бесплатный
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="submit" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>Добавить</button>
                      <button type="button" onClick={() => { setAddingLesson(null); setLessonTitle(""); setLessonContent(""); }} style={{ fontSize: "0.8rem", padding: "0.4rem 1rem", background: "transparent", border: "1px solid var(--glass-border)", borderRadius: 6, color: "var(--color-text-muted)", cursor: "pointer" }}>Отмена</button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingLesson(mod.id)}
                    style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", background: "none", border: "1px dashed var(--glass-border)", borderRadius: 6, padding: "0.4rem 0.75rem", cursor: "pointer", width: "100%", textAlign: "center" }}
                  >
                    + Добавить урок
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
