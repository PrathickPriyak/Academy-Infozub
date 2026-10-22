import {
  formatCoursePrice,
  type CatalogCategory,
  type CatalogCourse,
} from "@/data/catalog";
import { refundSummary, site } from "@/data/site";
import { listPublicCategories, listPublicCourses } from "@/lib/courses/public-catalog";

import { retrieveKnowledgeScored, ungroundedTokens, type KnowledgeChunk } from "./knowledge";
import { maybeRewriteWithProvider } from "./provider";

export type ChatReply = {
  answer: string;
  outOfScope: boolean;
  unknown: boolean;
  contactSuggested: boolean;
  contactCtaLabel: string;
  sources: Array<{ title: string; href?: string }>;
};

const OFF_TOPIC_HINTS =
  /\b(prime minister|president|weather|stock|crypto|bitcoin|recipe|joke|code this|write a poem|who won|cricket score|movie|celebrity|capital of|who is the)\b/i;

const ACADEMY_HINTS =
  /\b(infozub|academy|course|courses|class|learn|learning|marketing|seo|photoshop|canva|wordpress|ads|refund|enroll|instructor|logesh|contact|price|module|category|tamil|certificate|lms|design|video|web|business|career|premiere|interview)\b/i;

const MIN_RELEVANCE_SCORE = 2;

function isLikelyOffTopic(question: string): boolean {
  if (OFF_TOPIC_HINTS.test(question) && !ACADEMY_HINTS.test(question)) return true;
  return false;
}

function aboutChunks(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  return chunks.filter(
    (chunk) =>
      chunk.id.startsWith("about") ||
      chunk.id === "site-overview" ||
      chunk.id.startsWith("platform-about"),
  );
}

function composeFromChunks(
  question: string,
  chunks: KnowledgeChunk[],
  courses: CatalogCourse[],
  categories: CatalogCategory[],
): string {
  const courseChunks = chunks.filter((chunk) => chunk.id.startsWith("course-"));
  const categoryChunks = chunks.filter((chunk) => chunk.id.startsWith("category-"));
  const q = question.toLowerCase();

  if (/\b(what courses|which courses|list courses|offer)\b/.test(q) || q.includes("courses do you")) {
    return `Infozub Digital Academy currently lists these published courses: ${courses.map((course) => course.title).join("; ")}. Open any course page for modules, published pricing, and enrollment links.`;
  }

  if (/\b(ai courses?|show me ai)\b/.test(q)) {
    const aiCourses = courses.filter((course) =>
      `${course.title} ${course.shortDescription} ${course.description}`.toLowerCase().includes("ai"),
    );
    if (!aiCourses.length) {
      return "I don't have enough information to answer that accurately. Please contact our team for more details.";
    }
    return `Published courses that mention AI: ${aiCourses
      .map((course) => `${course.title} (${formatCoursePrice(course)}) — /courses/${course.slug}`)
      .join("; ")}.`;
  }

  if (/\b(digital marketing|marketing courses?)\b/.test(q)) {
    const marketing = courses.filter((course) => course.category === "marketing");
    const cats = categories
      .filter((category) => category.slug === "marketing")
      .map((category) => category.name);
    return `${cats[0] ?? "Marketing"} courses published by Infozub: ${marketing
      .map((course) => `${course.title} — ${formatCoursePrice(course)}, ${course.duration}`)
      .join("; ")}. Browse them at /courses?category=marketing.`;
  }

  if (/\b(contact|phone|email|address|office)\b/.test(q)) {
    return `You can contact Infozub Digital Academy at ${site.email} or ${site.phone}. Registered office: ${site.offices.registered.lines.join(", ")}. Corporate office: ${site.offices.corporate.lines.join(", ")}.`;
  }

  if (/\brefund\b/.test(q)) {
    const refund = chunks.find((chunk) => /refund/i.test(chunk.title) || /refund/i.test(chunk.text));
    return refund?.text ?? refundSummary.body;
  }

  if (
    /\b(about the academy|tell me about the academy|about infozub|mission|vision)\b/.test(q) ||
    (/\b(academy|infozub)\b/.test(q) && /\b(about|mission|vision|story|background)\b/.test(q))
  ) {
    const about = aboutChunks(chunks);
    if (about.length) {
      return about
        .slice(0, 2)
        .map((chunk) => chunk.text)
        .join(" ");
    }
  }

  if (categoryChunks.length && !courseChunks.length) {
    return categoryChunks.map((chunk) => `${chunk.title}: ${chunk.text}`).join("\n\n");
  }

  if (courseChunks.length === 1) {
    const course = courseChunks[0]!;
    return `${course.title}: ${course.text.slice(0, 480)}${course.text.length > 480 ? "…" : ""} Open the course page for the full curriculum and enrollment link.`;
  }

  if (courseChunks.length > 1) {
    return `Matching published courses: ${courseChunks
      .map((chunk) => chunk.title)
      .join("; ")}. ${courseChunks
      .slice(0, 2)
      .map((chunk) => `${chunk.title}: ${chunk.text.slice(0, 180)}…`)
      .join(" ")}`;
  }

  const summary = chunks
    .slice(0, 3)
    .map((chunk) => `${chunk.title}: ${chunk.text}`)
    .join("\n\n");

  return `Here’s what I can confirm from Infozub Digital Academy materials:\n\n${summary}`;
}

