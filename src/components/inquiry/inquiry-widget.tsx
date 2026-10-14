"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, MessageSquareText, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { duration, easeOutPremium } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

type FieldKey = "name" | "phone" | "email" | "message";
type FieldErrors = Partial<Record<FieldKey, string>>;

function validate(fields: Record<FieldKey, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (fields.name.length < 2) errors.name = "Please enter your name.";
  if (fields.phone.replace(/\D/g, "").length < 8) errors.phone = "Please enter a valid number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = "Please enter a valid email.";
  if (fields.message.length < 5) errors.message = "Please add a short message.";
  return errors;
}

export function InquiryWidget() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [overlayOpen, setOverlayOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const hidden =
    pathname.startsWith("/admin") || pathname.startsWith("/chat") || pathname.startsWith("/api");
  const onCourseDetail = /^\/courses\/[^/]+$/.test(pathname);

  const closePanel = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  useEffect(() => {
    const sync = () => setOverlayOpen(document.body.classList.contains("chrome-overlay-open"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => nameRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    const nextErrors = validate(fields);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to send your inquiry.");
      }
      setStatus("success");
      setFieldErrors({});
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (hidden || overlayOpen) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-3 sm:p-5",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        onCourseDetail && "max-lg:pb-[calc(4.85rem+env(safe-area-inset-bottom))]",
      )}
    >
      <div className="pointer-events-auto flex w-full max-w-[min(100%,24rem)] flex-col items-end gap-3 sm:w-auto">
        <AnimatePresence>
          {open ? (
            <motion.section
              id={panelId}
              role="dialog"
              aria-label="Contact inquiry form"
              aria-modal="false"
              initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: duration.base, ease: easeOutPremium }}
              className={cn(
                "bg-card flex w-full flex-col overflow-hidden rounded-[1.5rem] shadow-hero ring-1 ring-border/80",
                onCourseDetail
                  ? "max-h-[min(34rem,calc(100dvh-12.5rem))]"
                  : "max-h-[min(36rem,calc(100dvh-9.5rem))]",
              )}
            >
              <header className="border-border/80 from-primary/[0.07] flex items-center justify-between gap-2 border-b bg-gradient-to-r to-transparent px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Talk with Infozub</p>
                  <p className="text-muted-foreground truncate text-xs">
                    Share your details — we’ll get back to you
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close form"
                  className="size-11 shrink-0"
                  onClick={closePanel}
                >
                  <X aria-hidden />
                </Button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                {status === "success" ? (
                  <div className="flex flex-col items-start gap-3 py-2" role="status" aria-live="polite">
                    <span className="bg-primary/10 text-primary inline-flex size-11 items-center justify-center rounded-2xl">
                      <CheckCircle2 className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-display text-xl tracking-tight">Inquiry received</p>
                      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                        Thanks for reaching out. Your details were saved and the academy team will follow up.
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="mt-1"
                      onClick={() => {
                        setStatus("idle");
                        setError(null);
                      }}
                    >
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={onSubmit} className="space-y-3.5" noValidate>
                    <Field
                      id={`${panelId}-name`}
                      label="Name"
                      error={fieldErrors.name}
                      control={
                        <Input
                          ref={nameRef}
                          id={`${panelId}-name`}
                          name="name"
                          autoComplete="name"
                          required
                          placeholder="Your full name"
                          aria-invalid={Boolean(fieldErrors.name)}
                        />
                      }
                    />
                    <Field
                      id={`${panelId}-phone`}
                      label="Number"
                      error={fieldErrors.phone}
                      control={
                        <Input
                          id={`${panelId}-phone`}
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          placeholder="WhatsApp / mobile number"
                          aria-invalid={Boolean(fieldErrors.phone)}
                        />
                      }
                    />
                    <Field
                      id={`${panelId}-email`}
                      label="Mail"
                      error={fieldErrors.email}
                      control={
                        <Input
                          id={`${panelId}-email`}
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="you@example.com"
                          aria-invalid={Boolean(fieldErrors.email)}
                        />
                      }
                    />
                    <Field
                      id={`${panelId}-message`}
                      label="Message"
                      error={fieldErrors.message}
                      control={
                        <Textarea
                          id={`${panelId}-message`}
                          name="message"
                          rows={3}
                          required
                          placeholder="Tell us what you’re looking for…"
                          className="min-h-[5.5rem]"
                          aria-invalid={Boolean(fieldErrors.message)}
                        />
                      }
                    />

                    {error ? (
                      <p className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-sm" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={status === "loading"}>
                      {status === "loading" ? "Sending…" : "Submit inquiry"}
                    </Button>
                  </form>
                )}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={false}
          animate={reduceMotion ? undefined : { scale: open ? 0.98 : 1 }}
          transition={{ duration: duration.fast, ease: easeOutPremium }}
          className="shrink-0"
        >
          <Button
            ref={launcherRef}
            type="button"
            size="lg"
            className={cn(
              "bg-accent text-accent-foreground hover:bg-accent/90 min-h-12 shadow-hero",
              onCourseDetail ? "max-lg:size-12 max-lg:rounded-2xl max-lg:px-0" : "rounded-full",
              !onCourseDetail && "rounded-full",
            )}
            aria-expanded={open}
            aria-controls={panelId}
            aria-haspopup="dialog"
            aria-label={open ? "Close contact form" : "Contact Infozub"}
            onClick={() => {
              if (open) {
                closePanel();
                return;
              }
              setOpen(true);
              setStatus((current) => (current === "success" ? "idle" : current));
            }}
          >
            <MessageSquareText aria-hidden />
            <span className={cn("max-w-[10rem] truncate sm:max-w-none", onCourseDetail && "max-lg:sr-only")}>
              {open ? "Close form" : "Contact us"}
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  control,
}: {
  id: string;
  label: string;
  error?: string;
  control: ReactElement;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className={cn(error && "[&_input]:border-destructive [&_textarea]:border-destructive")}>{control}</div>
      {error ? (
        <p className="text-destructive mt-1 text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
