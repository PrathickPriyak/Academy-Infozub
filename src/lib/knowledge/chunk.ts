import type { CourseRecord } from "@/lib/courses/queries";
import { formatPrice } from "@/lib/courses/present";

export interface KnowledgeDocument {
  courseId: string | null;
  customKnowledgeId: string | null;
  sourceType: string;
  title: string;
  content: string;
}

export function chunkCourse(course: CourseRecord): KnowledgeDocument[] {
  const documents: KnowledgeDocument[] = [
    {
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "description",
      title: `${course.title} description`,
      content: `Infozub course offered: ${course.title}. Category: ${course.category.name}. Short description: ${course.shortDescription} Description: ${course.description}`,
    },
    {
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "pricing",
      title: `${course.title} price`,
      content:
        course.price > 0
          ? `Price of ${course.title}: ${course.price} ${course.currency} (${formatPrice(course.price, course.currency)}).`
          : `Price of ${course.title}: the published course page does not list a numeric price. Use the enrollment page ${course.enrollmentUrl}.`,
    },
    {
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "duration",
      title: `${course.title} duration`,
      content: `Duration of ${course.title}: ${course.duration}.`,
    },
    {
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "instructor",
      title: `${course.title} instructor`,
      content: `Instructor for ${course.title}: ${course.instructor.name}, ${course.instructor.title}. ${course.instructor.bio}`,
    },
    {
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "enrollment",
      title: `${course.title} enrollment`,
      content: `Enrollment for ${course.title}: ${course.enrollmentUrl}.`,
    },
  ];

  if (course.features.length > 0) {
    documents.push({
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "features",
      title: `${course.title} features`,
      content: `Features of ${course.title}: ${course.features
        .map((feature) => `${feature.title}. ${feature.description}`)
        .join(" ")}`,
    });
  }

  for (const faq of course.faqs) {
    documents.push({
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "faq",
      title: `${course.title} FAQ`,
      content: `FAQ for ${course.title}. Question: ${faq.question} Answer: ${faq.answer}`,
    });
  }

  for (const courseModule of course.modules) {
    const lessons = courseModule.lessons
      .map((lesson) => `${lesson.title}: ${lesson.summary}`)
      .join(" ");
    documents.push({
      courseId: course.id,
      customKnowledgeId: null,
      sourceType: "curriculum",
      title: `${course.title} ${courseModule.title}`,
      content: `Curriculum topics covered in ${course.title}, module ${courseModule.title}. ${courseModule.description} Lessons: ${lessons}`,
    });
  }

  return documents;
}

export function chunkCustom(entry: {
  id: string;
  title: string;
  content: string;
}): KnowledgeDocument {
  return {
    courseId: null,
    customKnowledgeId: entry.id,
    sourceType: "custom",
    title: entry.title,
    content: entry.content,
  };
}

export function chunkCatalog(courses: CourseRecord[]): KnowledgeDocument[] {
  const first = courses[0];
  if (!first) {
    return [];
  }
  const list = courses.map((course) => course.title).join("; ");
  return [
    {
      courseId: first.id,
      customKnowledgeId: null,
      sourceType: "catalog",
      title: "Published Infozub courses",
      content: `Infozub offers ${courses.length} courses: ${list}.`,
    },
  ];
}
