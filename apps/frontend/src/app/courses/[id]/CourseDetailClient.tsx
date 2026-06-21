"use client";
import { useState } from "react";
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

export default function CourseDetailClient({ modules }: { modules: Module[] }) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules[0]?.id ? [modules[0].id] : [])
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
      {modules.map((mod, idx) => (
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
                  transform: expandedModules.has(mod.id) ? "rotate(180deg)" : "none",
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
  );
}
