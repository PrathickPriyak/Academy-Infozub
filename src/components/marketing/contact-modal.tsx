"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { ContactForm } from "@/components/marketing/contact-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function ContactModal({
  children,
  defaultSubject = "Course inquiry",
  open: openProp,
  onOpenChange,
}: {
  children: ReactNode;
  defaultSubject?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "w-[min(100%-1rem,48rem)] max-h-[min(88dvh,36rem)] gap-0 overflow-hidden p-0 sm:rounded-[1.75rem]",
          "border-border/70 bg-card shadow-[0_28px_90px_rgb(10_27_46/0.32)]",
        )}
      >
        <div className="grid md:max-h-[min(88dvh,36rem)] md:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden overflow-hidden bg-[#0b2e5b] px-6 py-6 text-white md:flex md:flex-col md:justify-between">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 55% at 8% 0%, rgb(240 138 53 / 0.3), transparent 55%), radial-gradient(ellipse 55% 45% at 95% 100%, rgb(91 143 212 / 0.24), transparent 52%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgb(255 255 255 / 0.9) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.9) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "linear-gradient(180deg, black, transparent 85%)",
              }}
            />

            <div className="relative space-y-5">
              <div className="inline-flex rounded-xl bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
                <Image
                  src="/infozub-logo.png"
                  alt=""
                  width={200}
                  height={67}
                  className="h-8 w-auto object-contain object-left"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#f0b27a] uppercase">
                  Talk with us
                </p>
                <p className="font-display mt-2 text-[1.65rem] leading-tight tracking-tight text-white">
                  Let’s find the right course
                </p>
                <p className="mt-2.5 max-w-[16.5rem] text-sm leading-relaxed text-white/78">
                  Share a short note about your goals. The academy team replies through the published Infozub
                  channels.
                </p>
              </div>
            </div>

            <ul className="relative mt-8 space-y-3.5 text-sm text-white/90">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Mail className="size-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">Email</p>
                  <a href={`mailto:${site.email}`} className="font-medium underline-offset-4 hover:underline">
                    {site.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Phone className="size-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">Phone</p>
                  <a href={site.phoneHref} className="font-medium underline-offset-4 hover:underline">
                    {site.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <MapPin className="size-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
                    {site.offices.corporate.label}
                  </p>
                  <p className="leading-relaxed text-white/75">
                    {site.offices.corporate.lines.slice(1).join(", ")}
                  </p>
                </div>
              </li>
            </ul>
          </aside>

          <div className="overflow-y-auto bg-gradient-to-b from-card to-[#f7f9fc] px-5 py-5 sm:px-6 sm:py-6 md:max-h-[min(88dvh,36rem)]">
            <DialogHeader className="mb-3.5 pr-8">
              <p className="text-primary text-[11px] font-semibold tracking-[0.16em] uppercase">Inquiry</p>
              <DialogTitle className="font-display mt-1 text-xl tracking-tight">
                Send a message
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-relaxed">
                Course questions or partnerships — opens via email to {site.email}.
              </DialogDescription>
            </DialogHeader>

            <ContactForm
              compact
              defaultSubject={defaultSubject}
              onSuccess={() => {
                window.setTimeout(() => setOpen(false), 1600);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
