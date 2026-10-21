"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { db, hasDatabaseUrl } from "@/lib/db";

export async function deleteConversationAnalytics(): Promise<void> {
  await requireAdmin();
  if (!hasDatabaseUrl()) {
    revalidatePath("/admin");
    return;
  }
  try {
    await db.analyticsEvent.deleteMany();
    await db.conversationMessage.deleteMany();
    await db.conversation.deleteMany();
  } catch (error) {
    console.error("Failed to delete conversation analytics.", error);
  }
  revalidatePath("/admin");
}
