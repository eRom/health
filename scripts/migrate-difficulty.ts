/**
 * Migration script: Update all ExerciseAttempt records where data.difficulty = "all" to "easy"
 *
 * Run with: npx tsx scripts/migrate-difficulty.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Searching for ExerciseAttempt records with difficulty='all'...");

  // Find all attempts where data.difficulty = "all"
  const attempts = await prisma.exerciseAttempt.findMany({
    where: {
      data: {
        path: ["difficulty"],
        equals: "all",
      },
    },
  });

  console.log(`✅ Found ${attempts.length} records to update`);

  if (attempts.length === 0) {
    console.log("✨ No records to update. Migration complete!");
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
      console.log(`⏳ Updated ${updated}/${attempts.length} records...`);
    }
  }

  console.log(`✅ Migration complete! Updated ${updated} records from difficulty='all' to 'easy'`);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
