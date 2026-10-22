import type { CatalogCategory, CatalogCourse } from "@/data/catalog";
import { localCourseThumbnail } from "@/data/course-thumbnails";

import type { CourseRecord } from "./queries";

/** Map a Prisma course record into the CatalogCourse shape used by public UI. */
export function courseRecordToCatalog(course: CourseRecord): CatalogCourse {
  return {
    category: course.category.slug,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnail: localCourseThumbnail(course.slug, course.thumbnail),
    level: course.level,
    duration: course.duration,
    price: course.price,
    enrollmentUrl: course.enrollmentUrl,
    gallery: [],
    modules: course.modules.map((module) => ({
      title: module.title,
      description: module.description,
    })),
  };
}

export function categoryRecordToCatalog(category: {
  name: string;
  slug: string;
  description: string;
}): CatalogCategory {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
  };
}
