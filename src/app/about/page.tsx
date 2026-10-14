import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal, RevealItem, RevealStagger } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { listCourses } from "@/data/catalog";
import { academyMedia } from "@/data/media";
import { aboutContent, audiences, founder, highlights, site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${site.name}, INFOZUB’s background since ${aboutContent.started}, and the academy’s practical learning approach.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About · ${site.name}`,
    description: `Learn about ${site.name}, INFOZUB’s background since ${aboutContent.started}, and the academy’s practical learning approach.`,
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: `About · ${site.name}`,
    description: `Learn about ${site.name}, INFOZUB’s background since ${aboutContent.started}, and the academy’s practical learning approach.`,
  },
};

export default function AboutPage() {
  const courseCount = listCourses().length;
  const brandMark = academyMedia.brandMark;
  const press = academyMedia.press.filter(Boolean);

  return (
    <>
      <section className="border-border relative overflow-hidden border-b bg-card/50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 90% 0%, rgb(13 115 119 / 0.18), transparent 55%), radial-gradient(ellipse 45% 40% at 0% 80%, rgb(201 162 39 / 0.1), transparent 50%)",
          }}
        />
        <Container className="relative grid items-end gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <Reveal>
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">About</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl lg:text-6xl">{site.name}</h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed">{site.tagline}</p>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">{site.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/courses">Explore Courses</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="border-border relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] border bg-card shadow-hero">
              <Image
                src={brandMark}
                alt={site.name}
                width={280}
                height={280}
                className="h-auto w-[55%] max-w-[16rem] object-contain"
                priority
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <Section spacing="lg">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Academy introduction</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Built for practical digital skills</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {aboutContent.introduction.map((paragraph, index) => (
              <Reveal key={paragraph}>
                <div className="border-border/70 h-full border-t pt-5">
                  <p className="text-primary mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="text-foreground text-sm leading-relaxed sm:text-[0.95rem]">{paragraph}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-card/40">
        <Container className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Background</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight">INFOZUB since {aboutContent.started}</h2>
            <div className="mt-6 space-y-4">
              {aboutContent.background.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-border bg-card rounded-[1.75rem] border p-6 shadow-soft sm:col-span-2">
                <h3 className="font-display text-2xl tracking-tight">{aboutContent.mission.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{aboutContent.mission.text}</p>
              </div>
              <div className="border-border bg-card rounded-[1.75rem] border p-6 shadow-soft">
                <h3 className="font-display text-xl tracking-tight">{aboutContent.vision.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{aboutContent.vision.text}</p>
              </div>
              <div className="border-border bg-card rounded-[1.75rem] border p-6 shadow-soft">
                <h3 className="font-display text-xl tracking-tight">{aboutContent.philosophy.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{aboutContent.philosophy.text}</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Learning approach</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">How Infozub trains learners</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Strategies, certificates, community, and flexible access shaped by real digital marketing work.
            </p>
          </Reveal>
          <RevealStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <RevealItem key={item}>
                <div className="border-border bg-card group h-full rounded-2xl border p-6 shadow-soft transition-colors hover:border-primary/35">
                  <div className="bg-primary/10 text-primary mb-4 inline-flex size-10 items-center justify-center rounded-xl text-sm font-bold">
                    ✓
                  </div>
                  <h3 className="font-display text-xl tracking-tight">{item}</h3>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-card/40">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Experience</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight">Published impact metrics</h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Figures published for INFOZUB’s digital marketing experience.
            </p>
          </Reveal>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {founder.stats.map((stat) => (
              <div key={stat.label} className="border-border bg-card rounded-2xl border p-5 shadow-soft">
                <dt className="text-muted-foreground text-xs font-semibold uppercase">{stat.label}</dt>
                <dd className="font-display mt-2 text-3xl tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-6 text-sm">
            The academy currently lists {courseCount} published courses across design, marketing, web, video, business,
            and career tracks.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Who it’s for</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight">Learners Infozub invites to enroll</h2>
          </Reveal>
          <RevealStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((audience) => (
              <RevealItem key={audience.title}>
                <article className="border-border bg-card h-full rounded-2xl border p-6 shadow-soft">
                  <h3 className="font-display text-xl tracking-tight">{audience.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{audience.text}</p>
                </article>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {press.length > 0 ? (
        <Section spacing="lg" className="bg-card/40">
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">In the press</p>
              <h2 className="font-display mt-3 text-3xl tracking-tight">Published coverage</h2>
            </Reveal>
            <RevealStagger className="mt-10 grid gap-4 sm:grid-cols-3">
              {press.map((src) => (
                <RevealItem key={src}>
                  <div className="border-border bg-card relative flex aspect-[5/3] items-center justify-center overflow-hidden rounded-2xl border p-6 shadow-soft">
                    <Image
                      src={src}
                      alt="Press feature"
                      width={280}
                      height={160}
                      className="h-auto max-h-28 w-auto max-w-full object-contain"
                    />
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </Container>
        </Section>
      ) : null}

      <Section spacing="lg">
        <Container>
          <div className="border-border from-primary to-primary/90 relative overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-12 text-primary-foreground shadow-hero sm:px-12">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl tracking-tight">Talk with the Infozub team</h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
                  Questions about programs, enrollment, or partnership? Reach us by phone, email, or the contact form.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <a href={site.phoneHref}>{site.phone}</a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
