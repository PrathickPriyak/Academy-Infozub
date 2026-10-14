"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
};

function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r: 1.1 + Math.random() * 2.2,
    baseAlpha: 0.22 + Math.random() * 0.35,
  }));
}

/**
 * Interactive hero atmosphere: pointer-reactive glow, drifting particles,
 * and soft connection lines. Canvas is decorative (pointer-events: none).
 */
export function HeroInteractiveBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || reduceMotion) return;
    const canvas: HTMLCanvasElement = el;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const pointer = { x: -9999, y: -9999, active: false };
    let particles: Particle[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.round((width * height) / 18000);
      particles = createParticles(width, height, Math.min(72, Math.max(28, density)));
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // Soft interactive spotlight that follows the pointer.
      if (pointer.active) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
        glow.addColorStop(0, "rgba(240, 138, 53, 0.22)");
        glow.addColorStop(0.35, "rgba(91, 143, 212, 0.12)");
        glow.addColorStop(1, "rgba(11, 46, 91, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      for (const p of particles) {
        // Gentle drift + soft attraction toward the pointer.
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 220) {
            const pull = (1 - dist / 220) * 0.045;
            p.vx += (dx / dist) * pull;
            p.vy += (dy / dist) * pull;
          }
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const nearPointer =
          pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - p.x, pointer.y - p.y) / 180) : 0;
        const alpha = Math.min(0.85, p.baseAlpha + nearPointer * 0.45);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.arc(p.x, p.y, p.r + nearPointer * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connect nearby particles / pointer for an interactive mesh.
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 110) continue;
          const strength = 1 - dist / 110;
          ctx.strokeStyle = `rgba(240, 178, 122, ${0.08 + strength * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (pointer.active) {
          const dist = Math.hypot(pointer.x - a.x, pointer.y - a.y);
          if (dist < 160) {
            const strength = 1 - dist / 160;
            ctx.strokeStyle = `rgba(240, 138, 53, ${0.12 + strength * 0.35})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      raf = window.requestAnimationFrame(step);
    }

    resize();
    step();

    // Listen on the hero section so interaction works over text/CTAs too.
    const surface = canvas.closest("section") ?? canvas.parentElement;
    surface?.addEventListener("pointermove", onPointerMove, { passive: true });
    surface?.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      surface?.removeEventListener("pointermove", onPointerMove);
      surface?.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
    />
  );
}
