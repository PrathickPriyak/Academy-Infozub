import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AudienceGrid } from "@/components/marketing/audience-grid";
import { HomeHero } from "@/components/marketing/home-hero";
import { PopularCourses } from "@/components/marketing/popular-courses";
import { WhyInfozub } from "@/components/marketing/why-infozub";
import { JsonLd } from "@/components/seo/json-ld";
import { listCourses } from "@/data/catalog";
import { site } from "@/data/site";
import { defaultOgImage, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const Testimonials = dynamic(() =>
  import("@/components/marketing/testimonials").then((mod) => ({
    default: mod.Testimonials,
  })),
);
const FinalCta = dynamic(() =>
  import("@/components/marketing/final-cta").then((mod) => ({
    default: mod.FinalCta,
  })),
);

const title = `${site.name} · ${site.tagline}`;
const description = `${site.description} Browse ${listCourses().length} published courses.`;

export const metadata: Metadata = {
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

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PopularCourses />
      <WhyInfozub />
      <AudienceGrid />
      <Testimonials />
      <FinalCta />
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
    </>
  );
}
