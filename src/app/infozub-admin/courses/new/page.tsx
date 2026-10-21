import { redirect } from "next/navigation";

import { CourseForm } from "@/components/admin/course-form";
import { isAdminSignedIn } from "@/lib/admin-session";
import { listCategories, listInstructors } from "@/lib/courses/queries";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  if (!(await isAdminSignedIn())) {
    redirect("/infozub-admin/login");
  }

  const [categories, instructors] = await Promise.all([
    listCategories(),
    listInstructors(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl tracking-tight">Create course</h1>
      <div className="mt-6">
        <CourseForm categories={categories} instructors={instructors} />
      </div>
    </main>
  );
}
