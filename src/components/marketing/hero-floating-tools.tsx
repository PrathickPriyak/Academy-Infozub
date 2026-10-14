"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  BookOpen,
  Camera,
  Clapperboard,
  Code2,
  GraduationCap,
  Laptop,
  Megaphone,
  Palette,
  PenTool,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, type ComponentType } from "react";

import { cn } from "@/lib/utils";

type ToolItem = {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  left: string;
  top: string;
  box: string;
  delay: number;
  duration: number;
  depth: number;
  accent?: boolean;
};

const TOOLS: ToolItem[] = [
  { id: "book", label: "Books", Icon: BookOpen, left: "60%", top: "16%", box: "size-14", delay: 0, duration: 7.5, depth: 28, accent: true },
  { id: "laptop", label: "Laptop", Icon: Laptop, left: "78%", top: "30%", box: "size-16", delay: 0.35, duration: 8.2, depth: 36 },
  { id: "palette", label: "Design", Icon: Palette, left: "68%", top: "56%", box: "size-[3.35rem]", delay: 0.7, duration: 6.8, depth: 24, accent: true },
  { id: "code", label: "Code", Icon: Code2, left: "88%", top: "58%", box: "size-12", delay: 0.15, duration: 7.1, depth: 20 },
  { id: "camera", label: "Camera", Icon: Camera, left: "56%", top: "70%", box: "size-12", delay: 1, duration: 8.6, depth: 22 },
  { id: "megaphone", label: "Marketing", Icon: Megaphone, left: "84%", top: "14%", box: "size-12", delay: 0.55, duration: 7.8, depth: 30, accent: true },
  { id: "pen", label: "Design tools", Icon: PenTool, left: "50%", top: "38%", box: "size-11", delay: 1.25, duration: 9.2, depth: 16 },
  { id: "clapper", label: "Video", Icon: Clapperboard, left: "74%", top: "76%", box: "size-[3.25rem]", delay: 0.25, duration: 8, depth: 26 },
  { id: "grad", label: "Learning", Icon: GraduationCap, left: "92%", top: "40%", box: "size-14", delay: 0.85, duration: 7.4, depth: 32 },
  { id: "spark", label: "Creativity", Icon: Sparkles, left: "46%", top: "20%", box: "size-10", delay: 1.45, duration: 6.5, depth: 14, accent: true },
];

/**
 * Floating course tools and books for the hero backdrop.
 * Icons drift and parallax away from the pointer (no video, no brand watermark).
 */
export function HeroFloatingTools() {
  const reduceMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 55, damping: 16, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 55, damping: 16, mass: 0.35 });

  useEffect(() => {
    if (reduceMotion) return;
    const el = surfaceRef.current?.closest("section");
    if (!el) return;
    const section: HTMLElement = el;

    function onMove(event: PointerEvent) {
      const rect = section.getBoundingClientRect();
      pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    }

    function onLeave() {
      pointerX.set(0);
      pointerY.set(0);
    }

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div ref={surfaceRef} aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div className="absolute top-[10%] right-[6%] hidden size-[26rem] rounded-full border border-white/10 md:block" />
      <div className="absolute top-[20%] right-[12%] hidden size-[16rem] rounded-full border border-[#f08a35]/18 md:block" />
      <div className="absolute right-[2%] bottom-[8%] size-[20rem] rounded-full bg-[#5b8fd4]/12 blur-3xl" />

      {TOOLS.map((tool) => (
        <ToolChip
          key={tool.id}
          tool={tool}
          springX={springX}
          springY={springY}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </div>
  );
}

function ToolChip({
  tool,
  springX,
  springY,
  reduceMotion,
}: {
  tool: ToolItem;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { Icon } = tool;
  const offsetX = useTransform(springX, (v) => -v * tool.depth);
  const offsetY = useTransform(springY, (v) => -v * tool.depth);

  return (
    <motion.div
      className="absolute hidden sm:block"
      style={{ left: tool.left, top: tool.top, x: reduceMotion ? 0 : offsetX, y: reduceMotion ? 0 : offsetY }}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-2xl border shadow-[0_14px_36px_rgb(0_0_0/0.28)] backdrop-blur-md",
          tool.box,
          tool.accent
            ? "border-[#f08a35]/35 bg-[#f08a35]/18 text-[#ffe0c2] ring-1 ring-[#f08a35]/25"
            : "border-white/15 bg-white/10 text-white ring-1 ring-white/10",
        )}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -10, 0, 8, 0],
                rotate: [-2.5, 2.5, -1.5, 2, -2.5],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: tool.duration,
                delay: tool.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <Icon className="size-[46%] opacity-95" aria-hidden />
        <span className="sr-only">{tool.label}</span>
      </motion.div>
    </motion.div>
  );
}
