import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create demo user using BetterAuth's default hashing
  // First, delete existing user if exists
  await prisma.user.deleteMany({
    where: { email: "romain.ecarnot@gmail.com" },
  });
  console.log("🗑️  Deleted existing user");

  // Create user directly in database with BetterAuth's expected format
  // BetterAuth uses a specific password hash format
  const user = await prisma.user.create({
    data: {
      email: "romain.ecarnot@gmail.com",
      name: "Marie Dupont",
      emailVerified: true,
      locale: "fr",
      theme: "dark",
      emailNotifications: true,
      accounts: {
        create: {
          providerId: "credential",
          accountId: "romain.ecarnot@gmail.com",
          // BetterAuth uses argon2 by default, but we'll use a simple hash for demo
          // In production, BetterAuth will handle this automatically
          password:
            "$2b$10$DT5o.niHONfpcJIA5CdoR.VHcn0FX2VCIyamx5n/.PgYyXj1dmlrK", // "mprnantes" hashed with bcrypt
        },
      },
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // 2. Delete existing attempts for clean slate
  await prisma.exerciseAttempt.deleteMany({
    where: { userId: user.id },
  });
  console.log("🗑️  Deleted existing exercise attempts");

  // 3. Generate fake exercise attempts (120 days of data for "Tout" and "3 mois")
  const exercisesData = [
    // Neuro exercises
    { slug: "empan-lettres", difficulty: "easy", type: "neuro" },
    { slug: "test-corsi", difficulty: "medium", type: "neuro" },
    { slug: "empan-chiffres", difficulty: "easy", type: "neuro" },
    { slug: "memoire-travail", difficulty: "medium", type: "neuro" },
    { slug: "attention-soutenue", difficulty: "hard", type: "neuro" },
    // Ortho exercises
    { slug: "diadocociinesie", difficulty: "medium", type: "ortho" },
    { slug: "virelangues", difficulty: "easy", type: "ortho" },
    { slug: "comprehension-verbale", difficulty: "easy", type: "ortho" },
    { slug: "articulation", difficulty: "medium", type: "ortho" },
    // Ergo exercises
    { slug: "autonomie-quotidienne", difficulty: "easy", type: "ergo" },
    { slug: "motricite-fine", difficulty: "easy", type: "ergo" },
    { slug: "fonctions-cognitives", difficulty: "easy", type: "ergo" },
    // Kine exercises
    { slug: "mobilite-articulaire", difficulty: "easy", type: "kine" },
    { slug: "renforcement-musculaire", difficulty: "easy", type: "kine" },
    { slug: "equilibre", difficulty: "easy", type: "kine" },
  ];

  const now = new Date();
  const attempts = [];

  // Generate 2-6 attempts per day for the last 120 days (4 months)
  for (let daysAgo = 0; daysAgo < 120; daysAgo++) {
    const attemptsPerDay = Math.floor(Math.random() * 5) + 2; // 2-6 attempts

    for (let i = 0; i < attemptsPerDay; i++) {
      const completedAt = new Date(now);
      completedAt.setDate(completedAt.getDate() - daysAgo);

      // For today, use only past hours; for other days, use 8h-20h
      if (daysAgo === 0) {
        const currentHour = now.getHours();
        const maxHour = currentHour > 8 ? currentHour - 1 : 8;
        completedAt.setHours(
          Math.floor(Math.random() * (maxHour - 8)) + 8,
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );
      } else {
        completedAt.setHours(
          Math.floor(Math.random() * 12) + 8, // 8h-20h
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );
      }

      // Pick random exercise with its difficulty and type
      const exercise =
        exercisesData[Math.floor(Math.random() * exercisesData.length)];
      const exerciseSlug = exercise.slug;
      const difficulty = exercise.difficulty;
      const type = exercise.type;

      // Score varies based on difficulty and time (with progression over time)
      let baseScore = 50;

      // Difficulty adjustment
      if (difficulty === "easy") {
        baseScore = 75;
      } else if (difficulty === "medium") {
        baseScore = 65;
      } else if (difficulty === "hard") {
        baseScore = 55;
      } else {
        baseScore = 65; // 'all' difficulty
      }

      // Progressive improvement over time (newer = better)
      const progressionBonus = (120 - daysAgo) * 0.15;

      // Add some variation for realism (sine wave + random)
      const waveVariation = Math.sin(daysAgo / 7) * 5; // Weekly cycles
      const randomVariation = Math.random() * 10 - 5;

      const score = Math.max(
        30,
        Math.min(
          100,
          baseScore + progressionBonus + waveVariation + randomVariation
        )
      );

      // Duration varies by difficulty: easy=2-5min, medium=5-8min, hard=8-12min
      let durationRange = [300, 480]; // medium default (5-8min)
      if (difficulty === "easy") {
        durationRange = [120, 300]; // 2-5min
      } else if (difficulty === "hard") {
        durationRange = [480, 720]; // 8-12min
      }

      const duration = Math.floor(
        Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0]
      );

      attempts.push({
        exerciseSlug,
        userId: user.id,
        score: Math.round(score * 10) / 10,
        duration,
        completedAt,
        data: {
          attempts: Math.floor(Math.random() * 10) + 5,
          correctAnswers: Math.floor(score / 10),
          difficulty,
          type,
        },
      });
    }
  }

  // Insert all attempts
  const createdAttempts = await prisma.exerciseAttempt.createMany({
    data: attempts,
  });

  console.log(`✅ Created ${createdAttempts.count} exercise attempts`);
  console.log(
    `📊 Date range: ${attempts[attempts.length - 1].completedAt.toLocaleDateString()} - ${attempts[0].completedAt.toLocaleDateString()}`
  );

  // Stats breakdown
  const easyCount = attempts.filter((a) => a.data.difficulty === "easy").length;
  const mediumCount = attempts.filter(
    (a) => a.data.difficulty === "medium"
  ).length;
  const hardCount = attempts.filter((a) => a.data.difficulty === "hard").length;

  console.log(`📈 Difficulty breakdown:`);
  console.log(
    `   Easy: ${easyCount} (${((easyCount / attempts.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Medium: ${mediumCount} (${((mediumCount / attempts.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Hard: ${hardCount} (${((hardCount / attempts.length) * 100).toFixed(1)}%)`
  );

  // Type breakdown
  const neuroCount = attempts.filter((a) => a.data.type === "neuro").length;
  const orthoCount = attempts.filter((a) => a.data.type === "ortho").length;
  const kineCount = attempts.filter((a) => a.data.type === "kine").length;
  const ergoCount = attempts.filter((a) => a.data.type === "ergo").length;

  console.log(`📊 Type breakdown:`);
  console.log(
    `   Neuro: ${neuroCount} (${((neuroCount / attempts.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Ortho: ${orthoCount} (${((orthoCount / attempts.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Kine: ${kineCount} (${((kineCount / attempts.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Ergo: ${ergoCount} (${((ergoCount / attempts.length) * 100).toFixed(1)}%)`
  );

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Demo credentials:");
  console.log("   Email: romain.ecarnot@gmail.com");
  console.log("   Password: mprnantes");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
