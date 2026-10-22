import type { Metadata } from "next";
import nextDynamic from "next/dynamic";

import { AudienceGrid } from "@/components/marketing/audience-grid";
import { HomeHero } from "@/components/marketing/home-hero";
import { PopularCourses } from "@/components/marketing/popular-courses";
import { WhyInfozub } from "@/components/marketing/why-infozub";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/data/site";
import { listPublicCategories, listPublicCourses } from "@/lib/courses/public-catalog";
import { defaultOgImage, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const Testimonials = nextDynamic(() =>
  import("@/components/marketing/testimonials").then((mod) => ({
    default: mod.Testimonials,
  })),
);
const FinalCta = nextDynamic(() =>
  import("@/components/marketing/final-cta").then((mod) => ({
    default: mod.FinalCta,
  })),
);

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const courses = await listPublicCourses();
  const title = `${site.name} · ${site.tagline}`;
  const description = `${site.description} Browse ${courses.length} published courses.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: site.url,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage.url],
    },
  };
}

export default async function HomePage() {
  const [courses, categories] = await Promise.all([
    listPublicCourses(),
    listPublicCategories(),
  ]);

  return (
    <>
      <HomeHero />
      <PopularCourses courses={courses} categories={categories} />
      <WhyInfozub />
      <AudienceGrid />
      <Testimonials />
      <FinalCta />
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
    </>
  );
}
