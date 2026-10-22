"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ReindexState {
  processed: number;
  total: number;
  skipped: number;
  embedded: number;
  deleted: number;
  errors: string[];
  status: "idle" | "running" | "success" | "error";
}

const initial: ReindexState = {
  processed: 0,
  total: 0,
  skipped: 0,
  embedded: 0,
  deleted: 0,
  errors: [],
  status: "idle",
};

export function KnowledgeReindex() {
  const [state, setState] = useState<ReindexState>(initial);

  async function updateKnowledge() {
    setState({ ...initial, status: "running" });
    const response = await fetch("/api/infozub-admin/knowledge/reindex", { method: "POST" });
    if (response.status === 401) {
      setState({ ...initial, status: "error", errors: ["Admin sign-in is required."] });
      return;
    }
    if (!response.ok || !response.body) {
      setState({ ...initial, status: "error", errors: ["Update AI knowledge failed."] });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let next: ReindexState = { ...initial, status: "running" };

    while (true) {
      const step = await reader.read();
      if (step.done) {
        break;
      }
      buffer += decoder.decode(step.value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        const line = event
          .split("\n")
          .filter((item) => item.startsWith("data: "))
          .map((item) => item.slice(6))
          .join("");
        if (!line) {
          continue;
        }
        const payload = JSON.parse(line) as {
          type?: string;
          processed?: number;
          total?: number;
          skipped?: number;
          embedded?: number;
          deleted?: number;
          message?: string;
          error?: string;
        };
        next = {
          ...next,
          processed: payload.processed ?? next.processed,
          total: payload.total ?? next.total,
          skipped: payload.skipped ?? next.skipped,
          embedded: payload.embedded ?? next.embedded,
          deleted: payload.deleted ?? next.deleted,
        };
        if (payload.type === "progress" && payload.error) {
          next.errors = [...next.errors, payload.error];
        }
        if (payload.type === "error" && payload.message) {
          next.status = "error";
          next.errors = payload.message.split("\n");
        }
        if (payload.type === "success") {
          next.status = next.errors.length > 0 ? "error" : "success";
        }
        setState({ ...next });
      }
    }
  }

  const percent = state.total > 0 ? Math.round((state.processed / state.total) * 100) : 0;

  return (
    <div className="grid gap-3">
      <Button type="button" onClick={() => void updateKnowledge()} disabled={state.status === "running"}>
        Update AI Knowledge
      </Button>
      {state.status !== "idle" ? (
        <div className="grid gap-2">
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-primary h-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-muted-foreground text-sm">
            Progress {state.processed}/{state.total || "…"} · embedded {state.embedded} · unchanged{" "}
            {state.skipped}
          </p>
          {state.status === "success" ? (
            <p className="text-sm font-medium">
              Success. Regenerated embeddings for {state.embedded} changed documents.
            </p>
          ) : null}
          {state.errors.length > 0 ? (
            <ul className="text-destructive grid gap-1 text-sm">
              {state.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
