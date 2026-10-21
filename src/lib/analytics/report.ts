import { db, hasDatabaseUrl } from "@/lib/db";

export interface RankedItem {
  label: string;
  count: number;
}

export interface DailyCount {
  label: string;
  count: number;
}

export interface AnalyticsReport {
  conversations: number;
  questionsToday: number;
  fallbackQuestions: number;
  contactClicks: number;
  mostAsked: RankedItem[];
  mostDiscussed: RankedItem[];
  questionsByDay: DailyCount[];
  outcomes: RankedItem[];
}

const academyTimeZone = "Asia/Kolkata";

function startOfAcademyDay(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: academyTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${parts}T00:00:00+05:30`);
}

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: academyTimeZone,
    month: "short",
    day: "numeric",
  }).format(date);
}

function emptyAnalyticsReport(now = new Date()): AnalyticsReport {
  const today = startOfAcademyDay(now);
  const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const questionsByDay: DailyCount[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(weekStart.getTime() + offset * 24 * 60 * 60 * 1000);
    questionsByDay.push({ label: dayKey(date), count: 0 });
  }
  return {
    conversations: 0,
    questionsToday: 0,
    fallbackQuestions: 0,
    contactClicks: 0,
    mostAsked: [],
    mostDiscussed: [],
    questionsByDay,
    outcomes: [
      { label: "Answers", count: 0 },
      { label: "Fallbacks", count: 0 },
      { label: "Contact clicks", count: 0 },
    ],
  };
}

export async function getAnalyticsReport(now = new Date()): Promise<AnalyticsReport> {
  if (!hasDatabaseUrl()) {
    return emptyAnalyticsReport(now);
  }

  const today = startOfAcademyDay(now);
  const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  let conversations: number;
  let questionsToday: number;
  let fallbackQuestions: number;
  let contactClicks: number;
  let asked: Array<{ question: string | null; _count: { question: number } }>;
  let discussed: Array<{ courseTitle: string | null; _count: { courseTitle: number } }>;
  let weekQuestions: Array<{ createdAt: Date }>;
  let answers: number;

  try {
    [conversations, questionsToday, fallbackQuestions, contactClicks, asked, discussed, weekQuestions, answers] =
      await Promise.all([
        db.analyticsEvent.count({ where: { type: "chat_started" } }),
        db.analyticsEvent.count({ where: { type: "question_asked", createdAt: { gte: today } } }),
        db.analyticsEvent.count({ where: { type: "fallback_triggered" } }),
        db.analyticsEvent.count({ where: { type: "contact_clicked" } }),
        db.analyticsEvent.groupBy({
          by: ["question"],
          where: { type: "question_asked", question: { not: null } },
          _count: { question: true },
        }),
        db.analyticsEvent.groupBy({
          by: ["courseTitle"],
          where: { type: "answer_generated", courseTitle: { not: null } },
          _count: { courseTitle: true },
        }),
        db.analyticsEvent.findMany({
          where: { type: "question_asked", createdAt: { gte: weekStart } },
          select: { createdAt: true },
        }),
        db.analyticsEvent.count({ where: { type: "answer_generated" } }),
      ]);
  } catch (error) {
    console.error("Analytics report unavailable; returning empty report.", error);
    return emptyAnalyticsReport(now);
  }

  const dayCounts = new Map<string, number>();
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(weekStart.getTime() + offset * 24 * 60 * 60 * 1000);
    dayCounts.set(dayKey(date), 0);
  }
  for (const event of weekQuestions) {
    const key = dayKey(event.createdAt);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  return {
    conversations,
    questionsToday,
    fallbackQuestions,
    contactClicks,
    mostAsked: asked
      .filter((row) => row.question)
      .map((row) => ({ label: row.question ?? "", count: row._count.question }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
    mostDiscussed: discussed
      .filter((row) => row.courseTitle)
      .map((row) => ({ label: row.courseTitle ?? "", count: row._count.courseTitle }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
    questionsByDay: [...dayCounts.entries()].map(([label, count]) => ({ label, count })),
    outcomes: [
      { label: "Answers", count: answers },
      { label: "Fallbacks", count: fallbackQuestions },
      { label: "Contact clicks", count: contactClicks },
    ],
  };
}
