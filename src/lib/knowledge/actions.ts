"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { db, hasDatabaseUrl } from "@/lib/db";
import { z } from "zod";

import type { ActionState } from "@/lib/courses/actions";

const customSchema = z.object({
  title: z.string().trim().min(2).max(160),
  content: z.string().trim().min(2).max(8000),
});

function refresh() {
  revalidatePath("/infozub-admin");
  revalidatePath("/infozub-admin/knowledge");
}

export async function addCustomKnowledge(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (!hasDatabaseUrl()) {
    return { ok: false, message: "Database is not connected. Add Neon Postgres in Vercel Storage first." };
  }
  const parsed = customSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a title and knowledge text." };
  }
  try {
    await db.customKnowledge.create({ data: parsed.data });
  } catch (error) {
    console.error("Failed to save custom knowledge.", error);
    return { ok: false, message: "Could not save custom knowledge. Check the database connection." };
  }
  refresh();
  return { ok: true, message: "Custom knowledge saved. Update AI knowledge to index it." };
}

export async function deleteKnowledge(formData: FormData): Promise<void> {
  await requireAdmin();
  if (!hasDatabaseUrl()) {
    refresh();
    return;
  }
  const chunkId = String(formData.get("chunkId") ?? "");
  const customId = String(formData.get("customId") ?? "");
  try {
    if (customId) {
      await db.customKnowledge.delete({ where: { id: customId } });
    } else if (chunkId) {
      await db.knowledgeChunk.delete({ where: { id: chunkId } });
    }
  } catch (error) {
    console.error("Failed to delete knowledge.", error);
  }
  refresh();
}

export async function listIndexedKnowledge(query: string) {
  await requireAdmin();
  if (!hasDatabaseUrl()) {
    return [];
  }
  const term = query.trim();
  try {
    return await db.knowledgeChunk.findMany({
      where: term
        ? {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { content: { contains: term, mode: "insensitive" } },
              { sourceType: { contains: term, mode: "insensitive" } },
            ],
          }
        : {},
      select: {
        id: true,
        title: true,
        content: true,
        sourceType: true,
        updatedAt: true,
        customKnowledgeId: true,
        course: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("Indexed knowledge list failed.", error);
    return [];
  }
}
