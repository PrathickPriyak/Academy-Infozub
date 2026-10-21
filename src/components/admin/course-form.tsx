"use client";

import type { Category, CourseLevel, Instructor } from "@prisma/client";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCourse, type ActionState } from "@/lib/courses/actions";

const initial: ActionState = { ok: false, message: "" };

function demoDefaults() {
  const stamp = Date.now().toString(36);
  return {
    title: "Demo Design Crash Course",
    slug: `demo-design-crash-course-${stamp}`,
    shortDescription: "A short demo course used to verify admin create works end to end.",
    description:
      "This is demo content for testing the Create course form. Replace the title, description, price, and enrollment URL with your real course details before publishing.",
    thumbnail: "/course-thumbnails/my-course.webp",
    duration: "Self-paced, lifetime access",
    price: 999,
    enrollmentUrl: "https://academy.infozub.com/course/tamil/adobe-photoshop/",
  };
}

export function CourseForm({
  categories,
  instructors,
  course,
}: {
  categories: Category[];
  instructors: Instructor[];
  course?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    categoryId: string;
    instructorId: string;
    level: CourseLevel;
    duration: string;
    price: number;
    enrollmentUrl: string;
    published: boolean;
  };
}) {
  const [state, action, pending] = useActionState(saveCourse, initial);
  const demo = course ? null : demoDefaults();
  const defaultCategoryId = course?.categoryId ?? categories[0]?.id ?? "";
  const defaultInstructorId = course?.instructorId ?? instructors[0]?.id ?? "";

  return (
    <form action={action} className="grid gap-3">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      {!course ? (
        <p className="text-muted-foreground rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-xs">
          Demo values are prefilled. Change the slug if you create more than one test course, pick
          Category + Instructor, then click Create course.
        </p>
      ) : null}
      <Input
        name="title"
        required
        defaultValue={course?.title ?? demo?.title}
        placeholder="Title"
        aria-label="Title"
      />
      <Input
        name="slug"
        required
        defaultValue={course?.slug ?? demo?.slug}
        placeholder="slug"
        aria-label="Slug"
      />
      <textarea
        name="shortDescription"
        required
        defaultValue={course?.shortDescription ?? demo?.shortDescription}
        placeholder="Short description"
        aria-label="Short description"
        className="border-border bg-card rounded-lg border px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        required
        rows={4}
        defaultValue={course?.description ?? demo?.description}
        placeholder="Description"
        aria-label="Description"
        className="border-border bg-card rounded-lg border px-3 py-2 text-sm"
      />
      <Input
        name="thumbnail"
        required
        type="text"
        defaultValue={course?.thumbnail ?? demo?.thumbnail}
        placeholder="/course-thumbnails/my-course.webp"
        aria-label="Thumbnail path"
      />
      <p className="text-muted-foreground text-xs">
        Local path under <code className="font-mono">/public</code>. Ready now:{" "}
        <code className="font-mono">/course-thumbnails/my-course.webp</code>.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="categoryId"
          required
          defaultValue={defaultCategoryId}
          aria-label="Category"
          className="border-border bg-card h-11 rounded-lg border px-3 text-sm"
        >
          <option value="" disabled>
            Category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="instructorId"
          required
          defaultValue={defaultInstructorId}
          aria-label="Instructor"
          className="border-border bg-card h-11 rounded-lg border px-3 text-sm"
        >
          <option value="" disabled>
            Instructor
          </option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" name="level" value={course?.level ?? "BEGINNER"} />
      <Input
        name="duration"
        required
        defaultValue={course?.duration ?? demo?.duration}
        placeholder="Duration"
        aria-label="Duration"
      />
      <Input
        name="price"
        required
        type="number"
        min={0}
        defaultValue={course?.price ?? demo?.price}
        placeholder="Price in INR"
        aria-label="Price"
      />
      <Input
        name="enrollmentUrl"
        required
        type="url"
        defaultValue={course?.enrollmentUrl ?? demo?.enrollmentUrl}
        placeholder="https://academy.infozub.com/course/..."
        aria-label="Enrollment URL"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={course?.published ?? true}
        />
        Published
      </label>
      {state.message ? (
        <p className={state.ok ? "text-success text-sm" : "text-destructive text-sm"}>
          {state.message}
        </p>
      ) : null}
      {state.fieldErrors
        ? Object.entries(state.fieldErrors).map(([field, message]) => (
            <p key={field} className="text-destructive text-sm">
              {field}: {message}
            </p>
          ))
        : null}
      <Button type="submit" disabled={pending}>
        {course ? "Save course" : "Create course"}
      </Button>
    </form>
  );
}
