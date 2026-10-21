"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listCategories, type CatalogCategory } from "@/data/catalog";
import { navLinks } from "@/data/site";
import { cn } from "@/lib/utils";

import { BrandLogo } from "./brand-logo";
import { CourseSearch } from "./course-search";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>(() => listCategories());

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { categories?: CatalogCategory[] } | null) => {
        if (!cancelled && Array.isArray(data?.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        /* keep static categories */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) {
      const path = href.split("#")[0] ?? href;
      return pathname === path;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300",
          scrolled
            ? "border-border/80 bg-card/95 shadow-soft backdrop-blur-xl"
            : "border-border/50 bg-card/85 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-16 w-full min-w-0 max-w-6xl items-center gap-2 px-4 sm:h-[4.25rem] sm:gap-3 sm:px-6 lg:px-8">
          <BrandLogo priority className="shrink-0" />

          <nav className="ml-1 hidden min-w-0 items-center gap-0.5 lg:flex" aria-label="Primary">
            {navLinks.map((link) => {
              if (link.label === "Categories") {
                return (
                  <DropdownMenu key={link.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-10 items-center gap-1 rounded-lg px-2.5 text-sm font-semibold transition-colors xl:px-3",
                          isActive(link.href)
                            ? "text-primary"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        Categories
                        <ChevronDown className="size-3.5 opacity-70" aria-hidden />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Browse by category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {categories.map((category) => (
                        <DropdownMenuItem key={category.slug} asChild>
                          <Link href={`/courses?category=${category.slug}`}>{category.name}</Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/courses#categories">All categories</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-semibold transition-colors xl:px-3",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active ? (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "nav-active"}
                      className="bg-primary absolute inset-x-2.5 -bottom-[0.7rem] h-[2px] rounded-full sm:-bottom-[0.85rem] xl:inset-x-3"
                      transition={{ duration: 0.2 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden min-w-0 max-w-xs flex-1 items-center justify-end gap-2 lg:flex xl:max-w-sm">
            <CourseSearch className="w-full min-w-0" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-1 lg:gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={mobileSearchOpen ? "Hide search" : "Open search"}
              aria-expanded={mobileSearchOpen}
              aria-controls="mobile-search-panel"
              onClick={() => setMobileSearchOpen((value) => !value)}
            >
              <Search />
            </Button>

            <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Open chatbot">
              <Link href="/chat">
                <MessageCircle />
              </Link>
            </Button>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <Button asChild className="hidden xl:inline-flex" size="default">
              <Link href="/courses">Explore Courses</Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileSearchOpen ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              id="mobile-search-panel"
              className="border-border relative z-[60] border-t lg:hidden"
            >
              <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
                <CourseSearch autoFocus onNavigate={() => setMobileSearchOpen(false)} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <MobileNav open={mobileOpen} onClose={closeMobile} categories={categories} />
    </>
  );
}
