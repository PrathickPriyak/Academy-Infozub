"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  categoryNameForCourse,
  durationLabel,
  listCategories,
  listCourses,
  type CatalogCourse,
} from "@/data/catalog";
import { cn } from "@/lib/utils";

import { Reveal, RevealItem, RevealStagger } from "./reveal";

function TrainingCard({
  course,
  popular = false,
}: {
  course: CatalogCourse;
  popular?: boolean;
}) {
  const category = categoryNameForCourse(course);
  const duration = durationLabel(course.duration);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="bg-card group flex h-full flex-col overflow-hidden rounded-2xl ring-1 ring-border/70 transition-[box-shadow,ring-color,transform] duration-200 hover:-translate-y-0.5 hover:ring-primary/25 hover:shadow-[0_10px_28px_rgb(10_27_46/0.1)] focus-visible:ring-ring outline-none focus-visible:ring-2"
    >
      <div className="bg-muted relative aspect-[16/10] overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={`${course.title} course thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
        {popular ? (
          <span className="bg-card/95 text-foreground absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs">
            Popular
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pt-3.5 pb-4">
        <h3 className="font-display line-clamp-2 text-lg leading-snug tracking-tight transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Award className="text-accent size-4 shrink-0" aria-hidden />
          <span className="font-medium text-foreground/80">Course</span>
          <span aria-hidden className="text-border">
            |
          </span>
          <span className="truncate">{duration}</span>
        </p>

        <div className="mt-auto pt-1">
          <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide">
            {category}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PopularCourses() {
  const categories = listCategories();
  const allCourses = listCourses();
  // Default to All so the 4-column grid stays full; category tabs still filter.
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const pool =
      activeCategory === "all"
        ? allCourses
        : allCourses.filter((course) => course.category === activeCategory);
    return pool.slice(0, 12);
  }, [activeCategory, allCourses]);

  const filterTabs = [
    { slug: "all", name: "All" },
    ...categories.filter((category) =>
      allCourses.some((course) => course.category === category.slug),
    ),
  ];

  return (
    <Section spacing="lg" className="bg-muted/40">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Popular courses</h2>
          <nav
            aria-label="Filter popular courses by category"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {filterTabs.map((tab) => {
              const active = tab.slug === activeCategory;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActiveCategory(tab.slug)}
                  className={cn(
                    "text-sm font-semibold tracking-wide transition-colors",
                    active
                      ? "text-primary underline decoration-2 underline-offset-8"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={active}
                >
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </Reveal>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground mt-12 text-center text-sm">
            No courses in this category yet.
          </p>
        ) : (
          <RevealStagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((course, index) => (
              <RevealItem key={course.slug}>
                <TrainingCard course={course} popular={index < 2} />
              </RevealItem>
            ))}
          </RevealStagger>
        )}

        <Reveal className="mt-10 flex justify-center" delay={0.05}>
          <Button asChild size="lg" className="min-w-[12rem] rounded-full px-8">
            <Link href="/courses">View all courses</Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
