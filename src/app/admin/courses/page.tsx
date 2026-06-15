"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  order: number;
  isFree: boolean;
  duration: number;
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New course form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newShort, setNewShort] = useState("");
  const [newIcon, setNewIcon] = useState("🎓");
  const [newPublished, setNewPublished] = useState(false);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin/courses", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Fetch courses error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, description: newDesc, shortDesc: newShort, icon: newIcon, isPublished: newPublished, order: courses.length + 1 }),
      });
      if (res.ok) {
        setShowNewForm(false);
        setNewTitle(""); setNewDesc(""); setNewShort(""); setNewIcon("🎓"); setNewPublished(false);
        fetchCourses();
      }
    } catch (err) {
      console.error("Create course error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить курс? Это действие необратимо.")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (course: Course) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      fetchCourses();
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  if (loading) return <div style={{ padding: "3rem", color: "var(--color-beige-300)" }}>Загрузка курсов...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-beige-200)" }}>Управление курсами</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{courses.length} курсов в системе</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="btn-primary"
          style={{ fontSize: "0.85rem", padding: "0.6rem 1.5rem" }}
        >
          {showNewForm ? "Отмена" : "+ Новый курс"}
        </button>
      </div>

      {/* New course form */}
      {showNewForm && (
        <form onSubmit={handleCreate} className="glass-2" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <div style={{ fontWeight: 600, color: "var(--color-beige-200)", marginBottom: "0.5rem" }}>Создать курс</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <input type="text" className="form-field" placeholder="Название курса *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="text" className="form-field" placeholder="Иконка" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} style={{ width: 80 }} />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" checked={newPublished} onChange={(e) => setNewPublished(e.target.checked)} />
                Опубликован
              </label>
            </div>
          </div>
          <textarea className="form-field form-textarea" placeholder="Описание курса *" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required rows={3} />
          <input type="text" className="form-field" placeholder="Краткое описание" value={newShort} onChange={(e) => setNewShort(e.target.value)} />
          <button type="submit" className="btn-primary" style={{ justifySelf: "start" }}>Создать курс</button>
        </form>
      )}

      {/* Courses list */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {courses.map((course) => {
          const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
          return (
            <div key={course.id} className="glass-2" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(201,110,77,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                    {course.icon || "📖"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 600, color: "var(--color-beige-200)", fontSize: "1rem" }}>{course.title}</span>
                      <button
                        onClick={() => togglePublish(course)}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.5rem",
                          borderRadius: 4,
                          border: "none",
                          cursor: "pointer",
                          background: course.isPublished ? "rgba(76,154,122,0.15)" : "rgba(201,110,77,0.1)",
                          color: course.isPublished ? "var(--color-green-400)" : "var(--color-orange-400)",
                        }}
                      >
                        {course.isPublished ? "Опубликован" : "Черновик"}
                      </button>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      {course.modules.length} модулей · {totalLessons} уроков · {course._count.enrollments} записей
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", borderRadius: 6, background: "rgba(214,198,178,0.06)", border: "1px solid var(--glass-border)", color: "var(--color-beige-200)", textDecoration: "none" }}
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    disabled={deleting === course.id}
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", borderRadius: 6, background: "rgba(168,85,56,0.1)", border: "1px solid rgba(168,85,56,0.2)", color: "var(--color-orange-600)", cursor: "pointer" }}
                  >
                    {deleting === course.id ? "..." : "Удалить"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
