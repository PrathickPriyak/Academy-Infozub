import { createAdminToken, verifyAdminToken } from "../src/lib/admin-token";
import { OllamaProvider } from "../src/lib/ai/providers/ollama";
import { db } from "../src/lib/db";
import { answerConversation } from "../src/lib/knowledge/answer";
import { fallbackMessage } from "../src/lib/knowledge/fallback";

const origin = "http://127.0.0.1:3000";
const failures: string[] = [];

function check(name: string, ok: boolean, detail?: string) {
  if (!ok) {
    failures.push(detail ? `${name}: ${detail}` : name);
  }
  console.log(`${ok ? "pass" : "fail"} ${name}`);
}

async function main() {
  const home = await fetch(origin);
  const headers = home.headers;
  check("secure headers", headers.get("x-frame-options") === "DENY" && headers.get("x-content-type-options") === "nosniff");
  check("content security policy", (headers.get("content-security-policy") ?? "").includes("default-src 'self'"));
  const html = await home.text();
  check("structured data", html.includes("EducationalOrganization"));
  check("open graph", html.includes('property="og:title"') || html.includes("og:title"));

  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  check(
    "robots",
    robots.includes("Disallow: /infozub-admin") && robots.includes("Sitemap:"),
  );
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  check("sitemap", sitemap.includes("/chat") && sitemap.includes("/courses") && sitemap.includes("/contact"));

  const adminApi = await fetch(`${origin}/api/infozub-admin/knowledge/reindex`, { method: "POST" });
  check("admin api protected", adminApi.status === 401);
  const forged = await fetch(`${origin}/infozub-admin`, {
    headers: { Cookie: "infozub_admin=signed-in" },
    redirect: "manual",
  });
  check("forged admin cookie", forged.status === 307 || forged.status === 302);
  const token = await createAdminToken();
  check("signed admin token", await verifyAdminToken(token));
  check("rejected admin token", !(await verifyAdminToken("signed-in")));

  const invalidChat = await fetch(`${origin}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "x".repeat(4000) }] }),
  });
  check("chat input validation", invalidChat.status === 400);

  let limited = 0;
  for (let index = 0; index < 70; index += 1) {
    const response = await fetch(`${origin}/api/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "chat_started" }),
    });
    if (response.status === 429) {
      limited += 1;
    }
  }
  check("analytics rate limit", limited > 0);

  const courses = await db.course.count();
  check("database", courses > 0, `courses=${courses}`);

  const hostel = await answerConversation([{ role: "user", content: "Do you provide hostel accommodation?" }]);
  check("fallback", hostel.fallback && hostel.content === fallbackMessage && hostel.sources.length === 0);

  const followUp = await answerConversation([
    { role: "user", content: "Tell me about the Social Media Marketing course." },
    { role: "assistant", content: "The Social Media Marketing Master Course is offered by Infozub." },
    { role: "user", content: "What is its duration?" },
  ]);
  const followUpText = followUp.content.toLowerCase();
  check(
    "follow-up",
    !followUp.fallback &&
      (followUpText.includes("self-paced, lifetime access") || followUpText.includes("life-time")),
  );

  const previousUrl = process.env.OLLAMA_URL;
  process.env.OLLAMA_URL = "http://127.0.0.1:9";
  let aiFailed = false;
  try {
    await new OllamaProvider().complete({ messages: [{ role: "user", content: "hello" }] });
  } catch {
    aiFailed = true;
  }
  process.env.OLLAMA_URL = previousUrl;
  check("ai error stays on the server", aiFailed);

  const chat = await fetch(`${origin}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "Who won yesterday's cricket match?" }] }),
  });
  const chatBody = await chat.text();
  check("chat fallback api", chat.status === 200 && chatBody.includes('"fallback":true'));
  check("chat does not leak env", !chatBody.includes("DATABASE_URL") && !chatBody.includes("ADMIN_SESSION_SECRET"));

  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
  console.log("production audit ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
