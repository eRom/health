'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { DashboardStats, RecentExercise } from '@/lib/types/dashboard'
import { headers } from 'next/headers'

export async function getDashboardStats(): Promise<{
  stats: DashboardStats
  recentExercises: RecentExercise[]
}> {
  // 1. Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // 2. Fetch aggregated stats
  const [totalExercises, aggregations, recentExercises] = await Promise.all([
    // Total count
    prisma.exerciseAttempt.count({
      where: { userId },
    }),

    // Aggregations (total duration, average score)
    prisma.exerciseAttempt.aggregate({
      where: { userId },
      _sum: {
        duration: true,
      },
      _avg: {
        score: true,
      },
    }),

    // Recent exercises (last 5)
    prisma.exerciseAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        exerciseSlug: true,
        score: true,
        duration: true,
        completedAt: true,
      },
    }),
  ])

  // 3. Calculate recent streak (consecutive days with at least 1 exercise)
  const allAttempts = await prisma.exerciseAttempt.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true },
  })

  let recentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get unique dates (day granularity)
  const uniqueDates = Array.from(
    new Set(
      allAttempts.map((attempt) => {
        const date = new Date(attempt.completedAt)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )
  )
    .sort((a, b) => b - a) // Most recent first
    .map((timestamp) => new Date(timestamp))

  // Calculate streak
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (uniqueDates[i].getTime() === expectedDate.getTime()) {
      recentStreak++
    } else {
      break // Streak broken
    }
  }

  // 4. Build response
  const stats: DashboardStats = {
    totalExercises,
    totalDuration: aggregations._sum.duration || 0,
    averageScore: aggregations._avg.score || null,
    recentStreak,
  }

  return {
    stats,
    recentExercises,
  }
}
