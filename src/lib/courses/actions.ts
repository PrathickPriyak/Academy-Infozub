"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { requireAdmin } from "@/lib/admin-session";
import { db, hasDatabaseUrl } from "@/lib/db";

import {
  courseInputSchema,
  durationSchema,
  faqInputSchema,
  featureInputSchema,
  fieldErrors,
  lessonInputSchema,
  moduleInputSchema,
  pricingSchema,
} from "./validation";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

function fail(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, fieldErrors: errors };
}

function refresh(courseId?: string) {
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin");
  revalidatePath("/admin/knowledge");
  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
  }
}

export async function saveCourse(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (!hasDatabaseUrl()) {
    return fail(
      "Database is not connected. Add DATABASE_URL in Vercel (Neon), redeploy, then try again.",
    );
  }

  const parsed = courseInputSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    thumbnail: formData.get("thumbnail"),
    categoryId: formData.get("categoryId"),
    instructorId: formData.get("instructorId"),
    level: formData.get("level"),
    duration: formData.get("duration"),
    price: formData.get("price"),
    enrollmentUrl: formData.get("enrollmentUrl"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return fail("Check the course fields.", fieldErrors(parsed.error));
  }

  if (
    parsed.data.categoryId.startsWith("catalog-") ||
    parsed.data.instructorId.startsWith("catalog-")
  ) {
    return fail(
      "Category/instructor are still in demo mode. Refresh this page after the database is connected, then create again.",
    );
  }

  const id = String(formData.get("id") ?? "");
  const data = parsed.data;
  try {
    if (id) {
      await db.course.update({ where: { id }, data });
      refresh(id);
      return { ok: true, message: "Course updated." };
    }
    const created = await db.course.create({ data });
    refresh(created.id);
    redirect(`/admin/courses/${created.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return fail("A course with that slug already exists. Change the slug and try again.");
      }
      if (error.code === "P2003") {
        return fail("Choose a valid Category and Instructor from the lists, then try again.");
      }
    }
    console.error("saveCourse failed.", error);
    return fail("Could not save the course. Check the fields and database connection.");
  }
}

export async function deleteCourse(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Course id is required.");
  }
  await db.course.delete({ where: { id } });
  refresh();
  redirect("/admin");
}

export async function setPublished(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  await db.course.update({ where: { id }, data: { published } });
  refresh(id);
}

export async function updatePricing(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = pricingSchema.safeParse({
    courseId: formData.get("courseId"),
    price: formData.get("price"),
  });
  if (!parsed.success) {
    return fail("Enter a valid price.", fieldErrors(parsed.error));
  }
  await db.course.update({
    where: { id: parsed.data.courseId },
    data: { price: parsed.data.price },
  });
  refresh(parsed.data.courseId);
  return { ok: true, message: "Price updated." };
}

export async function updateDuration(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = durationSchema.safeParse({
    courseId: formData.get("courseId"),
    duration: formData.get("duration"),
  });
  if (!parsed.success) {
    return fail("Enter a duration.", fieldErrors(parsed.error));
  }
  await db.course.update({
    where: { id: parsed.data.courseId },
    data: { duration: parsed.data.duration },
  });
  refresh(parsed.data.courseId);
  return { ok: true, message: "Duration updated." };
}

export async function addModule(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = moduleInputSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return fail("Check the module fields.", fieldErrors(parsed.error));
  }
  const count = await db.module.count({ where: { courseId: parsed.data.courseId } });
  await db.module.create({
    data: { ...parsed.data, position: count + 1 },
  });
  refresh(parsed.data.courseId);
  return { ok: true, message: "Module added." };
}

export async function addLesson(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = lessonInputSchema.safeParse({
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    duration: formData.get("duration"),
  });
  if (!parsed.success) {
    return fail("Check the lesson fields.", fieldErrors(parsed.error));
  }
  const parentModule = await db.module.findUnique({
    where: { id: parsed.data.moduleId },
  });
  if (!parentModule) {
    return fail("Module not found.");
  }
  const count = await db.lesson.count({ where: { moduleId: parsed.data.moduleId } });
  await db.lesson.create({
    data: { ...parsed.data, position: count + 1 },
  });
  refresh(parentModule.courseId);
  return { ok: true, message: "Lesson added." };
}

export async function addFaq(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = faqInputSchema.safeParse({
    courseId: formData.get("courseId"),
    question: formData.get("question"),
    answer: formData.get("answer"),
  });
  if (!parsed.success) {
    return fail("Check the FAQ fields.", fieldErrors(parsed.error));
  }
  const count = await db.faq.count({ where: { courseId: parsed.data.courseId } });
  await db.faq.create({
    data: { ...parsed.data, position: count + 1 },
  });
  refresh(parsed.data.courseId);
  return { ok: true, message: "FAQ added." };
}

export async function addFeature(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = featureInputSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return fail("Check the feature fields.", fieldErrors(parsed.error));
  }
  await db.courseFeature.create({ data: parsed.data });
  refresh(parsed.data.courseId);
  return { ok: true, message: "Feature added." };
}
