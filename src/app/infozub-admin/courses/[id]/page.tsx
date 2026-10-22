import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CourseForm } from "@/components/admin/course-form";
import { InlineForm } from "@/components/admin/inline-form";
import { isAdminSignedIn } from "@/lib/admin-session";
import {
  addFaq,
  addFeature,
  addLesson,
  addModule,
  updateDuration,
  updatePricing,
} from "@/lib/courses/actions";
import { getCourseById, listCategories, listInstructors } from "@/lib/courses/queries";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminSignedIn())) {
    redirect("/infozub-admin/login");
  }

  const { id } = await params;
  const [course, categories, instructors] = await Promise.all([
    getCourseById(id),
    listCategories(),
    listInstructors(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-tight">Edit {course.title}</h1>
        <Link href="/infozub-admin" className="text-primary text-sm">
          Back to admin
        </Link>
      </div>
      <CourseForm categories={categories} instructors={instructors} course={course} />
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border-border rounded-2xl border p-4">
          <h2 className="font-semibold">Update pricing</h2>
          <div className="mt-3">
            <InlineForm
              action={updatePricing}
              submitLabel="Save price"
              hidden={{ courseId: course.id }}
              fields={[{ name: "price", label: "Price in INR", type: "number" }]}
            />
          </div>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <h2 className="font-semibold">Update duration</h2>
          <div className="mt-3">
            <InlineForm
              action={updateDuration}
              submitLabel="Save duration"
              hidden={{ courseId: course.id }}
              fields={[{ name: "duration", label: "Duration" }]}
            />
          </div>
        </div>
      </section>
      <section className="border-border rounded-2xl border p-4">
        <h2 className="font-semibold">Modules and lessons</h2>
        <div className="mt-4 grid gap-4">
          {course.modules.map((module) => (
            <div key={module.id} className="bg-muted rounded-xl p-3">
              <p className="font-medium">{module.title}</p>
              <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    {lesson.title} · {lesson.duration}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <InlineForm
                  action={addLesson}
                  submitLabel="Add lesson"
                  hidden={{ moduleId: module.id }}
                  fields={[
                    { name: "title", label: "Lesson title" },
                    { name: "summary", label: "Summary" },
                    { name: "duration", label: "Lesson duration" },
                  ]}
                />
              </div>
            </div>
          ))}
          <InlineForm
            action={addModule}
            submitLabel="Add module"
            hidden={{ courseId: course.id }}
            fields={[
              { name: "title", label: "Module title" },
              { name: "description", label: "Module description" },
            ]}
          />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border-border rounded-2xl border p-4">
          <h2 className="font-semibold">FAQs</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {course.faqs.map((faq) => (
              <li key={faq.id}>{faq.question}</li>
            ))}
          </ul>
          <div className="mt-3">
            <InlineForm
              action={addFaq}
              submitLabel="Add FAQ"
              hidden={{ courseId: course.id }}
              fields={[
                { name: "question", label: "Question" },
                { name: "answer", label: "Answer" },
              ]}
            />
          </div>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <h2 className="font-semibold">Features</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {course.features.map((feature) => (
              <li key={feature.id}>{feature.title}</li>
            ))}
          </ul>
          <div className="mt-3">
            <InlineForm
              action={addFeature}
              submitLabel="Add feature"
              hidden={{ courseId: course.id }}
              fields={[
                { name: "title", label: "Feature title" },
                { name: "description", label: "Feature description" },
              ]}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
