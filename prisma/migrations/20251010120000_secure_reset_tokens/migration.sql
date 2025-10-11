-- Add secure password reset token metadata
ALTER TABLE "Verification"
  ADD COLUMN "tokenId" TEXT,
  ADD COLUMN "ipAddress" TEXT,
  ADD COLUMN "userAgent" TEXT,
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastAttemptAt" TIMESTAMP(3);

-- Ensure tokenId uniqueness when present
CREATE UNIQUE INDEX "Verification_tokenId_key" ON "Verification"("tokenId");
