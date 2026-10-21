import { createAdminToken } from "../src/lib/admin-token";
import { recordAnalyticsEvent } from "../src/lib/analytics/events";
import { redactPersonalDetails } from "../src/lib/analytics/privacy";
import { getAnalyticsReport } from "../src/lib/analytics/report";
import { db } from "../src/lib/db";

async function main() {
  const redacted = redactPersonalDetails("Email me at student@example.com or 9876543210 about Full Stack");
  if (redacted.includes("student@example.com") || redacted.includes("9876543210")) {
    throw new Error(`Personal details were stored: ${redacted}`);
  }

  await db.analyticsEvent.deleteMany();
  await recordAnalyticsEvent({ type: "chat_started" });
  await recordAnalyticsEvent({
    type: "question_asked",
    question: "What is the Full Stack course duration? Email ada@example.com",
  });
  await recordAnalyticsEvent({
    type: "answer_generated",
    courseTitle: "Social Media Marketing Master Course",
  });
  await recordAnalyticsEvent({
    type: "fallback_triggered",
    question: "Who won the cricket match?",
  });
  await recordAnalyticsEvent({ type: "contact_clicked" });

  const report = await getAnalyticsReport();
  if (report.conversations !== 1 || report.questionsToday !== 1 || report.fallbackQuestions !== 1 || report.contactClicks !== 1) {
    throw new Error(`Unexpected counts: ${JSON.stringify(report)}`);
  }
  if (!report.mostAsked[0]?.label.includes("[email]") || report.mostAsked[0].label.includes("ada@example.com")) {
    throw new Error(`Question was not redacted: ${report.mostAsked[0]?.label}`);
  }
  if (report.mostDiscussed[0]?.label !== "Social Media Marketing Master Course") {
    throw new Error("Discussed course was not recorded.");
  }

  const unknown = await fetch("http://127.0.0.1:3000/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "question_asked", question: "secret question" }),
  });
  if (unknown.status !== 400) {
    throw new Error(`Public analytics accepted a question (${unknown.status}).`);
  }

  const contact = await fetch("http://127.0.0.1:3000/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "contact_clicked" }),
  });
  if (contact.status !== 200) {
    throw new Error(`Contact click was not accepted (${contact.status}).`);
  }

  const course = await fetch("http://127.0.0.1:3000/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "course_clicked", courseTitle: "Social Media Marketing Master Course" }),
  });
  if (course.status !== 200) {
    throw new Error(`Course click was not accepted (${course.status}).`);
  }

  await db.analyticsEvent.deleteMany();
  const cleared = await getAnalyticsReport();
  if (cleared.conversations !== 0 || cleared.contactClicks !== 0) {
    throw new Error("Analytics delete left events behind.");
  }

  const token = await createAdminToken();
  const page = await fetch("http://127.0.0.1:3000/infozub-admin", {
    headers: { Cookie: `infozub_admin=${token}` },
  });
  const html = await page.text();
  if (
    page.status !== 200 ||
    !html.includes("Questions today") ||
    !html.includes("Most asked questions") ||
    !html.includes("Most discussed courses") ||
    !html.includes("Delete conversation analytics")
  ) {
    throw new Error(`Analytics dashboard was not rendered (${page.status}).`);
  }

  console.log("analytics ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
