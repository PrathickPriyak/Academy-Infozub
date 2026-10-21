"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, FolderOpen, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";

import {
  searchCatalog,
  type CatalogCategory,
  type CatalogCourse,
  type SearchHit,
} from "@/data/catalog";
import { duration, easeOutPremium, listItemFade } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function CourseSearch({
  className,
  autoFocus = false,
  onNavigate,
  size = "default",
}: {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  size?: "default" | "lg";
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveCourses, setLiveCourses] = useState<CatalogCourse[] | null>(null);
  const [liveCategories, setLiveCategories] = useState<CatalogCategory[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { courses?: CatalogCourse[]; categories?: CatalogCategory[] } | null) => {
        if (cancelled || !data) return;
        if (Array.isArray(data.courses)) setLiveCourses(data.courses);
        if (Array.isArray(data.categories)) setLiveCategories(data.categories);
      })
      .catch(() => {
        /* keep static catalog fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hits = useMemo(
    () =>
      searchCatalog(query, 8, {
        courses: liveCourses ?? undefined,
        categories: liveCategories ?? undefined,
      }),
    [query, liveCourses, liveCategories],
  );
  const popupOpen = open && Boolean(query.trim());

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      go("/courses");
      return;
    }
    if (hits[activeIndex]) {
      go(hits[activeIndex].href);
      return;
    }
    go(`/courses?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={onSubmit}
        className={cn(
          "border-border bg-card focus-within:ring-ring flex items-center gap-2 rounded-2xl border shadow-soft transition-shadow focus-within:ring-2",
          size === "lg" ? "h-14 px-4" : "h-11 px-3",
        )}
      >
        <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <label className="sr-only" htmlFor={`course-search-${listId}`}>
          Search courses, skills and topics
        </label>
        <input
          id={`course-search-${listId}`}
          ref={inputRef}
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={popupOpen}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={popupOpen && hits[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          placeholder="Search courses, skills and topics..."
          className="placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              return;
            }
            if (!hits.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => (index + 1) % hits.length);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => (index - 1 + hits.length) % hits.length);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-xl"
            aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      <AnimatePresence>
        {popupOpen ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: duration.fast, ease: easeOutPremium }}
            className="border-border bg-card absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-2xl border shadow-lift origin-top"
          >
            {hits.length === 0 ? (
              <p className="text-muted-foreground px-4 py-4 text-sm" role="status">
                No courses or categories match “{query.trim()}”. Try another skill or browse all courses.
              </p>
            ) : (
              <motion.ul
                id={listId}
                role="listbox"
                aria-label="Search suggestions"
                className="max-h-80 overflow-auto py-1"
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.03 } },
                }}
              >
                {hits.map((hit, index) => (
                  <SuggestionRow
                    key={`${hit.kind}-${hit.label}`}
                    id={`${listId}-${index}`}
                    hit={hit}
                    active={index === activeIndex}
                    onSelect={() => go(hit.href)}
                    animate={!reduceMotion}
                  />
                ))}
              </motion.ul>
            )}
            <div className="border-border border-t px-3 py-2">
              <Link
                href={query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : "/courses"}
                className="text-primary hover:bg-muted flex min-h-11 items-center rounded-lg px-2 py-2 text-sm font-semibold"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                View all results in Courses
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SuggestionRow({
  hit,
  active,
  onSelect,
  id,
  animate,
}: {
  hit: SearchHit;
  active: boolean;
  onSelect: () => void;
  id: string;
  animate: boolean;
}) {
  const Icon = hit.kind === "category" ? FolderOpen : BookOpen;
  return (
    <motion.li role="presentation" variants={animate ? listItemFade : undefined}>
      <div
        id={id}
        role="option"
        aria-selected={active}
        tabIndex={-1}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors",
          active ? "bg-muted" : "hover:bg-muted/70",
        )}
        onMouseDown={(event) => {
          event.preventDefault();
          onSelect();
        }}
      >
        <Icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{hit.label}</span>
          <span className="text-muted-foreground block truncate text-xs">
            {hit.kind === "category" ? "Category" : hit.course.shortDescription}
          </span>
        </span>
      </div>
    </motion.li>
  );
}
