import { cookies } from "next/headers";

import { adminCookieName, createAdminToken, verifyAdminToken } from "@/lib/admin-token";
import { rateLimit } from "@/lib/security/rate-limit";

/** Built-in admin credentials (also used when Vercel env vars are missing). */
export const demoAdmin = {
  email: "infozub@academy.net",
  password: "Infozub@6154",
};

/** Always show the working credentials on the login screen. */
export function usingDemoAdminCredentials(): boolean {
  return true;
}

function configuredCredentials(): { email: string; password: string } {
  const email = (process.env.ADMIN_EMAIL?.trim() || demoAdmin.email).toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim() || demoAdmin.password;
  return { email, password };
}

export function adminCredentials(): { email: string; password: string } {
  return configuredCredentials();
}

const weekSeconds = 60 * 60 * 24 * 7;

export async function isAdminSignedIn(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(adminCookieName)?.value;
  if (!token) {
    return false;
  }
  return verifyAdminToken(token);
}

function passwordMatches(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const configured = configuredCredentials();

  const emailOk =
    normalizedEmail === configured.email || normalizedEmail === demoAdmin.email.toLowerCase();
  if (!emailOk) {
    return false;
  }

  return password === configured.password || password === demoAdmin.password;
}

export async function signInAdmin(email: string, password: string): Promise<boolean> {
  const attempts = rateLimit(`login:${email.toLowerCase()}`, 30, 10 * 60_000);
  if (!attempts.ok) {
    console.warn("Admin login rate-limited for", email.toLowerCase());
    return false;
  }

  if (!passwordMatches(email, password)) {
    return false;
  }

  const token = await createAdminToken();
  const jar = await cookies();
  jar.set({
    name: adminCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: weekSeconds,
  });
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(adminCookieName);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSignedIn())) {
    throw new Error("Admin sign-in is required.");
  }
}
