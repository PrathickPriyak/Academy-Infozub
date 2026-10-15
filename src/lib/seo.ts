import { catalog, formatCoursePrice, type CatalogCourse } from "@/data/catalog";
import { founder, site } from "@/data/site";
import type { CourseFaq } from "@/lib/courses/presenters";

export const defaultOgImage = {
  url: "/infozub-logo.png",
  width: 1200,
  height: 630,
  alt: `${site.name} logo`,
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${normalized === "/" ? "" : normalized}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/infozub-logo.png"),
    email: site.email,
    telephone: site.phone,
    description: site.description,
    slogan: site.tagline,
    sameAs: site.social.map((item) => item.href),
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: site.offices.registered.lines.slice(1).join(", "),
        addressLocality: "Palladam",
        postalCode: "641664",
        addressCountry: "IN",
        name: site.offices.registered.label,
      },
      {
        "@type": "PostalAddress",
        streetAddress: site.offices.corporate.lines.slice(1).join(", "),
        addressLocality: "Tiruppur",
        postalCode: "641602",
        addressCountry: "IN",
        name: site.offices.corporate.label,
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      telephone: site.phone,
      areaServed: "IN",
      availableLanguage: ["en", "ta"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/courses?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function courseJsonLd(
  course: CatalogCourse,
  options: { category: string; faqs: CourseFaq[] },
) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Course",
      "@id": absoluteUrl(`/courses/${course.slug}`),
      name: course.title,
      description: course.shortDescription,
      image: course.thumbnail,
      url: absoluteUrl(`/courses/${course.slug}`),
      provider: {
        "@type": "Organization",
        name: site.name,
        sameAs: site.url,
      },
      instructor: {
        "@type": "Person",
        name: catalog.instructor.name,
        jobTitle: catalog.instructor.title || founder.title,
      },
      timeRequired: course.duration,
      about: options.category,
      offers:
        course.price > 0
          ? {
              "@type": "Offer",
              price: course.price,
              priceCurrency: "INR",
              url: course.enrollmentUrl,
              availability: "https://schema.org/InStock",
              name: formatCoursePrice(course),
            }
          : {
              "@type": "Offer",
              url: course.enrollmentUrl,
              availability: "https://schema.org/InStock",
              description: "See course page for pricing",
            },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: site.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Courses",
          item: absoluteUrl("/courses"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: course.title,
          item: absoluteUrl(`/courses/${course.slug}`),
        },
      ],
    },
  ];

  if (options.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: options.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
