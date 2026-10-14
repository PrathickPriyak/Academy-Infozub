import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import * as XLSX from "xlsx";

export type InquiryRow = {
  name: string;
  phone: string;
  email: string;
  message: string;
  submittedAt: string;
};

const LOCAL_SHEET_PATH = path.join(process.cwd(), "data", "inquiries.xlsx");
const HEADERS = ["Submitted At", "Name", "Phone", "Email", "Message"] as const;

function toSheetRow(row: InquiryRow): string[] {
  return [row.submittedAt, row.name, row.phone, row.email, row.message];
}

async function appendToLocalExcel(row: InquiryRow): Promise<void> {
  await mkdir(path.dirname(LOCAL_SHEET_PATH), { recursive: true });

  let workbook: XLSX.WorkBook;
  try {
    const existing = await readFile(LOCAL_SHEET_PATH);
    workbook = XLSX.read(existing, { type: "buffer" });
  } catch {
    workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([Array.from(HEADERS)]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Inquiries");
  }

  const sheetName = workbook.SheetNames[0] ?? "Inquiries";
  const sheet = workbook.Sheets[sheetName] ?? XLSX.utils.aoa_to_sheet([Array.from(HEADERS)]);
  if (!workbook.Sheets[sheetName]) {
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }

  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
  if (rows.length === 0) {
    rows.push(Array.from(HEADERS));
  }
  rows.push(toSheetRow(row));
  const nextSheet = XLSX.utils.aoa_to_sheet(rows);
  workbook.Sheets[sheetName] = nextSheet;

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  await writeFile(LOCAL_SHEET_PATH, buffer);
}

async function appendToGoogleSheetWebhook(row: InquiryRow, webhookUrl: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
    redirect: "follow",
  });

  const raw = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(raw || `Google Sheets webhook failed (${response.status}).`);
  }

  // Apps Script returns JSON { ok: true } after the redirect hop.
  try {
    const payload = JSON.parse(raw) as { ok?: boolean; error?: string };
    if (payload.ok === false) {
      throw new Error(payload.error || "Google Sheets webhook reported a failure.");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Non-JSON success body is still acceptable if HTTP 200.
      return;
    }
    throw error;
  }
}

/** Infozub academy inquiry sheet webhook (Apps Script). Env var overrides this. */
const DEFAULT_SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbx1p_0Hm4hlljUTOifEsZEp_ecTo-sOfhqY0XEeCGOv_hd2B0MyULZClYRt7YJ389wR8g/exec";

export async function appendInquiry(row: InquiryRow): Promise<{ destination: "google-sheets" | "local-excel" }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim() || DEFAULT_SHEETS_WEBHOOK;

  if (webhookUrl) {
    try {
      await appendToGoogleSheetWebhook(row, webhookUrl);
      return { destination: "google-sheets" };
    } catch (error) {
      // Keep local Excel as a safety net in development if the sheet webhook fails.
      if (process.env.NODE_ENV === "production") throw error;
      console.error("Google Sheets webhook failed; writing local Excel fallback.", error);
    }
  }

  await appendToLocalExcel(row);
  return { destination: "local-excel" };
}
