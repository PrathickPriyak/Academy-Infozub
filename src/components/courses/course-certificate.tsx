"use client";

import Image from "next/image";

export function CourseCertificate({
  title,
  src,
}: {
  title: string;
  src: string;
}) {
  return (
    <section>
      <h2 className="font-display text-3xl tracking-tight">Sample certificate</h2>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        Learners who complete {title} receive an Infozub Digital Academy certificate of completion.
      </p>
      <figure className="border-border bg-muted/40 mt-6 overflow-hidden rounded-2xl border p-3 sm:p-5">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          <Image
            src={src}
            alt={`Sample certificate of completion for ${title}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 720px"
          />
        </div>
        <figcaption className="text-muted-foreground mt-3 text-center text-xs">
          Sample certificate template — learner name, serial number, and dates are filled after course completion.
        </figcaption>
      </figure>
    </section>
  );
}
