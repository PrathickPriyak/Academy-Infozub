"use client";

import type { Category, CourseLevel, Instructor } from "@prisma/client";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCourse, type ActionState } from "@/lib/courses/actions";

const initial: ActionState = { ok: false, message: "" };

const levels: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

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

  return (
    <form action={action} className="grid gap-3">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      <Input
        name="title"
        required
        defaultValue={course?.title}
        placeholder="Title"
        aria-label="Title"
      />
      <Input
        name="slug"
        required
        defaultValue={course?.slug}
        placeholder="slug"
        aria-label="Slug"
      />
      <textarea
        name="shortDescription"
        required
        defaultValue={course?.shortDescription}
        placeholder="Short description"
        aria-label="Short description"
        className="border-border bg-card rounded-lg border px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        required
        rows={4}
        defaultValue={course?.description}
        placeholder="Description"
        aria-label="Description"
        className="border-border bg-card rounded-lg border px-3 py-2 text-sm"
      />
      <Input
        name="thumbnail"
        required
        type="text"
        defaultValue={course?.thumbnail}
        placeholder="/course-thumbnails/my-course.webp"
        aria-label="Thumbnail path"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="categoryId"
          required
          defaultValue={course?.categoryId ?? ""}
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
          defaultValue={course?.instructorId ?? ""}
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
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="level"
          required
          defaultValue={course?.level ?? "BEGINNER"}
          aria-label="Level"
          className="border-border bg-card h-11 rounded-lg border px-3 text-sm"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <Input
          name="duration"
          required
          defaultValue={course?.duration}
          placeholder="Duration"
          aria-label="Duration"
        />
      </div>
      <Input
        name="price"
        required
        type="number"
        min={0}
        defaultValue={course?.price ?? 0}
        placeholder="Price in INR"
        aria-label="Price"
      />
      <Input
        name="enrollmentUrl"
        required
        type="url"
        defaultValue={course?.enrollmentUrl}
        placeholder="Enrollment URL"
        aria-label="Enrollment URL"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={course?.published} />
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
