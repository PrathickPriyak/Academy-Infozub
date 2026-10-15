import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CourseLevel, PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** Seed only writes local `/public` paths — never remote academy media. */
function localThumbnail(slug: string, thumbnail: string): string {
  const value = thumbnail.trim();
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("wp-content") && !/^https?:/i.test(value)) {
    return value;
  }
  console.warn(`Replacing non-local thumbnail for ${slug}: ${thumbnail}`);
  return "/infozub-mark.png";
}

type CatalogModule = { title: string; description: string };
type CatalogCourse = {
  category: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  level: "BEGINNER";
  duration: string;
  price: number;
  enrollmentUrl: string;
  modules: CatalogModule[];
};
type Catalog = {
  categories: { name: string; slug: string; description: string }[];
  instructor: { name: string; title: string; bio: string };
  courses: CatalogCourse[];
  platform: { title: string; content: string }[];
};

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
  {
    question: "Do you offer any income guarantee?",
    answer:
      "We give quality education and knowledge for everyone. No income promise (or) guarantees.",
  },
  {
    question: "Do you give all softwares, tools, platform-access, subscriptions?",
    answer:
      "No. Whatever mentioned in this course is the educational purpose only. We do not give any software, tools, platform-access, subscription access.",
  },
  {
    question: "After making payment, how long will it take to start learning?",
    answer:
      "You will receive access almost immediately after making the payment. Please check your email for access to LMS (Learning Management System). In very rare scenarios (like payment gateway issues), you have to wait up to 24 hours to receive access.",
  },
];

const seoFaqs = [
  {
    question: "How long is access to the SEO Master Course?",
    answer: "The course page lists 12 Months Access and 15+ Hours Content.",
  },
  {
    question: "Will I get a Course Certificate?",
    answer:
      "Upon successful completion of the program, you will be awarded a Course Completion Certificate from Infozub Digital Academy.",
  },
  {
    question: "What is the refund policy for the SEO Master Course?",
    answer:
      "Not satisfied with the course within 07 days of purchase? We offer a complete refund. No questions asked.",
  },
  {
    question: "Are course updates included?",
    answer:
      "You can enjoy free course updates for the next 12 months. The page says it will cover major changes during that period.",
  },
];

function faqsFor(course: CatalogCourse) {
  const items = course.slug === "search-engine-optimisation" ? seoFaqs : sharedFaqs;
  return items.map((item, index) => ({ ...item, position: index + 1 }));
}

async function main() {
  const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "infozub-catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;

  await db.customKnowledge.deleteMany();
  await db.course.deleteMany();
  await db.category.deleteMany();
  await db.instructor.deleteMany();

  const categories = new Map<string, string>();
  for (const category of catalog.categories) {
    const created = await db.category.create({ data: category });
    categories.set(category.slug, created.id);
  }

  const instructor = await db.instructor.create({ data: catalog.instructor });

  for (const course of catalog.courses) {
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
          create:
            course.slug === "search-engine-optimisation"
              ? [
                  {
                    title: "12 months access",
                    description: "The course page lists 12 Months Access and 15+ Hours Content.",
                  },
                  {
                    title: "Completion certificate",
                    description:
                      "A Course Completion Certificate from Infozub Digital Academy is awarded after successful completion.",
                  },
                ]
              : [
                  {
                    title: "Online self-paced videos",
                    description:
                      "100% online self-paced learning with pre-recorded video modules and life-time access.",
                  },
                  {
                    title: "Tamil instruction",
                    description: "Explained in Tamil with technical terms in English.",
                  },
                  {
                    title: "Digital certificate",
                    description:
                      "A digital certificate is issued once the entire course is completed.",
                  },
                ],
        },
        resources: {
          create: [
            {
              title: "Course page",
              url: course.enrollmentUrl,
              kind: "course",
            },
          ],
        },
        faqs: { create: faqsFor(course) },
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
  }

  for (const entry of catalog.platform) {
    await db.customKnowledge.create({ data: entry });
  }

  const published = await db.course.count({ where: { published: true } });
  console.log(`Seeded ${published} published Infozub courses.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
