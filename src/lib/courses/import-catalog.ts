import { CourseLevel } from "@prisma/client";

import catalog from "@/data/infozub-catalog.json";
import { localCourseThumbnail } from "@/data/course-thumbnails";
import { db, hasDatabaseUrl } from "@/lib/db";

function localThumbnail(slug: string, thumbnail: string): string {
  return localCourseThumbnail(slug, thumbnail);
}

const sharedFaqs = [
  {
    question: "What is the duration of the Course?",
    answer:
      "This course is self-paced learning. So there are no time limitations. You will have life-time access.",
  },
  {
    question: "Is this an Online Course or Offline Course?",
    answer:
      "This course is 100% Online Self-Paced Learning Course with Pre-Recorded Video Modules.",
  },
  {
    question: "What is the course language?",
    answer: "This course is explained in Tamil with technical terms in English.",
  },
  {
    question: "Will I get a Course Certificate?",
    answer:
      "Yes, once you complete learning the entire course, you will receive a Digital Certificate.",
  },
];

function faqsFor() {
  return sharedFaqs.map((item, index) => ({ ...item, position: index + 1 }));
}

export interface ImportCatalogResult {
  ok: boolean;
  message: string;
  created: number;
  skipped: number;
}

/** Upsert categories/instructor and create any missing catalog courses (does not wipe demos). */
export async function importBundledCatalog(): Promise<ImportCatalogResult> {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      message: "Database is not connected.",
      created: 0,
      skipped: 0,
    };
  }

  const categories = new Map<string, string>();
  for (const category of catalog.categories) {
    const row = await db.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      update: {
        name: category.name,
        description: category.description,
      },
    });
    categories.set(category.slug, row.id);
  }

  let instructor = await db.instructor.findFirst({
    where: { name: catalog.instructor.name },
    orderBy: { createdAt: "asc" },
  });
  if (!instructor) {
    instructor = await db.instructor.create({ data: catalog.instructor });
  }

  // Remove duplicate instructors with the same name (keep oldest).
  const duplicates = await db.instructor.findMany({
    where: { name: catalog.instructor.name, NOT: { id: instructor.id } },
    select: { id: true },
  });
  for (const dup of duplicates) {
    await db.course.updateMany({
      where: { instructorId: dup.id },
      data: { instructorId: instructor.id },
    });
    await db.instructor.delete({ where: { id: dup.id } });
  }

  let created = 0;
  let skipped = 0;

  for (const course of catalog.courses) {
    const existing = await db.course.findUnique({ where: { slug: course.slug } });
    if (existing) {
      skipped += 1;
      continue;
    }
    const categoryId = categories.get(course.category);
    if (!categoryId) {
      throw new Error(`Unknown category ${course.category} for ${course.slug}`);
    }
    await db.course.create({
      data: {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        thumbnail: localThumbnail(course.slug, course.thumbnail),
        level: CourseLevel.BEGINNER,
        duration: course.duration,
        price: course.price,
        currency: "INR",
        enrollmentUrl: course.enrollmentUrl,
        published: true,
        categoryId,
        instructorId: instructor.id,
        features: {
          create: [
            {
              title: "Online self-paced videos",
              description:
                "100% online self-paced learning with pre-recorded video modules and life-time access.",
            },
          ],
        },
        resources: {
          create: [{ title: "Course page", url: course.enrollmentUrl, kind: "course" }],
        },
        faqs: { create: faqsFor() },
        modules: {
          create: course.modules.map((module, index) => ({
            title: module.title,
            description: module.description,
            position: index + 1,
            lessons: {
              create: [
                {
                  title: module.title,
                  summary: module.description,
                  duration: course.duration,
                  position: 1,
                },
              ],
            },
          })),
        },
      },
    });
    created += 1;
  }

  return {
    ok: true,
    message: `Imported ${created} courses (${skipped} already present).`,
    created,
    skipped,
  };
}
