import catalogJson from "@/data/infozub-catalog.json";

export type CatalogCategory = (typeof catalogJson.categories)[number];
export type CatalogCourse = (typeof catalogJson.courses)[number];
export type CatalogModule = CatalogCourse["modules"][number];
export type PlatformKnowledge = (typeof catalogJson.platform)[number];

export const catalog = catalogJson;

export function listPlatformKnowledge(): PlatformKnowledge[] {
  return catalog.platform;
}

export function listCategories(): CatalogCategory[] {
  return catalog.categories;
}

export function listCourses(): CatalogCourse[] {
  return [...catalog.courses].sort((a, b) => a.title.localeCompare(b.title));
}

export function getCourseBySlug(slug: string): CatalogCourse | undefined {
  return catalog.courses.find((course) => course.slug === slug);
}

export function getCategoryBySlug(slug: string): CatalogCategory | undefined {
  return catalog.categories.find((category) => category.slug === slug);
}

export function categoryNameForCourse(course: CatalogCourse): string {
  return getCategoryBySlug(course.category)?.name ?? course.category;
}

export function formatCoursePrice(course: CatalogCourse): string {
  if (course.price > 0) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(course.price);
  }
  return "On request";
}

export function levelLabel(level: string): string {
  if (level === "BEGINNER") return "Beginner";
  if (level === "INTERMEDIATE") return "Intermediate";
  if (level === "ADVANCED") return "Advanced";
  return level;
}

/** Short labels for filters and card meta — values stay the published duration strings. */
export function durationLabel(duration: string): string {
  const value = duration.toLowerCase();
  if (value.includes("lifetime")) return "Lifetime access";
  if (value.includes("12 months") || value.includes("15+")) return "12 months access";
  if (value.length > 28) return `${duration.slice(0, 26).trim()}…`;
  return duration;
}

export function listLevels(): string[] {
  return [...new Set(listCourses().map((course) => course.level))].sort();
}

export function listDurations(): string[] {
  return [...new Set(listCourses().map((course) => course.duration))].sort((a, b) => a.localeCompare(b));
}

export function listInstructors(): string[] {
  return [catalog.instructor.name];
}

export type PriceFilter = "all" | "priced" | "request";

export type SearchHit =
  | { kind: "course"; course: CatalogCourse; label: string; href: string }
  | { kind: "category"; category: CatalogCategory; label: string; href: string };

function courseHaystack(course: CatalogCourse): string {
  return [
    course.title,
    course.shortDescription,
    course.description,
    categoryNameForCourse(course),
    course.category,
    catalog.instructor.name,
    catalog.instructor.title,
    course.level,
    course.duration,
    ...course.modules.map((module) => `${module.title} ${module.description}`),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchCatalog(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const courseHits: SearchHit[] = listCourses()
    .filter((course) => courseHaystack(course).includes(q))
    .slice(0, limit)
    .map((course) => ({
      kind: "course" as const,
      course,
      label: course.title,
      href: `/courses/${course.slug}`,
    }));

  const categoryHits: SearchHit[] = listCategories()
    .filter((category) => {
      const haystack = `${category.name} ${category.description}`.toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 4)
    .map((category) => ({
      kind: "category" as const,
      category,
      label: category.name,
      href: `/courses?category=${category.slug}`,
    }));

  return [...categoryHits, ...courseHits].slice(0, limit);
}

/**
 * Sort options backed by published catalog fields.
 * Rating / newest are omitted — those fields are not in the archived catalog.
 * "popular" ranks courses with published prices first, then by module count
 * (curriculum depth), since enrollment popularity metrics are not published.
 */
export type CourseSort = "popular" | "title" | "price-asc" | "price-desc" | "modules";

export function filterCourses(options: {
  query?: string;
  category?: string;
  level?: string;
  price?: PriceFilter;
  duration?: string;
  instructor?: string;
  sort?: CourseSort;
  /** Optional pre-priced course list (e.g. Shopify overlays). */
  courses?: CatalogCourse[];
}): CatalogCourse[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  let results = (options.courses ?? listCourses()).filter((course) => {
    if (options.category && options.category !== "all" && course.category !== options.category) {
      return false;
    }
    if (options.level && options.level !== "all" && course.level !== options.level) {
      return false;
    }
    if (options.duration && options.duration !== "all" && course.duration !== options.duration) {
      return false;
    }
    if (options.instructor && options.instructor !== "all" && catalog.instructor.name !== options.instructor) {
      return false;
    }
    if (options.price === "priced" && course.price <= 0) {
      return false;
    }
    if (options.price === "request" && course.price > 0) {
      return false;
    }
    if (!query) return true;
    return courseHaystack(course).includes(query);
  });

  const sort = options.sort ?? "popular";
  if (sort === "price-asc") {
    results = [...results].sort((a, b) => {
      const ap = a.price > 0 ? a.price : Number.POSITIVE_INFINITY;
      const bp = b.price > 0 ? b.price : Number.POSITIVE_INFINITY;
      return ap - bp || a.title.localeCompare(b.title);
    });
  } else if (sort === "price-desc") {
    results = [...results].sort((a, b) => b.price - a.price || a.title.localeCompare(b.title));
  } else if (sort === "modules") {
    results = [...results].sort(
      (a, b) => b.modules.length - a.modules.length || a.title.localeCompare(b.title),
    );
  } else if (sort === "title") {
    results = [...results].sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // popular
    results = [...results].sort((a, b) => {
      const priceRank = Number(b.price > 0) - Number(a.price > 0);
      if (priceRank !== 0) return priceRank;
      return b.modules.length - a.modules.length || a.title.localeCompare(b.title);
    });
  }

  return results;
}

export function countActiveFilters(options: {
  query?: string;
  category?: string;
  level?: string;
  price?: string;
  duration?: string;
  instructor?: string;
}): number {
  let count = 0;
  if (options.query?.trim()) count += 1;
  if (options.category && options.category !== "all") count += 1;
  if (options.level && options.level !== "all") count += 1;
  if (options.price && options.price !== "all") count += 1;
  if (options.duration && options.duration !== "all") count += 1;
  if (options.instructor && options.instructor !== "all") count += 1;
  return count;
}
