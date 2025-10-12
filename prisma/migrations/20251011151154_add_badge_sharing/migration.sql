-- CreateTable
CREATE TABLE "BadgeShare" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "platform" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BadgeShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BadgeShare_userId_sharedAt_idx" ON "BadgeShare"("userId", "sharedAt");

-- CreateIndex
CREATE INDEX "BadgeShare_badgeType_sharedAt_idx" ON "BadgeShare"("badgeType", "sharedAt");

-- AddForeignKey
ALTER TABLE "BadgeShare" ADD CONSTRAINT "BadgeShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
