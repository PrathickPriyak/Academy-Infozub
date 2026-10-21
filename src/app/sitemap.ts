import type { MetadataRoute } from "next";

import { site } from "@/data/site";
import { listPublicCourses } from "@/lib/courses/public-catalog";

/** Stable lastModified — avoid rewriting every build with Date.now(). */
const CATALOG_UPDATED = new Date("2024-06-17T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await listPublicCourses();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: CATALOG_UPDATED, changeFrequency: "weekly", priority: 1 },
    {
      url: `${site.url}/courses`,
      lastModified: CATALOG_UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site.url}/about`,
      lastModified: CATALOG_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/contact`,
      lastModified: CATALOG_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: CATALOG_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/terms`,
      lastModified: CATALOG_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/refund`,
      lastModified: CATALOG_UPDATED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const courseRoutes = courses.map((course) => ({
    url: `${site.url}/courses/${course.slug}`,
    lastModified: CATALOG_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
