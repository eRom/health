import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create demo user
  const hashedPassword = await hash('mprnantes', 10)

  const user = await prisma.user.upsert({
    where: { email: 'romain.ecarnot@gmail.com' },
    update: {
      emailVerified: true,
      name: 'Marie Dupont',
    },
    create: {
      email: 'romain.ecarnot@gmail.com',
      name: 'Marie Dupont',
      emailVerified: true,
      locale: 'fr',
      theme: 'dark',
      emailNotifications: true,
      accounts: {
        create: {
          providerId: 'credential',
          accountId: 'romain.ecarnot@gmail.com',
          password: hashedPassword,
        },
      },
    },
  })

  console.log(`✅ User created/updated: ${user.email}`)

  // 2. Delete existing attempts for clean slate
  await prisma.exerciseAttempt.deleteMany({
    where: { userId: user.id },
  })
  console.log('🗑️  Deleted existing exercise attempts')

  // 3. Generate fake exercise attempts (120 days of data for "Tout" and "3 mois")
  const exercisesData = [
    // Neuro exercises
    { slug: 'empan-lettres', difficulty: 'easy' },
    { slug: 'test-corsi', difficulty: 'medium' },
    { slug: 'empan-chiffres', difficulty: 'easy' },
    { slug: 'memoire-travail', difficulty: 'medium' },
    { slug: 'attention-soutenue', difficulty: 'hard' },
    // Ortho exercises
    { slug: 'diadocociinesie', difficulty: 'medium' },
    { slug: 'virelangues', difficulty: 'hard' },
    { slug: 'comprehension-verbale', difficulty: 'easy' },
    { slug: 'articulation', difficulty: 'medium' },
  ]

  const now = new Date()
  const attempts = []

  // Generate 2-6 attempts per day for the last 120 days (4 months)
  for (let daysAgo = 0; daysAgo < 120; daysAgo++) {
    const attemptsPerDay = Math.floor(Math.random() * 5) + 2 // 2-6 attempts

    for (let i = 0; i < attemptsPerDay; i++) {
      const completedAt = new Date(now)
      completedAt.setDate(completedAt.getDate() - daysAgo)

      // For today, use only past hours; for other days, use 8h-20h
      if (daysAgo === 0) {
        const currentHour = now.getHours()
        const maxHour = currentHour > 8 ? currentHour - 1 : 8
        completedAt.setHours(
          Math.floor(Math.random() * (maxHour - 8)) + 8,
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        )
      } else {
        completedAt.setHours(
          Math.floor(Math.random() * 12) + 8, // 8h-20h
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        )
      }

      // Pick random exercise with its difficulty
      const exercise = exercisesData[Math.floor(Math.random() * exercisesData.length)]
      const exerciseSlug = exercise.slug
      const difficulty = exercise.difficulty

      // Score varies based on difficulty and time (with progression over time)
      let baseScore = 50

      // Difficulty adjustment
      if (difficulty === 'easy') {
        baseScore = 75
      } else if (difficulty === 'medium') {
        baseScore = 65
      } else if (difficulty === 'hard') {
        baseScore = 55
      } else {
        baseScore = 65 // 'all' difficulty
      }

      // Progressive improvement over time (newer = better)
      const progressionBonus = (120 - daysAgo) * 0.15

      // Add some variation for realism (sine wave + random)
      const waveVariation = Math.sin(daysAgo / 7) * 5 // Weekly cycles
      const randomVariation = Math.random() * 10 - 5

      const score = Math.max(
        30,
        Math.min(100, baseScore + progressionBonus + waveVariation + randomVariation)
      )

      // Duration varies by difficulty: easy=2-5min, medium=5-8min, hard=8-12min
      let durationRange = [300, 480] // medium default (5-8min)
      if (difficulty === 'easy') {
        durationRange = [120, 300] // 2-5min
      } else if (difficulty === 'hard') {
        durationRange = [480, 720] // 8-12min
      }

      const duration = Math.floor(
        Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0]
      )

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
        },
      })
    }
  }

  // Insert all attempts
  const createdAttempts = await prisma.exerciseAttempt.createMany({
    data: attempts,
  })

  console.log(`✅ Created ${createdAttempts.count} exercise attempts`)
  console.log(
    `📊 Date range: ${attempts[attempts.length - 1].completedAt.toLocaleDateString()} - ${attempts[0].completedAt.toLocaleDateString()}`
  )

  // Stats breakdown
  const easyCount = attempts.filter((a) => a.data.difficulty === 'easy').length
  const mediumCount = attempts.filter((a) => a.data.difficulty === 'medium').length
  const hardCount = attempts.filter((a) => a.data.difficulty === 'hard').length

  console.log(`📈 Difficulty breakdown:`)
  console.log(`   Easy: ${easyCount} (${((easyCount / attempts.length) * 100).toFixed(1)}%)`)
  console.log(
    `   Medium: ${mediumCount} (${((mediumCount / attempts.length) * 100).toFixed(1)}%)`
  )
  console.log(`   Hard: ${hardCount} (${((hardCount / attempts.length) * 100).toFixed(1)}%)`)

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📝 Demo credentials:')
  console.log('   Email: romain.ecarnot@gmail.com')
  console.log('   Password: mprnantes')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
