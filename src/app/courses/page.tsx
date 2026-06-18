import { Metadata } from "next";
import Header from "@/components/Header";
import CoursesListClient from "./CoursesListClient";

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || "http://localhost:3001";

async function payloadApi(path: string) {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api${path}`, { cache: 'no-store' });
    if (!res.ok) return { docs: [] };
    return res.json();
  } catch {
    return { docs: [] };
  }
}

export const metadata: Metadata = {
  title: "Каталог курсов | Школа ПК",
  description: "Выберите курс и начните обучение прямо сейчас",
};

export default async function CoursesPage() {
  // Fetch courses
  const coursesData = await payloadApi("/courses?where[isPublished][equals]=true&sort=order&depth=1&limit=100");
  
  // Fetch modules and lessons to compute counts
  const [modulesData, lessonsData] = await Promise.all([
    payloadApi("/modules?limit=200&depth=0"),
    payloadApi("/lessons?limit=500&depth=0"),
  ]);

  const modules = modulesData.docs || [];
  const lessons = lessonsData.docs || [];

  const courses = (coursesData.docs || []).map((course: any) => {
    const courseModules = modules.filter((m: any) => 
      m.course && (m.course.id === course.id || m.course === course.id)
    );
    const courseModuleIds = courseModules.map((m: any) => m.id);
    const courseLessons = lessons.filter((l: any) => 
      l.module && (courseModuleIds.includes(l.module.id || l.module) || courseModuleIds.includes(l.module))
    );
    const freeLessons = courseLessons.filter((l: any) => l.isFree);

    return {
      id: String(course.id),
      title: course.title,
      slug: course.slug || '',
      description: course.description || '',
      shortDesc: course.shortDesc || null,
      icon: course.icon || null,
      price: course.price || null,
      order: course.order || 0,
      modulesCount: courseModules.length,
      lessonsCount: courseLessons.length,
      freeLessonsCount: freeLessons.length,
    };
  });

  return (
    <>
      <Header />
      <CoursesListClient courses={courses} />
    </>
  );
}
