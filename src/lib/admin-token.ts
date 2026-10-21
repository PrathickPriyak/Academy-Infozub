export const adminCookieName = "infozub_admin";

const encoder = new TextEncoder();
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (value) {
    return value;
  }
  // Allow admin login on Vercel before ADMIN_SESSION_SECRET is configured.
  // Replace with a long random secret in production as soon as possible.
  return "infozub-academy-admin-session-fallback";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createAdminToken(): Promise<string> {
  const payload = bytesToBase64Url(
    encoder.encode(
      JSON.stringify({
        sub: "admin",
        exp: Date.now() + sevenDaysMs,
      }),
    ),
  );
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || token.split(".").length !== 2) {
    return false;
  }

  let expected = "";
  try {
    expected = await hmac(payload);
  } catch {
    return false;
  }

  if (expected.length !== signature.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  if (difference !== 0) {
    return false;
  }

  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      sub?: string;
      exp?: number;
    };
    return data.sub === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
