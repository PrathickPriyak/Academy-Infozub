import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Neon / Vercel Marketplace connection names when DATABASE_URL is unset. */
function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    // Custom prefix from Vercel Storage connect UI (e.g. STORAGE → STORAGE_URL)
    process.env.STORAGE_URL?.trim() ||
    process.env.STORAGE_DATABASE_URL?.trim() ||
    process.env.STORAGE_POSTGRES_URL?.trim() ||
    process.env.NEON_DATABASE_URL?.trim() ||
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
