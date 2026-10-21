import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Prefer Neon / Vercel Marketplace connection names when DATABASE_URL is unset. */
function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    undefined
  );
}

const resolvedUrl = resolveDatabaseUrl();
if (resolvedUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolvedUrl;
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
