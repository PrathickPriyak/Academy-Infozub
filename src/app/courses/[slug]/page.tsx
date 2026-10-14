import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailView } from "@/components/courses/course-detail-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getCourseBySlug, listCourses } from "@/data/catalog";
import {
  courseFaqs,
  courseMeta,
  courseRequirements,
  courseReviews,
  learningOutcomesFromCourse,
} from "@/lib/courses/presenters";
import { formatPrice } from "@/lib/courses/present";
import { getShopifyPriceMap } from "@/lib/shopify/prices";
import { courseJsonLd, defaultOgImage } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  const image = { url: course.thumbnail, alt: course.title };
  return {
    title: course.title,
    description: course.shortDescription,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      url: `/courses/${course.slug}`,
      images: [image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.shortDescription,
      images: [course.thumbnail || defaultOgImage.url],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const base = getCourseBySlug(slug);
  if (!base) notFound();

  const priceMap = await getShopifyPriceMap();
  const live = priceMap[base.slug];
  const course = live ? { ...base, price: live.price } : base;

  const meta = courseMeta(course);
  const outcomes = learningOutcomesFromCourse(course);
  const requirements = courseRequirements(course);
  const faqs = courseFaqs(course);
  const reviews = courseReviews();
  const priceLabel = live ? formatPrice(live.price, live.currency) : meta.price;

  return (
    <>
      <CourseDetailView
        course={course}
        category={meta.category}
        price={priceLabel}
        level={meta.level}
        instructorName={meta.instructorName}
        instructorTitle={meta.instructorTitle}
        instructorBio={meta.instructorBio}
        outcomes={outcomes}
        requirements={requirements}
        faqs={faqs}
        reviews={reviews}
      />
      <JsonLd
        data={courseJsonLd(course, {
          category: meta.category,
          level: meta.level,
          faqs,
        })}
      />
    </>
  );
}
