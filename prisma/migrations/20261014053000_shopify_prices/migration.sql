-- AlterTable
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "shopifyProductId" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "shopifyVariantId" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "shopifySyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_shopifyProductId_idx" ON "Course"("shopifyProductId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "ShopifySettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeDomain" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifySettings_pkey" PRIMARY KEY ("id")
);
