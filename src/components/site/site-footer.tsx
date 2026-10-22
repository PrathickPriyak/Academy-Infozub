import Link from "next/link";

import { Container } from "@/components/layout/container";
import { navLinks, site } from "@/data/site";
import { listPublicCategories } from "@/lib/courses/public-catalog";

import { BrandLogo } from "./brand-logo";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refunds" },
] as const;

const exploreLinks = [
  ...navLinks.filter((link) => link.href !== "/courses#categories"),
  { href: "/chat", label: "Assistant" },
  { href: site.lms, label: "LMS", external: true as const },
];

export async function SiteFooter() {
  const categories = await listPublicCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-card/60 mt-auto border-t">
      <Container className="py-8 sm:py-9">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr] lg:gap-6">
          <div className="space-y-3">
            <BrandLogo />
            <p className="text-muted-foreground max-w-[17rem] text-sm leading-relaxed">
              Skills-focused courses for design, marketing, web, video, and career growth.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {site.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary text-xs font-medium underline-offset-4 hover:underline"
                >
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Explore">
            <h2 className="text-muted-foreground mb-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
              Explore
            </h2>
            <ul className="space-y-1.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                    >
                      {link.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Categories">
            <h2 className="text-muted-foreground mb-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
              Categories
            </h2>
            <ul className="columns-2 gap-x-4 space-y-1.5 sm:columns-1">
              {categories.map((category) => (
                <li key={category.slug} className="break-inside-avoid">
                  <Link
                    href={`/courses?category=${category.slug}`}
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <div>
              <h2 className="text-muted-foreground mb-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
                Contact
              </h2>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="text-muted-foreground hover:text-foreground font-medium break-all transition-colors"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <a
                    href={site.phoneHref}
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    {site.phone}
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <span className="text-foreground/80 font-medium">{site.offices.corporate.label}</span>
              <br />
              {site.offices.corporate.lines.slice(1).join(", ")}
            </p>
          </div>
        </div>

        <div className="border-border mt-7 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            © {year} {site.shortName}. Part of{" "}
            <a
              href={site.companySite}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              INFOZUB
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
