"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { HoverMedia } from "@/components/ui/hover-media";
import {
  categoryNameForCourse,
  durationLabel,
  formatCoursePrice,
  levelLabel,
  type CatalogCourse,
} from "@/data/catalog";
import { hoverLift, transitionFast } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function CourseCard({
  course,
  className,
  featured = false,
}: {
  course: CatalogCourse;
  className?: string;
  featured?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const category = categoryNameForCourse(course);
  const price = formatCoursePrice(course);

  return (
    <motion.article
      className={cn(
        "bg-card group relative flex h-full flex-col overflow-hidden rounded-2xl ring-1 ring-border/70 transition-[box-shadow,ring-color,transform] duration-200 hover:ring-primary/30 hover:shadow-[0_8px_28px_rgb(10_27_46/0.12)]",
        className,
      )}
      whileHover={hoverLift(reduceMotion, 2)}
      transition={transitionFast}
    >
      <Link href={`/courses/${course.slug}`} className="flex h-full flex-col outline-none">
        <HoverMedia
          src={course.thumbnail}
          alt={`${course.title} course thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[16/9] bg-muted"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#061018]/55 via-[#0b2e5b]/10 to-transparent" />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <Badge
              variant="secondary"
              className="border-white/20 bg-[#0b2e5b]/88 text-white shadow-xs backdrop-blur-sm"
            >
              {category}
            </Badge>
            {featured ? <Badge variant="accent">Featured</Badge> : null}
          </div>
        </HoverMedia>

        <div className="flex flex-1 flex-col gap-3 px-4 pt-3.5 pb-4">
          <div className="space-y-1.5">
            <h3 className="font-display line-clamp-2 text-lg leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
              {course.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {course.shortDescription}
            </p>
          </div>

          <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
            <span>{levelLabel(course.level)}</span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5 shrink-0" aria-hidden />
              {durationLabel(course.duration)}
            </span>
          </div>

          <div className="border-border/70 flex items-center justify-between gap-3 border-t pt-3">
            <span className="text-foreground text-base font-semibold tracking-tight">{price}</span>
            <span className="text-primary inline-flex items-center gap-1 text-sm font-semibold">
              View
              <ArrowUpRight
                className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
