import type { CourseRecord } from "@/lib/courses/queries";
import { formatPrice } from "@/lib/courses/present";

import type { AiProvider, AssistantRequest } from "./types";

function findCourse(courses: CourseRecord[], text: string): CourseRecord | undefined {
  const normalized = text.toLowerCase();
  return courses.find((course) => {
    const title = course.title.toLowerCase();
    return (
      normalized.includes(title) ||
      normalized.includes(course.slug.replaceAll("-", " ")) ||
      (title.includes("full stack") && normalized.includes("full stack"))
    );
  });
}

function describeCourse(course: CourseRecord): string {
  const topics = course.modules
    .map(
      (module) =>
        `${module.title}: ${module.lessons.map((lesson) => lesson.title).join(", ")}`,
    )
    .join(" ");
  return `${course.title} is a ${course.category.name} program that runs for ${course.duration}. ${course.shortDescription} Price: ${formatPrice(course.price, course.currency)}. Instructor: ${course.instructor.name}. Topics: ${topics}. Enroll at ${course.enrollmentUrl}.`;
}

export function answerFromKnowledge(courses: CourseRecord[], question: string): string {
  const text = question.toLowerCase();
  const matched = findCourse(courses, text);

  if (text.includes("enroll") || text.includes("admission") || text.includes("join")) {
    if (matched) {
      return `Enroll in ${matched.title} at ${matched.enrollmentUrl}. The program runs for ${matched.duration} and costs ${formatPrice(matched.price, matched.currency)}.`;
    }
    const links = courses
      .map((course) => `${course.title}: ${course.enrollmentUrl}`)
      .join(" ");
    return `Choose a published Infozub course and open its enrollment link. ${links}`;
  }

  if (
    text.includes("what courses") ||
    text.includes("courses are available") ||
    text.includes("available courses") ||
    text.includes("which courses")
  ) {
    const list = courses
      .map(
        (course) => `${course.title} (${course.duration})`,
      )
      .join("; ");
    return `Infozub Digital Academy currently offers these published programs: ${list}.`;
  }

  if (text.includes("duration") || text.includes("how long") || text.includes("weeks")) {
    if (matched) {
      return `${matched.title} runs for ${matched.duration}.`;
    }
    return courses.map((course) => `${course.title}: ${course.duration}`).join("; ");
  }

  if (text.includes("topic") || text.includes("cover") || text.includes("curriculum")) {
    if (matched) {
      return describeCourse(matched);
    }
    return courses
      .map(
        (course) =>
          `${course.title} covers ${course.modules.map((module) => module.title).join(", ")}`,
      )
      .join(". ");
  }

  if (matched) {
    return describeCourse(matched);
  }

  return "I can answer only from published Infozub Digital Academy courses. Ask which courses are available, what a program covers, how long it runs, or how to enroll.";
}

export function createMockProvider(courses: CourseRecord[]): AiProvider {
  return {
    id: "mock-knowledge",
    name: "Infozub knowledge preview",
    async complete(request: AssistantRequest) {
      const latest = [...request.messages]
        .reverse()
        .find((message) => message.role === "user");
      const content = answerFromKnowledge(courses, latest?.content ?? "");
      await new Promise((resolve) => {
        setTimeout(resolve, 400);
      });
      return { content, providerId: "mock-knowledge" };
    },
  };
}
