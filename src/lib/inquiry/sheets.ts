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

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Google Sheets webhook failed (${response.status}).`);
  }
}

export async function appendInquiry(row: InquiryRow): Promise<{ destination: "google-sheets" | "local-excel" }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();

  if (webhookUrl) {
    await appendToGoogleSheetWebhook(row, webhookUrl);
    return { destination: "google-sheets" };
  }

  // Local Excel fallback for development / preview when no webhook is configured.
  await appendToLocalExcel(row);
  return { destination: "local-excel" };
}
