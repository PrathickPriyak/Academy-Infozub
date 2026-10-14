import catalog from "@/data/infozub-catalog.json";

const LOCAL_FALLBACK = "/infozub-mark.png";

const bySlug = new Map(catalog.courses.map((course) => [course.slug, course.thumbnail] as const));

/** Prefer bundled local thumbnails over remote academy.infozub.com media. */
export function localCourseThumbnail(slug: string, current?: string | null): string {
  const local = bySlug.get(slug);
  if (local) return local;
  if (current?.startsWith("/") && !current.includes("wp-content")) {
    return current;
  }
  return LOCAL_FALLBACK;
}
