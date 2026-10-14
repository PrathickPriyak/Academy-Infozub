"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";

import { CourseCard } from "@/components/courses/course-card";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  catalog,
  countActiveFilters,
  durationLabel,
  filterCourses,
  listCategories,
  listCourses,
  listDurations,
  type CourseSort,
  type PriceFilter,
} from "@/data/catalog";
import { academyMedia } from "@/data/media";
import { useChromeOverlayLock } from "@/hooks/use-chrome-overlay-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { duration as motionDuration, easeOutPremium } from "@/lib/motion";
import { cn } from "@/lib/utils";

const sorts: { value: CourseSort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "title", label: "Title A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "modules", label: "Most modules" },
];

export function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterSheetRef = useRef<HTMLDivElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);
  const filtersTitleId = useId();
  useChromeOverlayLock(filtersOpen);

  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  useFocusTrap(filtersOpen, filterSheetRef, {
    onEscape: closeFilters,
    initialFocusRef: filterCloseRef,
  });

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const price = (searchParams.get("price") as PriceFilter | null) ?? "all";
  const durationFilter = searchParams.get("duration") ?? "all";
  const sort = (searchParams.get("sort") as CourseSort | null) ?? "popular";

  const [searchDraft, setSearchDraft] = useState(query);

  useEffect(() => {
    setSearchDraft(query);
  }, [query]);

  const categories = listCategories();
  const durations = listDurations();
  const previewCourses = listCourses().slice(0, 5);

  const courses = useMemo(
    () =>
      filterCourses({
        query,
        category,
        price,
        duration: durationFilter,
        sort,
      }),
    [query, category, price, durationFilter, sort],
  );

  const activeFilterCount = countActiveFilters({
    query,
    category,
    price,
    duration: durationFilter,
  });

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "popular")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function resetFilters() {
    setSearchDraft("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    setFiltersOpen(false);
  }

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [filtersOpen]);

  const filterPanelProps = {
    category,
    price,
    durationFilter,
    sort,
    categories,
    durations,
    updateParams,
    resetFilters,
    reduceMotion: !!reduceMotion,
    sortId: "catalog-sort",
  };

  return (
    <Section spacing="md">
      <Container>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b2e5b] text-white shadow-hero ring-1 ring-border/40">
          <Image
            src={academyMedia.brandMark}
            alt=""
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061018]/95 via-[#0b2e5b]/88 to-[#0b2e5b]/50" />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:p-10">
            <div>
              <p className="text-[#f0b27a] text-xs font-semibold tracking-[0.18em] uppercase">Catalog</p>
              <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">Courses</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                Browse all {catalog.courses.length} published Infozub Digital Academy courses. Filter by skill area,
                price, and access — then open a course for modules and enrollment.
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-white/75" aria-live="polite">
                {pending ? (
                  <>
                    Updating
                    <LoadingDots label="Updating results" />
                  </>
                ) : (
                  `${courses.length} course${courses.length === 1 ? "" : "s"} shown`
                )}
              </p>
            </div>
            <div className="hidden gap-2 sm:flex" aria-hidden>
              {previewCourses.map((course, index) => (
                <motion.div
                  key={course.slug}
                  className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xl ring-1 ring-white/15"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : motionDuration.base,
                    delay: reduceMotion ? 0 : index * 0.04,
                    ease: easeOutPremium,
                  }}
                >
                  <Image src={course.thumbnail} alt="" fill className="object-cover" sizes="120px" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div id="categories" className="scroll-mt-28">
          <div className="relative mt-6 lg:hidden">
            <div
              role="group"
              aria-label="Filter by category"
              className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <FilterChip
                active={category === "all"}
                onClick={() => updateParams({ category: "all" })}
                label="All"
                reduceMotion={!!reduceMotion}
              />
              {categories.map((item) => (
                <FilterChip
                  key={item.slug}
                  active={category === item.slug}
                  onClick={() => updateParams({ category: item.slug })}
                  label={item.name}
                  reduceMotion={!!reduceMotion}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row">
            <form
              className="relative flex-1"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                updateParams({ q: searchDraft.trim() || null });
              }}
            >
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                name="q"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search courses, skills and topics..."
                aria-label="Search courses"
                className="pl-10"
              />
            </form>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="catalog-sort-top">
                Sort courses
              </label>
              <select
                id="catalog-sort-top"
                className="border-border bg-card focus-visible:ring-ring hidden h-11 min-w-44 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2 md:block"
                value={sort}
                onChange={(event) => updateParams({ sort: event.target.value })}
              >
                {sorts.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                className="lg:hidden"
                aria-expanded={filtersOpen}
                aria-controls="catalog-filters-dialog"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter aria-hidden />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="bg-primary text-primary-foreground ml-1 inline-flex size-5 items-center justify-center rounded-full text-[11px]">
                    <span className="sr-only">{activeFilterCount} active, </span>
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            </div>
          </div>

          {activeFilterCount > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Active</span>
              {query ? (
                <ActiveChip label={`Search: ${query}`} onClear={() => updateParams({ q: null })} />
              ) : null}
              {category !== "all" ? (
                <ActiveChip
                  label={categories.find((item) => item.slug === category)?.name ?? category}
                  onClear={() => updateParams({ category: "all" })}
                />
              ) : null}
              {price !== "all" ? (
                <ActiveChip
                  label={price === "priced" ? "Priced" : "On request"}
                  onClear={() => updateParams({ price: "all" })}
                />
              ) : null}
              {durationFilter !== "all" ? (
                <ActiveChip
                  label={durationLabel(durationFilter)}
                  onClear={() => updateParams({ duration: "all" })}
                />
              ) : null}
              <button
                type="button"
                className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline"
                onClick={resetFilters}
              >
                Clear all
              </button>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[15.5rem_1fr] xl:gap-8">
            <aside className="bg-card/80 sticky top-24 hidden h-fit rounded-2xl p-4 ring-1 ring-border/70 backdrop-blur-sm lg:block">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-[0.14em] uppercase">Filters</h2>
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-primary text-xs font-semibold underline-offset-2 hover:underline"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
              <FilterPanel {...filterPanelProps} sortId="catalog-sort-desktop" />
            </aside>

            <div>
              {courses.length === 0 ? (
                <EmptyState
                  title="No courses found for your search."
                  description="Try another keyword, clear filters, or browse the full catalog."
                  action={
                    <Button type="button" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", pending && "opacity-80")}>
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: motionDuration.fast,
                        ease: easeOutPremium,
                        delay: Math.min(index, 8) * 0.02,
                      }}
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </div>
              )}

              <p className="text-muted-foreground mt-8 text-sm">
                Looking for help choosing a program?{" "}
                <Link href="/contact" className="text-primary font-semibold underline-offset-4 hover:underline">
                  Contact Infozub
                </Link>{" "}
                with your details and the academy team will guide you.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {filtersOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="bg-foreground/40 absolute inset-0 backdrop-blur-[2px]"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              onClick={closeFilters}
            />
            <motion.div
              ref={filterSheetRef}
              id="catalog-filters-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={filtersTitleId}
              className="border-border bg-card absolute inset-x-0 bottom-0 max-h-[min(85vh,100dvh)] overflow-y-auto rounded-t-3xl border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-hero"
              initial={reduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduceMotion ? undefined : { y: "100%" }}
              transition={{ duration: motionDuration.base, ease: easeOutPremium }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 id={filtersTitleId} className="text-lg font-semibold">
                  Filters & sort
                </h2>
                <Button
                  ref={filterCloseRef}
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close filters"
                  onClick={closeFilters}
                >
                  <X aria-hidden />
                </Button>
              </div>
              <FilterPanel {...filterPanelProps} sortId="catalog-sort-mobile" />
              <Button type="button" className="mt-2 w-full" onClick={closeFilters}>
                Show {courses.length} course{courses.length === 1 ? "" : "s"}
              </Button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </Section>
  );
}

function FilterPanel({
  category,
  price,
  durationFilter,
  sort,
  categories,
  durations,
  updateParams,
  resetFilters,
  reduceMotion,
  sortId,
}: {
  category: string;
  price: PriceFilter;
  durationFilter: string;
  sort: CourseSort;
  categories: ReturnType<typeof listCategories>;
  durations: ReturnType<typeof listDurations>;
  updateParams: (next: Record<string, string | null>) => void;
  resetFilters: () => void;
  reduceMotion: boolean;
  sortId: string;
}) {
  return (
    <div className="space-y-5">
      <FilterGroup legend="Category">
        <FilterChip
          active={category === "all"}
          onClick={() => updateParams({ category: "all" })}
          label="All"
          reduceMotion={reduceMotion}
        />
        {categories.map((item) => (
          <FilterChip
            key={item.slug}
            active={category === item.slug}
            onClick={() => updateParams({ category: item.slug })}
            label={item.name}
            reduceMotion={reduceMotion}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Price">
        <FilterChip
          active={price === "all"}
          onClick={() => updateParams({ price: "all" })}
          label="All"
          reduceMotion={reduceMotion}
        />
        <FilterChip
          active={price === "priced"}
          onClick={() => updateParams({ price: "priced" })}
          label="Priced"
          reduceMotion={reduceMotion}
        />
        <FilterChip
          active={price === "request"}
          onClick={() => updateParams({ price: "request" })}
          label="On request"
          reduceMotion={reduceMotion}
        />
      </FilterGroup>

      <div>
        <label htmlFor={`${sortId}-duration`} className="text-foreground mb-2 block text-sm font-semibold">
          Duration
        </label>
        <select
          id={`${sortId}-duration`}
          className="border-border bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
          value={durationFilter}
          onChange={(event) => updateParams({ duration: event.target.value })}
        >
          <option value="all">All durations</option>
          {durations.map((value) => (
            <option key={value} value={value}>
              {durationLabel(value)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={sortId} className="text-foreground mb-2 block text-sm font-semibold">
          Sort
        </label>
        <select
          id={sortId}
          className="border-border bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value })}
        >
          {sorts.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="button" variant="outline" size="sm" className="w-full lg:hidden" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  reduceMotion,
  block = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  reduceMotion: boolean;
  block?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={cn(
        "inline-flex min-h-9 items-center rounded-lg px-3 text-[13px] font-medium transition-colors",
        block ? "w-full justify-start" : "shrink-0",
        active
          ? "bg-primary text-primary-foreground shadow-xs"
          : "bg-secondary/55 text-foreground ring-1 ring-border/60 hover:bg-secondary",
      )}
    >
      {label}
    </motion.button>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="border-border/80 bg-card inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"
    >
      <span className="max-w-[12rem] truncate">{label}</span>
      <X className="size-3.5" aria-hidden />
      <span className="sr-only">Remove {label}</span>
    </button>
  );
}
