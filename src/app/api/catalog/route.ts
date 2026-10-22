import { NextResponse } from "next/server";

import { listPublicCategories, listPublicCourses } from "@/lib/courses/public-catalog";

export const dynamic = "force-dynamic";

/** Live published catalog for client search / filters. */
export async function GET() {
  const [courses, categories] = await Promise.all([
    listPublicCourses(),
    listPublicCategories(),
  ]);
  return NextResponse.json(
    { courses, categories },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
