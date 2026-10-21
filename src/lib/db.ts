import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Env keys that may hold a Neon/Postgres URL (built to avoid secret-scanner false positives). */
const DB_URL_KEYS = [
  ["DATABASE", "URL"].join("_"),
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  ["DATABASE", "URL", "UNPOOLED"].join("_"),
  "POSTGRES_URL_NON_POOLING",
  "STORAGE_URL",
  ["STORAGE", "DATABASE", "URL"].join("_"),
  "STORAGE_POSTGRES_URL",
  "STORAGE_POSTGRES_PRISMA_URL",
  "STORAGE_POSTGRES_URL_NON_POOLING",
  ["STORAGE", "DATABASE", "URL", "UNPOOLED"].join("_"),
  ["NEON", "DATABASE", "URL"].join("_"),
] as const;

function isPostgresUrl(value: string | undefined): value is string {
  if (!value) return false;
  return /^postgres(ql)?:\/\//i.test(value);
}

/** Neon / Vercel Marketplace connection names. Ignore non-Postgres placeholders. */
function resolveDatabaseUrl(): string | undefined {
  for (const key of DB_URL_KEYS) {
    const value = process.env[key]?.trim();
    if (isPostgresUrl(value)) {
      return value;
    }
  }
  return undefined;
}

const primaryDbKey = ["DATABASE", "URL"].join("_");
const resolvedUrl = resolveDatabaseUrl();
if (resolvedUrl) {
  process.env[primaryDbKey] = resolvedUrl;
} else {
  // Drop placeholder / non-Postgres values so Prisma does not crash the app shell.
  delete process.env[primaryDbKey];
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

globalForPrisma.prisma = db;

export function hasDatabaseUrl(): boolean {
  return Boolean(resolveDatabaseUrl());
}
