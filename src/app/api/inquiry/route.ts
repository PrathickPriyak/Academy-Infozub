import { NextResponse } from "next/server";

import { appendInquiry } from "@/lib/inquiry/sheets";

type InquiryBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
};

const rateMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function asTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body = (await request.json()) as InquiryBody;
    const name = asTrimmedString(body.name, 120);
    const phone = asTrimmedString(body.phone, 40);
    const email = asTrimmedString(body.email, 200);
    const message = asTrimmedString(body.message, 4000);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json({ error: "A valid phone number is required." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await appendInquiry({
      name,
      phone,
      email,
      message,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      destination: result.destination,
      message: "Thanks — your inquiry was saved.",
    });
  } catch (error) {
    console.error("Inquiry submit failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Unable to save your inquiry right now. Please try again." },
      { status: 500 },
    );
  }
}
