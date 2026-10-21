import {
  getCategoryBySlug as getStaticCategory,
  getCourseBySlug as getStaticCourse,
  listCategories as listStaticCategories,
  listCourses as listStaticCourses,
  type CatalogCategory,
  type CatalogCourse,
} from "@/data/catalog";
import { hasDatabaseUrl } from "@/lib/db";

import { db } from "@/lib/db";

import { ensureAdminTaxonomy } from "./ensure-taxonomy";
import { getCourseBySlug as getDbCourseBySlug, listPublishedCourses } from "./queries";
import { categoryRecordToCatalog, courseRecordToCatalog } from "./to-catalog";

/** Published courses for the public site — live Neon data when connected. */
export async function listPublicCourses(): Promise<CatalogCourse[]> {
  if (!hasDatabaseUrl()) {
    return listStaticCourses();
  }
  try {
    const courses = await listPublishedCourses();
    if (courses.length === 0) {
      return listStaticCourses();
    }
    return courses.map(courseRecordToCatalog);
  } catch (error) {
    console.error("listPublicCourses failed; using bundled catalog.", error);
    return listStaticCourses();
  }
}

export async function listPublicCategories(): Promise<CatalogCategory[]> {
  if (!hasDatabaseUrl()) {
    return listStaticCategories();
  }
  try {
    await ensureAdminTaxonomy();
    const rows = await db.category.findMany({ orderBy: { name: "asc" } });
    if (rows.length === 0) {
      return listStaticCategories();
    }
    return rows.map(categoryRecordToCatalog);
  } catch (error) {
    console.error("listPublicCategories failed; using bundled categories.", error);
    return listStaticCategories();
  }
}

export async function getPublicCourseBySlug(slug: string): Promise<CatalogCourse | undefined> {
  if (!hasDatabaseUrl()) {
    return getStaticCourse(slug);
  }
  try {
    const course = await getDbCourseBySlug(slug);
    if (course?.published) {
      return courseRecordToCatalog(course);
    }
    // If Neon has no published courses yet, keep the bundled catalog available.
    const published = await listPublishedCourses();
    if (published.length === 0) {
      return getStaticCourse(slug);
    }
    return undefined;
  } catch (error) {
    console.error("getPublicCourseBySlug failed; using bundled catalog.", error);
    return getStaticCourse(slug);
  }
}

export async function getPublicCategoryBySlug(slug: string): Promise<CatalogCategory | undefined> {
  const categories = await listPublicCategories();
  return categories.find((category) => category.slug === slug) ?? getStaticCategory(slug);
}
