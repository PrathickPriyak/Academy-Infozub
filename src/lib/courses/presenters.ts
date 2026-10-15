import {
  catalog,
  categoryNameForCourse,
  formatCoursePrice,
  listPlatformKnowledge,
  type CatalogCourse,
} from "@/data/catalog";
import { highlights, refundSummary, testimonials } from "@/data/site";

/** Learning outcomes derived from published module descriptions — not invented. */
export function learningOutcomesFromCourse(course: CatalogCourse): string[] {
  return course.modules
    .map((module) => {
      const text = module.description.trim();
      const sentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
      return sentence.replace(/\s+/g, " ").trim();
    })
    .filter(Boolean)
    .slice(0, 8);
}

export function courseRequirements(course: CatalogCourse): string[] {
  const items = [
    `Access: ${course.duration}.`,
    "Learning access is delivered through the courses.infozub.com platform after purchase.",
  ];

  const deviceHighlight = highlights.find((item) => item.toLowerCase().includes("device"));
  if (deviceHighlight) {
    items.push(deviceHighlight);
  }

  return items;
}

export type CourseFaq = { question: string; answer: string };

export function courseFaqs(course: CatalogCourse): CourseFaq[] {
  const platform = listPlatformKnowledge();
  const byTitle = (title: string) => platform.find((item) => item.title === title)?.content;

  const faqs: CourseFaq[] = [
    {
      question: `What is included in ${course.title}?`,
      answer: `${course.shortDescription} The published curriculum has ${course.modules.length} modules. Price shown on this site: ${formatCoursePrice(course)}.`,
    },
    {
      question: "How do I access the course after purchase?",
      answer:
        byTitle("Start a purchased course") ??
        "After purchase or an access code, the course appears in My Courses on courses.infozub.com.",
    },
    {
      question: "How do I create a learning account?",
      answer: byTitle("Create an account") ?? "Open courses.infozub.com, choose Login/Register, then Sign Up.",
    },
    {
      question: "What is the refund policy?",
      answer: byTitle("Academy refund policy") ?? refundSummary.body,
    },
    {
      question: "Who teaches this course?",
      answer: `${catalog.instructor.name}, ${catalog.instructor.title}. ${catalog.instructor.bio}`,
    },
    {
      question: "How can I contact Infozub?",
      answer: byTitle("Phone contact") ?? byTitle("Academy contact") ?? "Email academy@infozub.com.",
    },
  ];

  return faqs.filter((faq) => faq.answer.trim().length > 0);
}

export function courseReviews() {
  return testimonials;
}

export function courseMeta(course: CatalogCourse) {
  return {
    category: categoryNameForCourse(course),
    price: formatCoursePrice(course),
    instructorName: catalog.instructor.name,
    instructorTitle: catalog.instructor.title,
    instructorBio: catalog.instructor.bio,
  };
}
