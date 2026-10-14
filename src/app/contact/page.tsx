import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name} at ${site.email} or ${site.phone}. Offices in Palladam and Tiruppur.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${site.name}`,
    description: `Contact ${site.name} at ${site.email} or ${site.phone}. Offices in Palladam and Tiruppur.`,
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact · ${site.name}`,
    description: `Contact ${site.name} at ${site.email} or ${site.phone}. Offices in Palladam and Tiruppur.`,
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="border-border relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 12% -10%, rgb(11 46 91 / 0.1), transparent 55%), radial-gradient(ellipse 50% 40% at 95% 20%, rgb(232 119 34 / 0.08), transparent 50%), linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%)",
          }}
        />
        <Container className="relative py-16 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Contact</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              Talk with Infozub
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
              Course questions, enrollment help, or partnerships — reach the academy team with the details below or send
              a message.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section spacing="lg" className="bg-background">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
            <Reveal className="space-y-10">
              <div className="grid gap-6 sm:grid-cols-2">
                <a
                  href={`mailto:${site.email}`}
                  className="group border-border/80 bg-card hover:border-primary/30 block rounded-2xl border p-6 transition-colors sm:p-7"
                >
                  <span className="bg-secondary text-primary inline-flex size-11 items-center justify-center rounded-xl">
                    <Mail className="size-5" aria-hidden />
                  </span>
                  <p className="text-muted-foreground mt-5 text-xs font-semibold tracking-[0.14em] uppercase">
                    Email
                  </p>
                  <p className="text-foreground mt-2 text-lg font-semibold tracking-tight break-all group-hover:text-primary">
                    {site.email}
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    For login or LMS access issues, you can also use logesh@infozub.com.
                  </p>
                </a>

                <a
                  href={site.phoneHref}
                  className="group border-border/80 bg-card hover:border-primary/30 block rounded-2xl border p-6 transition-colors sm:p-7"
                >
                  <span className="bg-secondary text-primary inline-flex size-11 items-center justify-center rounded-xl">
                    <Phone className="size-5" aria-hidden />
                  </span>
                  <p className="text-muted-foreground mt-5 text-xs font-semibold tracking-[0.14em] uppercase">
                    Phone
                  </p>
                  <p className="text-foreground mt-2 text-lg font-semibold tracking-tight group-hover:text-primary">
                    {site.phone}
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    Call during academy hours for enrollment and course guidance.
                  </p>
                </a>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-2">
                  <MapPin className="text-primary size-4 shrink-0" aria-hidden />
                  <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">Office addresses</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {[site.offices.registered, site.offices.corporate].map((office) => (
                    <div
                      key={office.label}
                      className="border-border/80 bg-card rounded-2xl border p-6 sm:min-h-[11rem] sm:p-7"
                    >
                      <h3 className="font-display text-xl tracking-tight">{office.label}</h3>
                      <p className="text-muted-foreground mt-4 space-y-1 text-sm leading-relaxed">
                        {office.lines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-border/70 border-t pt-8">
                <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">Business & social</h2>
                <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
                  INFOZUB Private Limited ·{" "}
                  <a
                    href={site.companySite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground font-semibold underline-offset-4 hover:underline"
                  >
                    infozub.com
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  {" · "}
                  <a
                    href={site.lms}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground font-semibold underline-offset-4 hover:underline"
                  >
                    Learning platform
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {site.social.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="border-border bg-card hover:border-primary/35 hover:bg-muted/60 inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors"
                      >
                        {item.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/courses">Browse courses</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/about">About the academy</Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="lg:sticky lg:top-24">
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
