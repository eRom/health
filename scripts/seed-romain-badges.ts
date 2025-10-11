#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRomainAccount() {
  try {
    console.log('🌱 Seeding Romain account with streaks and badges...')

    // Trouver le compte Romain
    const romain = await prisma.user.findUnique({
      where: { email: 'romain.ecarnot@gmail.com' }
    })

    if (!romain) {
      console.log('❌ Compte Romain non trouvé')
      return
    }

    console.log(`✅ Compte trouvé: ${romain.name} (${romain.email})`)

    // Créer des exercices fictifs pour générer des streaks
    const today = new Date()
    const exerciseDates = []

    // Créer des exercices pour les 7 derniers jours (streak de 7)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(10 + Math.random() * 8) // Heure aléatoire entre 10h et 18h
      exerciseDates.push(date)
    }

    // Créer les tentatives d'exercices
    const exerciseAttempts = []
    for (let i = 0; i < exerciseDates.length; i++) {
      const date = exerciseDates[i]
      // Créer 2-4 exercices par jour
      const exercisesPerDay = 2 + Math.floor(Math.random() * 3)
      
      for (let j = 0; j < exercisesPerDay; j++) {
        exerciseAttempts.push({
          exerciseSlug: `test-exercise-${i}-${j}`,
          userId: romain.id,
          score: 70 + Math.random() * 30, // Score entre 70 et 100
          duration: 60 + Math.random() * 120, // Durée entre 60 et 180 secondes
          completedAt: new Date(date.getTime() + j * 30 * 60 * 1000) // +30min entre chaque exercice
        })
      }
    }

    // Insérer les tentatives d'exercices
    await prisma.exerciseAttempt.createMany({
      data: exerciseAttempts,
      skipDuplicates: true
    })

    console.log(`✅ ${exerciseAttempts.length} exercices créés`)

    // Créer les données de streak
    await prisma.streakData.upsert({
      where: { userId: romain.id },
      update: {
        currentStreak: 7,
        longestStreak: 7,
        lastExerciseDate: exerciseDates[0] // Le plus récent
      },
      create: {
        userId: romain.id,
        currentStreak: 7,
        longestStreak: 7,
        lastExerciseDate: exerciseDates[0]
      }
    })

    console.log('✅ Streak de 7 jours créé')

    // Attribuer quelques badges
    const badgesToAward = [
      'WELCOME',
      'FIRST_EXERCISE', 
      'STREAK_3',
      'STREAK_7',
      'VOLUME_10',
      'VOLUME_25'
    ]

    const badgeData = badgesToAward.map(badgeType => ({
      userId: romain.id,
      badgeType: badgeType as any,
      earnedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Dans les 7 derniers jours
    }))

    await prisma.userBadge.createMany({
      data: badgeData,
      skipDuplicates: true
    })

    console.log(`✅ ${badgesToAward.length} badges attribués`)

    // Vérifier le résultat
    const totalExercises = await prisma.exerciseAttempt.count({
      where: { userId: romain.id }
    })

    const streakData = await prisma.streakData.findUnique({
      where: { userId: romain.id }
    })

    const badges = await prisma.userBadge.findMany({
      where: { userId: romain.id }
    })

    console.log('\n🎉 Résumé:')
    console.log(`📊 Total exercices: ${totalExercises}`)
    console.log(`🔥 Streak actuel: ${streakData?.currentStreak}`)
    console.log(`🏆 Badges obtenus: ${badges.length}`)
    console.log(`📅 Dernier exercice: ${streakData?.lastExerciseDate?.toLocaleDateString('fr-FR')}`)

    console.log('\n✅ Romain est maintenant prêt à tester le système de badges !')

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
seedRomainAccount()
