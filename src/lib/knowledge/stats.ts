import { listCatalogCoursesFallback } from "@/lib/courses/catalog-fallback";
import { db, hasDatabaseUrl } from "@/lib/db";

export interface KnowledgeStats {
  courses: number;
  modules: number;
  lessons: number;
  faqs: number;
  indexedDocuments: number;
  lastKnowledgeUpdate: Date | null;
  conversations: number;
  fallbackQuestions: number;
}

function catalogStatsFallback(): KnowledgeStats {
  const courses = listCatalogCoursesFallback();
  const modules = courses.reduce((sum, course) => sum + course.modules.length, 0);
  return {
    courses: courses.length,
    modules,
    lessons: 0,
    faqs: 0,
    indexedDocuments: 0,
    lastKnowledgeUpdate: null,
    conversations: 0,
    fallbackQuestions: 0,
  };
}

export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  if (!hasDatabaseUrl()) {
    return catalogStatsFallback();
  }

  try {
    const [courses, modules, lessons, faqs, indexedDocuments, lastRun, conversations, fallbackQuestions] =
      await Promise.all([
        db.course.count(),
        db.module.count(),
        db.lesson.count(),
        db.faq.count(),
        db.knowledgeChunk.count(),
        db.knowledgeIndexRun.findFirst({
          where: { status: "success", finishedAt: { not: null } },
          orderBy: { finishedAt: "desc" },
        }),
        db.conversation.count(),
        db.conversationMessage.count({ where: { fallback: true } }),
      ]);

    return {
      courses,
      modules,
      lessons,
      faqs,
      indexedDocuments,
      lastKnowledgeUpdate: lastRun?.finishedAt ?? null,
      conversations,
      fallbackQuestions,
    };
  } catch (error) {
    console.error("Knowledge stats unavailable; using catalog fallback.", error);
    return catalogStatsFallback();
  }
}
