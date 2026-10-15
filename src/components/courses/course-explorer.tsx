"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface CourseExplorerItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  duration: string;
  priceLabel: string;
  category: string;
  instructor: string;
  enrollmentUrl: string;
  modules: { id: string; title: string; description: string }[];
}

export function CourseExplorer({ courses }: { courses: CourseExplorerItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(courses[0]?.id ?? null);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((course) => course.category)))],
    [courses],
  );
  const visible = courses.filter((course) => {
    const matchesCategory = category === "All" || course.category === category;
    const haystack = `${course.title} ${course.shortDescription} ${course.category}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="border-border bg-card focus-within:ring-ring flex h-11 flex-1 items-center gap-2 rounded-xl border px-3 focus-within:ring-2">
          <Search className="text-muted-foreground size-4" />
          <span className="sr-only">Search courses</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses"
            className="h-full w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Course categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
            className={
              category === item
                ? "bg-primary text-primary-foreground shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                : "border-border bg-card hover:bg-muted shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
            }
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {visible.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-10 text-center text-sm">
            No courses match that search.
          </p>
        ) : null}
        {visible.map((course) => {
          const open = openId === course.id;
          return (
            <Card key={course.id} id={course.slug} variant="elevated">
              <CardHeader>
                <button type="button" className="text-left" onClick={() => setOpenId(open ? null : course.id)} aria-expanded={open}>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.duration}</Badge>
                    <Badge variant="outline">{course.priceLabel}</Badge>
                  </div>
                  <CardTitle className="mt-3 text-2xl">{course.title}</CardTitle>
                  <CardDescription>{course.shortDescription}</CardDescription>
                </button>
              </CardHeader>
              {open ? (
                <CardContent className="grid gap-4">
                  <p className="text-muted-foreground text-sm">
                    {course.instructor}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild>
                      <Link href={`/chat?q=${encodeURIComponent(`Tell me about the ${course.title}`)}`}>
                        Ask about this course
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={course.enrollmentUrl}>
                        View course
                        <ArrowRight />
                      </a>
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {course.modules.map((module) => (
                      <div key={module.id} className="bg-muted rounded-xl p-3">
                        <p className="text-sm font-semibold">{module.title}</p>
                        <p className="text-muted-foreground mt-1 text-sm">{module.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
