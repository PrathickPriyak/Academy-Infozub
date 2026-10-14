"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const FALLBACK_PHRASE = "Quality Education for Everyone";

type HeroTypewriterProps = {
  phrases: readonly string[];
  className?: string;
  /** Milliseconds per typed character. */
  typeMs?: number;
  /** Milliseconds per deleted character. */
  deleteMs?: number;
  /** Pause after a phrase is fully typed. */
  holdMs?: number;
};

/**
 * Typewriter line with a blinking block cursor (HubSpot-style rotating headline).
 * Respects prefers-reduced-motion by showing the first phrase statically.
 */
export function HeroTypewriter({
  phrases,
  className,
  typeMs = 55,
  deleteMs = 32,
  holdMs = 2200,
}: HeroTypewriterProps) {
  const reduceMotion = useReducedMotion();
  const phraseList = phrases.length > 0 ? phrases : [FALLBACK_PHRASE];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(phraseList[0] ?? FALLBACK_PHRASE);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion || phraseList.length <= 1) {
      setText(phraseList[0] ?? FALLBACK_PHRASE);
      setDeleting(false);
      return;
    }

    const current = phraseList[index] ?? FALLBACK_PHRASE;
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && text.length === 0) {
      timer = setTimeout(() => {
        setDeleting(false);
        setIndex((value) => (value + 1) % phraseList.length);
      }, 220);
    } else if (deleting) {
      timer = setTimeout(() => setText((value) => value.slice(0, -1)), deleteMs);
    } else {
      timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
    }

    return () => clearTimeout(timer);
    // phraseList is a stable `as const` from site data; length/join covers identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting on new array identity
  }, [text, deleting, index, reduceMotion, phraseList.length, typeMs, deleteMs, holdMs]);

  const spoken =
    reduceMotion || phraseList.length <= 1 ? (phraseList[0] ?? FALLBACK_PHRASE) : phraseList.join(". ");

  return (
    <p className={cn("relative", className)} aria-label={spoken}>
      <span aria-hidden="true" className="inline">
        {text}
        <span
          className={cn(
            "ml-1 inline-block h-[0.85em] w-[0.12em] translate-y-[0.08em] bg-current align-baseline",
            reduceMotion ? "opacity-0" : "animate-hero-caret",
          )}
        />
      </span>
      <span className="sr-only">{spoken}</span>
    </p>
  );
}
