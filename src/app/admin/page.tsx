import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { logoutAction } from "@/lib/admin-actions";
import { deleteConversationAnalytics } from "@/lib/analytics/actions";
import { getAnalyticsReport } from "@/lib/analytics/report";
import { isAdminSignedIn } from "@/lib/admin-session";
import { deleteCourse, setPublished } from "@/lib/courses/actions";
import { formatPrice } from "@/lib/courses/present";
import { listAllCourses } from "@/lib/courses/queries";
import { hasDatabaseUrl } from "@/lib/db";
import { getKnowledgeStats } from "@/lib/knowledge/stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminSignedIn())) {
    redirect("/admin/login");
  }

  const [courses, stats, analytics] = await Promise.all([
    listAllCourses(),
    getKnowledgeStats(),
    getAnalyticsReport(),
  ]);
  const published = courses.filter((course) => course.published).length;
  const metrics = [
    ["Total courses", stats.courses],
    ["Total modules", stats.modules],
    ["Total lessons", stats.lessons],
    ["Total FAQs", stats.faqs],
    ["Indexed documents", stats.indexedDocuments],
    ["Total conversations", stats.conversations],
    ["Fallback questions", stats.fallbackQuestions],
  ] as const;

  return (
    <main className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <p className="font-display text-lg tracking-tight">Knowledge dashboard</p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/knowledge">Manage knowledge</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/courses/new">Create course</Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:px-6">
        {!hasDatabaseUrl() ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            Database is not connected on this deploy. Open Vercel → Settings → Environment
            Variables and confirm a Postgres URL exists for Production (name it{" "}
            <code className="font-mono">DATABASE_URL</code>), then Redeploy. Set{" "}
            <code className="font-mono">SEED_ON_DEPLOY=1</code> once to import courses.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value]) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardDescription>Last knowledge update</CardDescription>
              <CardTitle className="text-xl">
                {stats.lastKnowledgeUpdate
                  ? stats.lastKnowledgeUpdate.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Not indexed yet"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <p className="text-muted-foreground text-sm">
          {published} published · {courses.length - published} drafts
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Chatbot analytics</h2>
          <form action={deleteConversationAnalytics}>
            <Button type="submit" variant="destructive">
              Delete conversation analytics
            </Button>
          </form>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Total conversations", analytics.conversations],
            ["Questions today", analytics.questionsToday],
            ["Fallback questions", analytics.fallbackQuestions],
            ["Contact clicks", analytics.contactClicks],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <AnalyticsCharts
          questionsByDay={analytics.questionsByDay}
          mostAsked={analytics.mostAsked}
          mostDiscussed={analytics.mostDiscussed}
          outcomes={analytics.outcomes}
        />
        <div className="grid gap-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>
                    {course.duration} · {formatPrice(course.price, course.currency)} ·{" "}
                    {course.published ? "Published" : "Draft"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/admin/courses/${course.id}`}>Edit</Link>
                  </Button>
                  <form action={setPublished}>
                    <input type="hidden" name="id" value={course.id} />
                    <input
                      type="hidden"
                      name="published"
                      value={course.published ? "false" : "true"}
                    />
                    <Button type="submit" variant="secondary">
                      {course.published ? "Unpublish" : "Publish"}
                    </Button>
                  </form>
                  <form action={deleteCourse}>
                    <input type="hidden" name="id" value={course.id} />
                    <Button type="submit" variant="destructive">
                      Delete
                    </Button>
                  </form>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