function baseReply(partial: Omit<ChatReply, "contactCtaLabel"> & { contactCtaLabel?: string }): ChatReply {
  return {
    ...partial,
    contactCtaLabel: partial.contactCtaLabel ?? (partial.unknown ? "Contact Infozub Team" : "Contact Us"),
  };
}

export async function answerQuestion(question: string): Promise<ChatReply> {
  const trimmed = question.trim().slice(0, 1000);
  if (!trimmed) {
    return baseReply({
      answer: "Please ask a question about Infozub Digital Academy, our courses, or how to get in touch.",
      outOfScope: false,
      unknown: false,
      contactSuggested: false,
      sources: [],
    });
  }

  if (isLikelyOffTopic(trimmed)) {
    return baseReply({
      answer:
        "That’s outside what I can help with. I can assist you with Infozub Digital Academy, our courses, programs and academy information.",
      outOfScope: true,
      unknown: false,
      contactSuggested: true,
      contactCtaLabel: "Contact Us",
      sources: [{ title: "Contact Us", href: "/contact" }],
    });
  }

  const [courses, categories] = await Promise.all([
    listPublicCourses(),
    listPublicCategories(),
  ]);
  const scored = retrieveKnowledgeScored(trimmed, 6, courses, categories);
  const topScore = scored[0]?.score ?? 0;
  const chunks = scored.map((item) => item.chunk);
  const intentTokens = new Set([
    "refund",
    "policy",
    "contact",
    "courses",
    "course",
    "academy",
    "infozub",
    "marketing",
    "digital",
    "instructor",
    "price",
    "pricing",
    "duration",
    "enroll",
    "enrollment",
  ]);
  const missing = ungroundedTokens(trimmed, chunks).filter((token) => !intentTokens.has(token));
  const hasSpecificUnknownTopic = missing.length >= 2;

  if (!scored.length || topScore < MIN_RELEVANCE_SCORE || hasSpecificUnknownTopic) {
    return baseReply({
      answer:
        "I don't have enough information to answer that accurately. Please contact our team for more details.",
      outOfScope: false,
      unknown: true,
      contactSuggested: true,
      contactCtaLabel: "Contact Infozub Team",
      sources: [{ title: "Contact Infozub Team", href: "/contact" }],
    });
  }

  let answer = composeFromChunks(trimmed, chunks, courses, categories);

  if (answer.includes("I don't have enough information")) {
    return baseReply({
      answer,
      outOfScope: false,
      unknown: true,
      contactSuggested: true,
      contactCtaLabel: "Contact Infozub Team",
      sources: [{ title: "Contact Infozub Team", href: "/contact" }],
    });
  }

  const rewritten = await maybeRewriteWithProvider({
    question: trimmed,
    groundedAnswer: answer,
    chunks,
  });
  if (rewritten) {
    answer = rewritten;
  }

  const contactSuggested =
    /contact|refund|login|access|help|unclear|enough information/i.test(trimmed) ||
    /contact our team|enough information/i.test(answer);

  return baseReply({
    answer,
    outOfScope: false,
    unknown: false,
    contactSuggested,
    contactCtaLabel: contactSuggested ? "Contact Infozub Team" : "Contact Us",
    sources: chunks
      .filter((chunk) => chunk.href)
      .slice(0, 4)
      .map((chunk) => ({ title: chunk.title, href: chunk.href })),
  });
}

export { suggestionPrompts, welcomeMessage } from "./prompts";

export function contactFallbackNote() {
  return `You can reach the team at ${site.email} or ${site.phone}.`;
}
