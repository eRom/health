-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPasswordResetRequestAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetRequestCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordResetRequestResetAt" TIMESTAMP(3);
