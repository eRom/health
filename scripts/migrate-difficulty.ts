/**
 * Migration script: Update all ExerciseAttempt records where data.difficulty = "all" to "easy"
 *
 * Run with: npx tsx scripts/migrate-difficulty.ts
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../lib/logger";

const prisma = new PrismaClient();

async function main() {
  logger.info("🔍 Searching for ExerciseAttempt records with difficulty='all'...");

  // Find all attempts where data.difficulty = "all"
  const attempts = await prisma.exerciseAttempt.findMany({
    where: {
      data: {
        path: ["difficulty"],
        equals: "all",
      },
    },
  });

  logger.info("✅ Found records to update", { count: attempts.length });

  if (attempts.length === 0) {
    logger.info("✨ No records to update. Migration complete!");
    return;
  }

  // Update each record
  let updated = 0;
  for (const attempt of attempts) {
    const currentData = attempt.data as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      difficulty: "easy",
    };

    await prisma.exerciseAttempt.update({
      where: { id: attempt.id },
      data: { data: updatedData },
    });

    updated++;
    if (updated % 10 === 0) {
      logger.info("⏳ Migration progress", {
        updated,
        total: attempts.length,
      });
    }
  }

  logger.info("✅ Migration complete!", {
    updated,
    from: 'all',
    to: 'easy',
  });
}

main()
  .catch((e) => {
    logger.error(e, "❌ Migration failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
