#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

async function seedDemoPatient() {
  try {
    console.log('🌱 Creating demo patient account...\n')

    const email = 'demo-patient@healthincloud.app'
    const password = 'demo-patient'
    const name = 'Patient Demo'

    // 1. Delete existing user if exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    })

    if (existingUser) {
      // Delete Stripe subscription if exists
      if (existingUser.subscription?.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(existingUser.subscription.stripeSubscriptionId)
          console.log('🗑️  Deleted existing Stripe subscription')
        } catch (err) {
          console.log('⚠️  Could not delete Stripe subscription (may not exist)')
        }
      }

      // Delete user (cascades to all related data)
      await prisma.user.delete({ where: { email } })
      console.log('🗑️  Deleted existing user and all related data\n')
    }

    // 2. Hash password using Better Auth's hash function
    const hashedPassword = await hashPassword(password)
    console.log('🔐 Password hashed with Better Auth')

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        locale: 'fr',
        theme: 'dark',
        themeStyle: 'default',
        emailNotifications: true,
        healthDataConsentGrantedAt: new Date(),
        accounts: {
          create: {
            providerId: 'credential',
            accountId: email,
            password: hashedPassword,
          },
        },
      },
    })

    console.log(`✅ User created: ${user.name} (${user.email})`)

    // 4. Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    })

    console.log(`✅ Stripe customer created: ${customer.id}`)

    // 5. Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    })

    // 6. Attach a test payment method to the customer
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Test card that always succeeds
      },
    })

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    })

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    })

    console.log(`✅ Test payment method attached: ${paymentMethod.id}`)

    // 7. Create annual subscription in Stripe (no trial)
    const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY!

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: yearlyPriceId }],
      trial_period_days: 0, // No trial
      default_payment_method: paymentMethod.id,
      metadata: {
        userId: user.id,
      },
    })

    console.log(`✅ Stripe subscription created: ${subscription.id} (ACTIVE)`)

    // 8. Save subscription to database
    const now = new Date()
    const oneYearLater = new Date()
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        stripePriceId: yearlyPriceId,
        stripeProductId: process.env.STRIPE_PRODUCT_ID,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: oneYearLater,
        cancelAtPeriodEnd: false,
      },
    })

    console.log('✅ Subscription saved to database (ACTIVE, annual)\n')

    // 8. Generate exercise attempts (120 days of realistic data)
    console.log('📊 Generating exercise data (120 days)...')

    const exercisesData = [
      // Neuro exercises (40%)
      { slug: 'empan-lettres', difficulty: 'easy', type: 'neuro' },
      { slug: 'test-corsi', difficulty: 'medium', type: 'neuro' },
      { slug: 'empan-chiffres', difficulty: 'easy', type: 'neuro' },
      { slug: 'memoire-travail', difficulty: 'medium', type: 'neuro' },
      { slug: 'attention-soutenue', difficulty: 'hard', type: 'neuro' },
      { slug: 'planification', difficulty: 'hard', type: 'neuro' },
      { slug: 'flexibilite-cognitive', difficulty: 'medium', type: 'neuro' },
      // Ortho exercises (30%)
      { slug: 'diadocociinesie', difficulty: 'medium', type: 'ortho' },
      { slug: 'virelangues', difficulty: 'easy', type: 'ortho' },
      { slug: 'comprehension-verbale', difficulty: 'easy', type: 'ortho' },
      { slug: 'articulation', difficulty: 'medium', type: 'ortho' },
      { slug: 'phonologie', difficulty: 'hard', type: 'ortho' },
      // Ergo exercises (15%)
      { slug: 'autonomie-quotidienne', difficulty: 'easy', type: 'ergo' },
      { slug: 'motricite-fine', difficulty: 'medium', type: 'ergo' },
      { slug: 'fonctions-cognitives', difficulty: 'medium', type: 'ergo' },
      // Kine exercises (15%)
      { slug: 'mobilite-articulaire', difficulty: 'easy', type: 'kine' },
      { slug: 'renforcement-musculaire', difficulty: 'medium', type: 'kine' },
      { slug: 'equilibre', difficulty: 'hard', type: 'kine' },
    ]

    const today = new Date()
    const attempts = []

    // Generate 3-5 attempts per day for the last 120 days
    for (let daysAgo = 0; daysAgo < 120; daysAgo++) {
      const attemptsPerDay = Math.floor(Math.random() * 3) + 3 // 3-5 attempts

      for (let i = 0; i < attemptsPerDay; i++) {
        const completedAt = new Date(today)
        completedAt.setDate(completedAt.getDate() - daysAgo)

        // Random time between 8h-20h
        if (daysAgo === 0) {
          const currentHour = today.getHours()
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

        // Pick random exercise
        const exercise = exercisesData[Math.floor(Math.random() * exercisesData.length)]
        const { slug: exerciseSlug, difficulty, type } = exercise

        // Calculate score with progression (better over time)
        let baseScore = 50
        if (difficulty === 'easy') baseScore = 75
        else if (difficulty === 'medium') baseScore = 65
        else if (difficulty === 'hard') baseScore = 55

        // Progressive improvement (newer = better)
        const progressionBonus = (120 - daysAgo) * 0.15

        // Weekly cycles for realism
        const waveVariation = Math.sin(daysAgo / 7) * 5
        const randomVariation = Math.random() * 10 - 5

        const score = Math.max(
          30,
          Math.min(100, baseScore + progressionBonus + waveVariation + randomVariation)
        )

        // Duration varies by difficulty
        let durationRange = [300, 480] // medium: 5-8min
        if (difficulty === 'easy') durationRange = [120, 300] // 2-5min
        else if (difficulty === 'hard') durationRange = [480, 720] // 8-12min

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
            type,
          },
        })
      }
    }

    // Insert all attempts
    const createdAttempts = await prisma.exerciseAttempt.createMany({
      data: attempts,
    })

    console.log(`✅ Created ${createdAttempts.count} exercise attempts`)

    // Stats
    const stats = {
      easy: attempts.filter((a) => a.data.difficulty === 'easy').length,
      medium: attempts.filter((a) => a.data.difficulty === 'medium').length,
      hard: attempts.filter((a) => a.data.difficulty === 'hard').length,
      neuro: attempts.filter((a) => a.data.type === 'neuro').length,
      ortho: attempts.filter((a) => a.data.type === 'ortho').length,
      ergo: attempts.filter((a) => a.data.type === 'ergo').length,
      kine: attempts.filter((a) => a.data.type === 'kine').length,
    }

    console.log(`   - Difficulty: ${stats.easy} easy, ${stats.medium} medium, ${stats.hard} hard`)
    console.log(`   - Types: ${stats.neuro} neuro, ${stats.ortho} ortho, ${stats.ergo} ergo, ${stats.kine} kine`)

    // 9. Award badges based on volume
    console.log('\n🏆 Awarding badges...')

    const totalExercises = attempts.length
    const badgesToAward: string[] = [
      'WELCOME',
      'FIRST_EXERCISE',
      'STREAK_3',
      'STREAK_7',
    ]

    if (totalExercises >= 10) badgesToAward.push('VOLUME_10')
    if (totalExercises >= 25) badgesToAward.push('VOLUME_25')
    if (totalExercises >= 50) badgesToAward.push('VOLUME_50')
    if (totalExercises >= 100) badgesToAward.push('VOLUME_100')
    if (totalExercises >= 250) badgesToAward.push('VOLUME_250')

    const badgeData = badgesToAward.map((badgeType, index) => ({
      userId: user.id,
      badgeType: badgeType as any,
      earnedAt: new Date(Date.now() - (badgesToAward.length - index) * 24 * 60 * 60 * 1000), // Stagger dates
    }))

    await prisma.userBadge.createMany({
      data: badgeData,
    })

    console.log(`✅ Awarded ${badgesToAward.length} badges: ${badgesToAward.join(', ')}`)

    // 10. Create streak data
    await prisma.streakData.create({
      data: {
        userId: user.id,
        currentStreak: 7,
        longestStreak: 14,
        lastExerciseDate: today,
      },
    })

    console.log('✅ Streak data created (current: 7 days, longest: 14 days)')

    // Final summary
    console.log('\n🎉 Demo patient created successfully!\n')
    console.log('📋 Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👤 User: ${name}`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`💳 Subscription: ACTIVE (Annual, ${oneYearLater.toLocaleDateString('fr-FR')})`)
    console.log(`📊 Exercises: ${totalExercises}`)
    console.log(`🏆 Badges: ${badgesToAward.length}`)
    console.log(`🔥 Streak: 7 days`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✅ Ready for demo!\n')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute
seedDemoPatient()
