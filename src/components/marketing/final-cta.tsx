"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ContactModal } from "@/components/marketing/contact-modal";
import { Button } from "@/components/ui/button";
import { refundSummary, site } from "@/data/site";
import { duration, easeOutPremium } from "@/lib/motion";

import { Reveal } from "./reveal";

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <Section spacing="md">
      <Container>
        <Reveal>
          <motion.div
            className="border-border from-primary to-primary/90 relative overflow-hidden rounded-2xl bg-gradient-to-r px-5 py-6 text-primary-foreground shadow-lift sm:px-8 sm:py-7"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ duration: duration.fast, ease: easeOutPremium }}
          >
            <div
              className="absolute -top-16 right-0 size-40 rounded-full bg-accent/20 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Ready to start learning?</h2>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/88 sm:text-[15px]">
                  Explore published courses from {site.name}, or talk with the team about the right program.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="default" variant="secondary">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <ContactModal defaultSubject="Program guidance">
                  <Button
                    type="button"
                    size="default"
                    variant="outline"
                    className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Contact Us
                  </Button>
                </ContactModal>
              </div>
            </div>
            <p className="text-primary-foreground/75 relative mt-4 text-xs sm:mt-5">
              {refundSummary.headline}{" "}
              <Link href={refundSummary.href} className="underline underline-offset-4">
                Read refund policy
              </Link>
            </p>
          </motion.div>
        </Reveal>
      </Container>
    </Section>
  );
}
