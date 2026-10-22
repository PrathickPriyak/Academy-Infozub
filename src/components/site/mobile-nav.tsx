"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { listCategories, type CatalogCategory } from "@/data/catalog";
import { navLinks, site } from "@/data/site";
import { useChromeOverlayLock } from "@/hooks/use-chrome-overlay-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { duration, easeOutPremium } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { BrandLogo } from "./brand-logo";
import { CourseSearch } from "./course-search";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav({
  open,
  onClose,
  categories: categoriesProp,
}: {
  open: boolean;
  onClose: () => void;
  categories?: CatalogCategory[];
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const categories = categoriesProp ?? listCategories();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useChromeOverlayLock(open);
  const handleClose = useCallback(() => onClose(), [onClose]);
  useFocusTrap(open, panelRef, { onEscape: handleClose, initialFocusRef: closeRef });

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const previousPathname = useRef(pathname);
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    const path = href.split("#")[0] ?? href;
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-foreground/35 backdrop-blur-[2px] lg:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: duration.fast }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="border-border bg-card fixed inset-y-0 right-0 z-[70] flex w-[min(100vw,22rem)] flex-col border-l shadow-hero lg:hidden"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "100%" }}
            transition={{ duration: duration.base, ease: easeOutPremium }}
          >
            <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
              <BrandLogo />
              <p id={titleId} className="sr-only">
                Mobile navigation
              </p>
              <Button
                ref={closeRef}
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={onClose}
              >
                <X />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <CourseSearch onNavigate={onClose} className="mb-6" />

              <nav aria-label="Primary">
                <motion.ul
                  className="flex flex-col gap-1"
                  initial={reduceMotion ? false : "hidden"}
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  }}
                >
                  {navLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <motion.li
                        key={link.href}
                        variants={{
                          hidden: { opacity: 0, x: 12 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: { duration: duration.fast, ease: easeOutPremium },
                          },
                        }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "flex min-h-12 items-center rounded-xl px-3 text-base font-semibold transition-colors",
                            active
                              ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                              : "text-foreground hover:bg-muted",
                          )}
                          aria-current={active ? "page" : undefined}
                          onClick={onClose}
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>

              <div className="mt-6">
                <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wide uppercase">
                  Categories
                </p>
                <ul className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/courses?category=${category.slug}`}
                        className="text-foreground hover:bg-muted flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors"
                        onClick={onClose}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-border space-y-3 border-t px-4 py-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/courses" onClick={onClose}>
                  Explore Courses
                </Link>
              </Button>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/chat" onClick={onClose}>
                    <MessageCircle />
                    Ask Assistant
                  </Link>
                </Button>
                <ThemeToggle />
              </div>
              <a
                href={site.lms}
                className="text-muted-foreground hover:text-foreground inline-flex min-h-11 w-full items-center justify-center text-center text-sm font-medium underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Open LMS <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
