import { isAdminSignedIn } from "@/lib/admin-session";
import { reindexKnowledge } from "@/lib/knowledge/reindex";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  if (!(await isAdminSignedIn())) {
    return Response.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        const result = await reindexKnowledge(async (progress) => {
          send({ type: "progress", ...progress });
        });
        if (result.errors.length > 0) {
          send({ type: "error", message: result.errors.join("\n"), ...result });
        }
        send({ type: "success", ...result });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Re-index failed.";
        send({ type: "error", message });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
