-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "exerciseSlug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "duration" INTEGER,
    "data" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_completedAt_idx" ON "ExerciseAttempt"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_exerciseSlug_idx" ON "ExerciseAttempt"("exerciseSlug");

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
