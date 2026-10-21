import { createAdminToken } from "../src/lib/admin-token";
import { db } from "../src/lib/db";
import { getKnowledgeStats } from "../src/lib/knowledge/stats";
import { reindexKnowledge } from "../src/lib/knowledge/reindex";

async function main() {
const faq = await db.faq.findFirst({
  where: { course: { slug: "social-media-marketing" } },
});
if (!faq) {
  throw new Error("Expected a Social Media Marketing FAQ.");
}

const original = faq.answer;
const changed = `${original} Cohort note for the knowledge index.`;
await db.faq.update({ where: { id: faq.id }, data: { answer: changed } });
const changedRun = await reindexKnowledge();
if (changedRun.embedded !== 1) {
  throw new Error(`Expected 1 changed FAQ embedding, got ${changedRun.embedded}.`);
}

await db.faq.update({ where: { id: faq.id }, data: { answer: original } });
const restored = await reindexKnowledge();
if (restored.embedded !== 1) {
  throw new Error(`Expected the restored FAQ to re-embed once, got ${restored.embedded}.`);
}

const custom = await db.customKnowledge.create({
  data: {
    title: "Campus visiting hours",
    content: "Infozub campus visiting hours are weekdays from 10:00 to 17:00 by appointment.",
  },
});
const customRun = await reindexKnowledge();
if (customRun.embedded !== 1) {
  throw new Error(`Expected 1 custom embedding, got ${customRun.embedded}.`);
}
await db.customKnowledge.delete({ where: { id: custom.id } });
const remainingCustom = await db.knowledgeChunk.count({
  where: { customKnowledgeId: custom.id },
});
if (remainingCustom !== 0) {
  throw new Error("Deleting custom knowledge left indexed chunks behind.");
}
const removed = await reindexKnowledge();
if (removed.embedded !== 0) {
  throw new Error(`Expected no new embeddings after custom removal, got ${removed.embedded}.`);
}

const token = await createAdminToken();
const response = await fetch("http://127.0.0.1:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Who won yesterday's cricket match?" }],
  }),
});
const body = await response.text();
if (response.status !== 200 || !body.includes('"fallback":true')) {
  throw new Error(`Cricket question did not return the fallback (${response.status}): ${body.slice(0, 180)}`);
}

const stats = await getKnowledgeStats();
if (stats.fallbackQuestions < 1 || stats.conversations < 1) {
  throw new Error(`Stats missing conversation data: ${JSON.stringify(stats)}`);
}
if (stats.indexedDocuments < 1 || !stats.lastKnowledgeUpdate) {
  throw new Error("Indexed documents or last update missing.");
}

const dashboard = await fetch("http://127.0.0.1:3000/infozub-admin", {
  headers: { Cookie: `infozub_admin=${token}` },
});
const html = await dashboard.text();
if (dashboard.status !== 200 || !html.includes("Total courses") || !html.includes("Fallback questions")) {
  throw new Error(`Dashboard was not available to a signed admin (${dashboard.status}).`);
}

const knowledgePage = await fetch("http://127.0.0.1:3000/infozub-admin/knowledge", {
  headers: { Cookie: `infozub_admin=${token}` },
});
const knowledgeHtml = await knowledgePage.text();
if (
  knowledgePage.status !== 200 ||
  !knowledgeHtml.includes("Update AI Knowledge") ||
  !knowledgeHtml.includes("Add custom knowledge")
) {
  throw new Error(`Knowledge management page was not available (${knowledgePage.status}).`);
}

const reindex = await fetch("http://127.0.0.1:3000/api/infozub-admin/knowledge/reindex", {
  method: "POST",
  headers: { Cookie: `infozub_admin=${token}` },
});
const reindexBody = await reindex.text();
if (reindex.status !== 200 || !reindexBody.includes('"type":"success"')) {
  throw new Error(`Signed reindex failed (${reindex.status}).`);
}

console.log(
  JSON.stringify({
    courses: stats.courses,
    modules: stats.modules,
    lessons: stats.lessons,
    faqs: stats.faqs,
    indexedDocuments: stats.indexedDocuments,
    conversations: stats.conversations,
    fallbackQuestions: stats.fallbackQuestions,
    lastKnowledgeUpdate: stats.lastKnowledgeUpdate,
  }),
);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
