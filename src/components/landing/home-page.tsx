"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { InquiryWidget } from "@/components/inquiry/inquiry-widget";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CourseHighlight {
  slug: string;
  title: string;
  duration: string;
  shortDescription: string;
  category: string;
  priceLabel: string;
  instructor: string;
  enrollmentUrl: string;
}

const audiences = [
  {
    title: "Digital marketers",
    text: "People who want a higher-paying role by learning advanced digital skills.",
  },
  {
    title: "Traditional marketers",
    text: "People moving their career into digital marketing.",
  },
  {
    title: "Students and freshers",
    text: "People starting a career in digital marketing.",
  },
  {
    title: "Business owners",
    text: "Owners who want leads, sales, and a better way to manage an agency.",
  },
  {
    title: "Freelancers",
    text: "Freelancers who want to offer broader digital services.",
  },
  {
    title: "Anyone learning",
    text: "Anyone who wants to learn digital marketing and stay current.",
  },
];

const highlights = [
  "Updated strategies",
  "Certificate on completion from INFOZUB",
  "Hands-on learning",
  "Community group",
  "Step-by-step training",
  "Learn on any device",
];

const stories = [
  {
    name: "Menaga",
    quote: "Mentors are passionate about teaching and making a difference for students.",
  },
  {
    name: "Vignesh",
    quote: "The course prepared me for the challenges of the real world.",
  },
  {
    name: "Sathish",
    quote: "Logesh Kumar was an impressive mentor in the Social Media Marketing workshop.",
  },
  {
    name: "Subash",
    quote: "The course covers pages, posting, connecting Instagram and Facebook, and running ads.",
  },
];

export function HomePage({ courses }: { courses: CourseHighlight[] }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((course) => course.category)))],
    [courses],
  );
  const visible = courses.filter((course) => {
    const matchesCategory = category === "All" || course.category === category;
    const haystack = `${course.title} ${course.shortDescription} ${course.category}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });

  function ask(event: FormEvent) {
    event.preventDefault();
    const question = query.trim();
    if (!question) {
      return;
    }
    window.location.assign(`/chat?q=${encodeURIComponent(question)}`);
  }

  const rise = reduce ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.35 } };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Section spacing="lg" className="overflow-hidden">
          <Container className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">Infozub Digital Academy</p>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display mt-4 text-4xl tracking-tight text-balance sm:text-6xl"
              >
                Quality education for everyone
              </motion.h1>
              <p className="text-muted-foreground mt-5 max-w-xl text-base sm:text-lg">
                Browse the published courses, then ask the assistant about curriculum, price, duration, or enrollment.
              </p>
              <form className="border-border bg-card mt-8 flex items-center gap-2 rounded-2xl border p-2 shadow-md" onSubmit={ask}>
                <Search className="text-muted-foreground ml-2 size-4" />
                <label className="sr-only" htmlFor="home-search">
                  Search or ask
                </label>
                <input
                  id="home-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search courses or ask a question"
                  className="h-11 flex-1 bg-transparent text-sm outline-none"
                />
                <Button type="submit">Ask</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={
                      category === item
                        ? "bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold"
                        : "border-border bg-card hover:bg-muted rounded-full border px-3 py-1.5 text-xs font-medium"
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <motion.aside
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-border bg-card rounded-3xl border p-6 shadow-lg"
            >
              <p className="text-sm font-semibold">Start with a question</p>
              <div className="mt-4 grid gap-2">
                {[
                  "What courses are available?",
                  "Who should enroll?",
                  "What is the refund policy?",
                ].map((question) => (
                  <Link
                    key={question}
                    href={`/chat?q=${encodeURIComponent(question)}`}
                    className="hover:border-primary/40 hover:bg-muted rounded-xl border border-transparent px-3 py-3 text-sm font-medium transition-colors"
                  >
                    {question}
                  </Link>
                ))}
              </div>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/chat">
                  Open the full assistant
                  <ArrowRight />
                </Link>
              </Button>
            </motion.aside>
          </Container>
        </Section>

        <Section spacing="md" className="pt-0">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl tracking-tight">Courses</h2>
              <Link href="/courses" className="text-primary text-sm font-semibold">
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((course, index) => (
                <motion.article key={course.slug} {...rise} transition={{ delay: reduce ? 0 : index * 0.04 }} className="border-border bg-card hover:border-primary/40 flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-colors">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.priceLabel}</Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{course.title}</h3>
                  <p className="text-muted-foreground mt-2 line-clamp-3 flex-1 text-sm">{course.shortDescription}</p>
                  <p className="text-muted-foreground mt-3 text-xs">{course.instructor} · {course.duration}</p>
                  <div className="mt-4 flex gap-3 text-sm font-semibold">
                    <Link href={`/chat?q=${encodeURIComponent(`Tell me about the ${course.title}`)}`} className="text-primary">
                      Ask
                    </Link>
                    <a href={course.enrollmentUrl} className="text-foreground">
                      View course
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
            {visible.length === 0 ? (
              <p className="text-muted-foreground mt-6 text-sm">No published course matches that search. Ask the assistant or contact the team.</p>
            ) : null}
          </Container>
        </Section>

        <Section spacing="md" className="border-border border-t">
          <Container>
            <h2 className="font-display text-3xl tracking-tight">Who the courses are for</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((audience) => (
                <Link key={audience.title} href={`/chat?q=${encodeURIComponent("Who should enroll?")}`} className="border-border bg-card hover:-translate-y-0.5 rounded-2xl border p-5 shadow-sm transition-transform">
                  <h3 className="font-semibold">{audience.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{audience.text}</p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        <Section spacing="md" className="border-border border-t">
          <Container>
            <h2 className="font-display text-3xl tracking-tight">What the academy highlights</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((item) => (
                <div key={item} className="border-border bg-muted rounded-2xl border px-4 py-5 text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section spacing="md" className="border-border border-t">
          <Container>
            <h2 className="font-display text-3xl tracking-tight">From learners</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {stories.map((story) => (
                <blockquote key={story.name} className="border-border bg-card rounded-2xl border p-5">
                  <p className="text-sm leading-6">“{story.quote}”</p>
                  <footer className="mt-3 text-sm font-semibold">{story.name}</footer>
                </blockquote>
              ))}
            </div>
          </Container>
        </Section>

        <Section spacing="md" className="pt-0">
          <Container>
            <div className="bg-primary text-primary-foreground flex flex-col items-start justify-between gap-4 rounded-3xl px-6 py-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-3xl">Not satisfied within 7 days?</h2>
                <p className="mt-2 max-w-xl text-sm opacity-90">
                  The academy page says there is a complete refund, no questions asked. The assistant sends unrelated questions to the contact page.
                </p>
              </div>
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
      <InquiryWidget />
    </div>
  );
}
