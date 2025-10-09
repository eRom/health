-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('HEALTH_DATA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "healthDataConsentGrantedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ConsentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ConsentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentHistory_userId_grantedAt_idx" ON "ConsentHistory"("userId", "grantedAt");

-- AddForeignKey
ALTER TABLE "ConsentHistory" ADD CONSTRAINT "ConsentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
