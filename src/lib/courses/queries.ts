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
  if (!process.env.DATABASE_URL) {
    return listCatalogCoursesFallback();
  }

  try {
    const courses = await db.course.findMany({
      include: courseInclude,
      orderBy: { updatedAt: "desc" },
    });
    return courses.map(withLocalThumbnail);
  } catch (error) {
    console.error("Falling back to bundled catalog for admin list; database query failed.", error);
    return listCatalogCoursesFallback();
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseRecord | null> {
  if (!process.env.DATABASE_URL) {
    return listCatalogCoursesFallback().find((course) => course.slug === slug) ?? null;
  }

  try {
    const course = await db.course.findUnique({
      where: { slug },
      include: courseInclude,
    });
    return course ? withLocalThumbnail(course) : null;
  } catch (error) {
    console.error("Falling back to bundled catalog for course slug; database query failed.", error);
    return listCatalogCoursesFallback().find((course) => course.slug === slug) ?? null;
  }
}

export async function getCourseById(id: string): Promise<CourseRecord | null> {
  if (!process.env.DATABASE_URL) {
    return listCatalogCoursesFallback().find((course) => course.id === id) ?? null;
  }

  try {
    const course = await db.course.findUnique({
      where: { id },
      include: courseInclude,
    });
    return course ? withLocalThumbnail(course) : null;
  } catch (error) {
    console.error("Falling back to bundled catalog for course id; database query failed.", error);
    return listCatalogCoursesFallback().find((course) => course.id === id) ?? null;
  }
}

export async function listCategories() {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    return await db.category.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("Category list failed.", error);
    return [];
  }
}

export async function listInstructors() {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    return await db.instructor.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("Instructor list failed.", error);
    return [];
  }
}
