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

  // 2. Generate fake exercise attempts (30 days of data)
  const exerciseSlugs = [
    // Neuro exercises
    'empan-lettres-audio',
    'empan-chiffres',
    'memoire-travail',
    'attention-soutenue',
    // Ortho exercises
    'diadocociinesie',
    'virelangues',
    'comprehension-verbale',
    'articulation',
  ]

  const now = new Date()
  const attempts = []

  // Generate 3-5 attempts per day for the last 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const attemptsPerDay = Math.floor(Math.random() * 3) + 3 // 3-5 attempts

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

      const exerciseSlug =
        exerciseSlugs[Math.floor(Math.random() * exerciseSlugs.length)]

      // Score: 60-100 with slight improvement over time
      const baseScore = 60 + (30 - daysAgo) * 0.5 // Slight upward trend
      const score =
        Math.min(100, baseScore + Math.random() * 15 - 5) // Random variation

      // Duration: 30s-5min
      const duration = Math.floor(Math.random() * 270) + 30

      attempts.push({
        exerciseSlug,
        userId: user.id,
        score: Math.round(score * 10) / 10, // Round to 1 decimal
        duration,
        completedAt,
        data: {
          // Mock exercise-specific data
          attempts: Math.floor(Math.random() * 10) + 5,
          correctAnswers: Math.floor(score / 10),
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        },
      })
    }
  }

  // Insert all attempts
  const createdAttempts = await prisma.exerciseAttempt.createMany({
    data: attempts,
  })

  console.log(`✅ Created ${createdAttempts.count} exercise attempts`)
  console.log(`📊 Date range: ${attempts[attempts.length - 1].completedAt.toLocaleDateString()} - ${attempts[0].completedAt.toLocaleDateString()}`)

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
