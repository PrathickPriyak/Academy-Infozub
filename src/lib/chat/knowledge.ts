import {
  categoryNameForCourse,
  formatCoursePrice,
  listCategories,
  listCourses,
  listPlatformKnowledge,
} from "@/data/catalog";
import { aboutContent, audiences, founder, highlights, navLinks, site } from "@/data/site";

export type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  href?: string;
  scoreBoost?: number;
};

export function buildKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    {
      id: "site-overview",
      title: "Academy overview",
      text: `${site.name}. ${site.tagline}. ${site.description} Website: ${site.url}. LMS: ${site.lms}. Navigation: ${navLinks.map((link) => link.label).join(", ")}.`,
      href: "/",
    },
    {
      id: "contact",
      title: "Contact",
      text: `Email ${site.email}. Phone ${site.phone}. ${site.offices.registered.label}: ${site.offices.registered.lines.join(", ")}. ${site.offices.corporate.label}: ${site.offices.corporate.lines.join(", ")}. Social: ${site.social.map((item) => item.label).join(", ")}.`,
      href: "/contact",
    },
    {
      id: "about-mission",
      title: "About mission and vision",
      text: `${aboutContent.mission.title}: ${aboutContent.mission.text} ${aboutContent.vision.title}: ${aboutContent.vision.text} ${aboutContent.philosophy.title}: ${aboutContent.philosophy.text} Started ${aboutContent.started}.`,
      href: "/about",
    },
    {
      id: "about-background",
      title: "INFOZUB background",
      text: aboutContent.background.join(" "),
      href: "/about",
    },
    {
      id: "about-introduction",
      title: "Academy introduction",
      text: aboutContent.introduction.join(" "),
      href: "/about",
    },
    {
      id: "instructor",
      title: "Instructor",
      text: `${founder.name}, ${founder.title}. ${founder.story.join(" ")} Stats: ${founder.stats.map((stat) => `${stat.value} ${stat.label}`).join("; ")}.`,
      href: "/about",
    },
    {
      id: "highlights",
      title: "Learning options and highlights",
      text: `Course highlights: ${highlights.join("; ")}.`,
      href: "/courses",
    },
    {
      id: "audiences",
      title: "Who should enroll",
      text: audiences.map((item) => `${item.title}: ${item.text}`).join(" "),
      href: "/about",
    },
    {
      id: "navigation",
      title: "Website navigation",
      text: `Main pages: ${navLinks.map((link) => `${link.label} (${link.href})`).join("; ")}; Chat /chat; Privacy /privacy; Terms /terms; Refund /refund.`,
      href: "/",
    },
  ];

  for (const item of listPlatformKnowledge()) {
    chunks.push({
      id: `platform-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
      title: item.title,
      text: item.content,
      href: item.title.toLowerCase().includes("refund")
        ? "/refund"
        : item.title.toLowerCase().includes("contact") || item.title.toLowerCase().includes("phone")
          ? "/contact"
          : item.title.toLowerCase().includes("about")
            ? "/about"
            : undefined,
    });
  }

  for (const category of listCategories()) {
    const courseTitles = listCourses()
      .filter((course) => course.category === category.slug)
      .map((course) => course.title);
    chunks.push({
      id: `category-${category.slug}`,
      title: `${category.name} category`,
      text: `${category.name}: ${category.description} Courses: ${courseTitles.join("; ")}.`,
      href: `/courses?category=${category.slug}`,
      scoreBoost: 1,
    });
  }

  for (const course of listCourses()) {
    const modules = course.modules.map((module, index) => `Module ${index + 1}: ${module.title}`).join("; ");
    chunks.push({
      id: `course-${course.slug}`,
      title: course.title,
      text: [
        course.title,
        categoryNameForCourse(course),
        course.shortDescription,
        course.description,
        `Duration: ${course.duration}`,
        `Price: ${formatCoursePrice(course)}`,
        `Enrollment: ${course.enrollmentUrl}`,
        modules,
      ].join(" "),
      href: `/courses/${course.slug}`,
    });
  }

  return chunks;
}

const STOP_TOKENS = new Set([
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "when",
  "where",
  "why",
  "how",
  "can",
  "could",
  "would",
  "should",
  "does",
  "did",
  "the",
  "and",
  "for",
  "with",
  "from",
  "your",
  "you",
  "our",
  "are",
  "is",
  "was",
  "were",
  "me",
  "my",
  "tell",
  "show",
  "please",
  "about",
  "into",
  "any",
  "some",
  "have",
  "has",
  "this",
  "that",
  "them",
  "they",
  "their",
]);

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s+]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function contentTokens(value: string): string[] {
  return tokenize(value).filter((token) => !STOP_TOKENS.has(token));
}

export type ScoredChunk = { chunk: KnowledgeChunk; score: number };

export function retrieveKnowledgeScored(question: string, limit = 6): ScoredChunk[] {
  const tokens = contentTokens(question);
  if (!tokens.length) return [];

  const wantsAbout =
    /\b(about the academy|about infozub|tell me about the academy|who is infozub)\b/i.test(question) ||
    (/\b(academy|infozub)\b/i.test(question) && /\b(about|mission|vision|story|background)\b/i.test(question));
  const wantsRefund = /\brefund\b/i.test(question);
  const wantsContact = /\b(contact|email|phone|address|office)\b/i.test(question);
  const wantsInstructor = /\b(instructor|teacher|founder|logesh|mentor)\b/i.test(question);

  return buildKnowledgeChunks()
    .map((chunk) => {
      const haystack = `${chunk.title} ${chunk.text}`.toLowerCase();
      let score = chunk.scoreBoost ?? 0;
      for (const token of tokens) {
        if (haystack.includes(token)) score += token.length <= 2 ? 1.5 : 1;
      }
      if (tokens.some((token) => chunk.title.toLowerCase().includes(token))) score += 2;
      if (/\bai\b/i.test(question) && /ai|artificial/i.test(haystack)) score += 3;
      if (/\bmarketing\b/i.test(question) && /marketing/i.test(haystack)) score += 2;
      if (wantsAbout && /^(about-|site-overview|platform-about)/.test(chunk.id)) score += 5;
      if (wantsRefund && /refund/i.test(haystack)) score += 5;
      if (wantsContact && chunk.id === "contact") score += 5;
      if (wantsInstructor && chunk.id === "instructor") score += 5;
      if (wantsAbout && chunk.id.startsWith("course-")) score -= 3;
      if (wantsRefund && chunk.id.startsWith("course-")) score -= 3;
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Tokens in the question that do not appear in retrieved context (hallucination risk). */
export function ungroundedTokens(question: string, chunks: KnowledgeChunk[]): string[] {
  const haystack = chunks.map((chunk) => `${chunk.title} ${chunk.text}`).join(" ").toLowerCase();
  return contentTokens(question).filter((token) => token.length > 3 && !haystack.includes(token));
}

export function retrieveKnowledge(question: string, limit = 6): KnowledgeChunk[] {
  return retrieveKnowledgeScored(question, limit).map((item) => item.chunk);
}
