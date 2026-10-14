import { CourseLevel } from "@prisma/client";
import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

const requiredText = (label: string, max = 2000) =>
  z.string().trim().min(2, `${label} is required.`).max(max);

export const courseInputSchema = z.object({
  title: requiredText("Title", 120),
  slug,
  description: requiredText("Description", 4000),
  shortDescription: requiredText("Short description", 280),
  thumbnail: z
    .string()
    .trim()
    .min(1, "Thumbnail is required.")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
      "Thumbnail must be a local path or a valid URL.",
    ),
  categoryId: z.string().trim().min(1, "Choose a category."),
  instructorId: z.string().trim().min(1, "Choose an instructor."),
  level: z.nativeEnum(CourseLevel),
  duration: requiredText("Duration", 80),
  price: z.coerce.number().int().min(0, "Price cannot be negative.").max(1_000_000),
  enrollmentUrl: z.string().trim().url("Enrollment URL must be a valid URL."),
  published: z.boolean(),
});

export const moduleInputSchema = z.object({
  courseId: z.string().trim().min(1),
  title: requiredText("Module title", 120),
  description: requiredText("Module description", 500),
});

export const lessonInputSchema = z.object({
  moduleId: z.string().trim().min(1),
  title: requiredText("Lesson title", 120),
  summary: requiredText("Lesson summary", 500),
  duration: requiredText("Lesson duration", 40),
});

export const faqInputSchema = z.object({
  courseId: z.string().trim().min(1),
  question: requiredText("Question", 200),
  answer: requiredText("Answer", 2000),
});

export const featureInputSchema = z.object({
  courseId: z.string().trim().min(1),
  title: requiredText("Feature title", 80),
  description: requiredText("Feature description", 280),
});

export const pricingSchema = z.object({
  courseId: z.string().trim().min(1),
  price: z.coerce.number().int().min(0).max(1_000_000),
});

export const durationSchema = z.object({
  courseId: z.string().trim().min(1),
  duration: requiredText("Duration", 80),
});

export type CourseInput = z.infer<typeof courseInputSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
