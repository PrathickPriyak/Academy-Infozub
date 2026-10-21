import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogClient } from "@/components/courses/catalog-client";
import { JsonLd } from "@/components/seo/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/data/site";
import { listPublicCategories, listPublicCourses } from "@/lib/courses/public-catalog";
import { absoluteUrl, defaultOgImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [courses, categories] = await Promise.all([
    listPublicCourses(),
    listPublicCategories(),
  ]);
  const categoryNames = categories.map((category) => category.name).join(", ");
  const description = `Browse ${courses.length} published ${site.name} courses across ${categories.length} categories: ${categoryNames}. Search by skill, instructor, and topic.`;
  return {
    title: "Courses",
    description,
    alternates: { canonical: "/courses" },
    openGraph: {
      title: `Courses · ${site.name}`,
      description,
      url: absoluteUrl("/courses"),
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `Courses · ${site.name}`,
      description,
      images: [defaultOgImage.url],
    },
  };
}

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([
    listPublicCourses(),
    listPublicCategories(),
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} courses`,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/courses/${course.slug}`),
      name: course.title,
    })),
  };

  return (
    <>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="mt-6 h-11 w-full" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <CatalogClient initialCourses={courses} initialCategories={categories} />
      </Suspense>
      <JsonLd data={itemList} />
    </>
  );
}
