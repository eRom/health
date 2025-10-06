-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locale" TEXT DEFAULT 'fr',
ADD COLUMN     "theme" TEXT DEFAULT 'system';
