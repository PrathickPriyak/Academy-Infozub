import type { Prisma } from "@prisma/client";

import { localCourseThumbnail } from "@/data/course-thumbnails";
import { db } from "@/lib/db";

import { listCatalogCoursesFallback } from "./catalog-fallback";
import { courseInclude } from "./present";

export type CourseRecord = Prisma.CourseGetPayload<{ include: typeof courseInclude }>;

function withLocalThumbnail(course: CourseRecord): CourseRecord {
  return {
    ...course,
    thumbnail: localCourseThumbnail(course.slug, course.thumbnail),
  };
}

export async function listPublishedCourses(): Promise<CourseRecord[]> {
  if (!process.env.DATABASE_URL) {
    return listCatalogCoursesFallback();
  }

  try {
    const courses = await db.course.findMany({
      where: { published: true },
      include: courseInclude,
      orderBy: { title: "asc" },
    });
    return courses.map(withLocalThumbnail);
  } catch (error) {
    console.error("Falling back to bundled catalog; database query failed.", error);
    return listCatalogCoursesFallback();
  }
}

export async function listAllCourses(): Promise<CourseRecord[]> {
  const courses = await db.course.findMany({
    include: courseInclude,
    orderBy: { updatedAt: "desc" },
  });
  return courses.map(withLocalThumbnail);
}

export async function getCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const course = await db.course.findUnique({
    where: { slug },
    include: courseInclude,
  });
  return course ? withLocalThumbnail(course) : null;
}

export async function getCourseById(id: string): Promise<CourseRecord | null> {
  const course = await db.course.findUnique({
    where: { id },
    include: courseInclude,
  });
  return course ? withLocalThumbnail(course) : null;
}

export async function listCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function listInstructors() {
  return db.instructor.findMany({ orderBy: { name: "asc" } });
}
