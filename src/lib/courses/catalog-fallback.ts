import type { CourseLevel } from "@prisma/client";

import catalog from "@/data/infozub-catalog.json";
import { localCourseThumbnail } from "@/data/course-thumbnails";

import type { CourseRecord } from "./queries";

type CatalogCourse = (typeof catalog.courses)[number];

function asLevel(level: string): CourseLevel {
  if (level === "INTERMEDIATE" || level === "ADVANCED" || level === "BEGINNER") {
    return level;
  }
  return "BEGINNER";
}

function toCourseRecord(course: CatalogCourse): CourseRecord {
  const category =
    catalog.categories.find((entry) => entry.slug === course.category) ??
    catalog.categories[0]!;
  const now = new Date(0);

  return {
    id: `catalog-${course.slug}`,
    slug: course.slug,
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnail: localCourseThumbnail(course.slug, course.thumbnail),
    level: asLevel(course.level),
    duration: course.duration,
    price: course.price,
    currency: "INR",
    enrollmentUrl: course.enrollmentUrl,
    published: true,
    categoryId: `catalog-category-${category.slug}`,
    instructorId: "catalog-instructor",
    createdAt: now,
    updatedAt: now,
    category: {
      id: `catalog-category-${category.slug}`,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: now,
      updatedAt: now,
    },
    instructor: {
      id: "catalog-instructor",
      name: catalog.instructor.name,
      title: catalog.instructor.title,
      bio: catalog.instructor.bio,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    },
    features: [],
    resources: [],
    faqs: [],
    modules: course.modules.map((module, moduleIndex) => ({
      id: `catalog-module-${course.slug}-${moduleIndex + 1}`,
      courseId: `catalog-${course.slug}`,
      title: module.title,
      description: module.description,
      position: moduleIndex + 1,
      createdAt: now,
      updatedAt: now,
      lessons: [],
    })),
  };
}

/** Published catalog when Postgres is unavailable (for example, first Vercel deploy). */
export function listCatalogCoursesFallback(): CourseRecord[] {
  return catalog.courses
    .map((course) => toCourseRecord(course))
    .sort((left, right) => left.title.localeCompare(right.title));
}
