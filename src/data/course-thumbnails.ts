import catalog from "@/data/infozub-catalog.json";

const LOCAL_FALLBACK = "/infozub-mark.png";

const bySlug = new Map(catalog.courses.map((course) => [course.slug, course.thumbnail] as const));

/** True when the path is a same-origin `/public` asset (not a remote URL). */
export function isLocalImageSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  const value = src.trim();
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("wp-content")) return false;
  if (/^https?:/i.test(value)) return false;
  return true;
}

/**
 * Force every course image onto a bundled `/public` path for production.
 * Prefer the uploaded catalog thumbnail for the slug; never return remote academy media.
 */
export function localCourseThumbnail(slug: string, current?: string | null): string {
  const fromCatalog = bySlug.get(slug);
  if (fromCatalog && isLocalImageSrc(fromCatalog)) {
    return fromCatalog;
  }
  if (isLocalImageSrc(current)) {
    return current!.trim();
  }
  return LOCAL_FALLBACK;
}

/** Sanitize any marketing / gallery image src for production (local `/public` only). */
export function localImageSrc(src: string | null | undefined, fallback = LOCAL_FALLBACK): string {
  if (isLocalImageSrc(src)) {
    return src!.trim();
  }
  return fallback;
}

export function localGallery(images: readonly string[] | null | undefined): string[] {
  if (!images?.length) return [];
  return images.filter(isLocalImageSrc).map((src) => src.trim());
}
