import Link from "next/link";
import { redirect } from "next/navigation";

import { KnowledgeReindex } from "@/components/admin/knowledge-reindex";
import { KnowledgeSearch } from "@/components/admin/knowledge-search";
import { InlineForm } from "@/components/admin/inline-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminSignedIn } from "@/lib/admin-session";
import { addFaq } from "@/lib/courses/actions";
import { listAllCourses } from "@/lib/courses/queries";
import { addCustomKnowledge, deleteKnowledge, listIndexedKnowledge } from "@/lib/knowledge/actions";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdminSignedIn())) {
    redirect("/infozub-admin/login");
  }

  const params = await searchParams;
  const query = params.q ?? "";
  const [chunks, courses] = await Promise.all([
    listIndexedKnowledge(query),
    listAllCourses(),
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <p className="font-display text-lg tracking-tight">Knowledge management</p>
          <Button asChild variant="outline">
            <Link href="/infozub-admin">Dashboard</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Update AI Knowledge</CardTitle>
            <CardDescription>
              Regenerates embeddings only for course information and custom knowledge that changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KnowledgeReindex />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add custom knowledge</CardTitle>
              <CardDescription>Academy notes that are not tied to one course.</CardDescription>
            </CardHeader>
            <CardContent>
              <InlineForm
                action={addCustomKnowledge}
                submitLabel="Add custom knowledge"
                fields={[
                  { name: "title", label: "Title" },
                  { name: "content", label: "Knowledge" },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add FAQ</CardTitle>
              <CardDescription>Attaches a question and answer to a stored course.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {courses.map((course) => (
                <div key={course.id} className="grid gap-2">
                  <p className="text-sm font-medium">{course.title}</p>
                  <InlineForm
                    action={addFaq}
                    submitLabel="Add FAQ"
                    hidden={{ courseId: course.id }}
                    fields={[
                      { name: "question", label: "Question" },
                      { name: "answer", label: "Answer" },
                    ]}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Indexed knowledge</CardTitle>
            <CardDescription>
              {chunks.length} documents{query ? ` matching “${query}”` : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <KnowledgeSearch initialQuery={query} />
            <div className="grid gap-3">
              {chunks.map((chunk) => (
                <div key={chunk.id} className="border-border rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{chunk.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {chunk.sourceType}
                        {chunk.course ? ` · ${chunk.course.title}` : " · Custom"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {chunk.course ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/infozub-admin/courses/${chunk.course.id}`}>Update course</Link>
                        </Button>
                      ) : null}
                      <form action={deleteKnowledge}>
                        <input type="hidden" name="chunkId" value={chunk.id} />
                        {chunk.customKnowledgeId ? (
                          <input type="hidden" name="customId" value={chunk.customKnowledgeId} />
                        ) : null}
                        <Button type="submit" variant="destructive" size="sm">
                          Delete knowledge
                        </Button>
                      </form>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-3 line-clamp-3 text-sm">{chunk.content}</p>
                </div>
              ))}
              {chunks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No indexed knowledge matches that search.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
