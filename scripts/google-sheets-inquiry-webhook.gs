/**
 * Infozub Academy — Google Sheets inquiry webhook
 *
 * Setup:
 * 1. Create a Google Sheet (or open an existing one).
 * 2. Extensions → Apps Script → paste this file.
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the web app URL into GOOGLE_SHEETS_WEBHOOK_URL in .env / Vercel.
 *
 * Each form submit appends one row: Submitted At | Name | Phone | Email | Message
 */

var SHEET_NAME = "Inquiries";

function ensureSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Submitted At", "Name", "Phone", "Email", "Message"]);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = ensureSheet_();
    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.message || "",
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "infozub-inquiry-webhook" }),
  ).setMimeType(ContentService.MimeType.JSON);
}
