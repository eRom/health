import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import {
    BADGE_DEFINITIONS,
    calculateProgress,
    getBadgeDefinition,
    getNextBadgeInCategory,
    type BadgeStats,
    type NextBadge,
    type UserBadgeWithProgress
} from '@/lib/types/badge'
import type { BadgeType } from '@prisma/client'

/**
 * Check if an exercise attempt is valid for badge attribution
 * Valid: score > 0 AND duration > 30 seconds
 */
export function isValidExerciseForBadge(score: number | null | undefined, duration: number | null | undefined): boolean {
  return (score ?? 0) > 0 && (duration ?? 0) > 30
}

/**
 * Award welcome badge to user after profile completion
 */
export async function checkAndAwardWelcomeBadge(userId: string): Promise<boolean> {
  try {
    // Check if user already has welcome badge
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeType: {
          userId,
          badgeType: 'WELCOME'
        }
      }
    })

    if (existingBadge) {
      return false // Already awarded
    }

    // Award welcome badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeType: 'WELCOME'
      }
    })

    logger.info('[BADGE_AWARDED] Welcome badge', { userId })
    return true
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Welcome badge', { userId })
    return false
  }
}

/**
 * Award first exercise badge
 */
export async function checkAndAwardFirstExerciseBadge(userId: string): Promise<boolean> {
  try {
    // Check if user already has first exercise badge
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeType: {
          userId,
          badgeType: 'FIRST_EXERCISE'
        }
      }
    })

    if (existingBadge) {
      return false // Already awarded
    }

    // Award first exercise badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeType: 'FIRST_EXERCISE'
      }
    })

    logger.info('[BADGE_AWARDED] First exercise badge', { userId })
    return true
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] First exercise badge', { userId })
    return false
  }
}

/**
 * Award volume badges based on total exercises completed
 */
export async function checkAndAwardVolumeBadges(userId: string, totalExercises: number): Promise<BadgeType[]> {
  const awardedBadges: BadgeType[] = []

  try {
    // Get all volume badges that should be awarded
    const volumeBadges: BadgeType[] = [
      'VOLUME_10', 'VOLUME_25', 'VOLUME_50', 'VOLUME_100', 
      'VOLUME_250', 'VOLUME_500', 'VOLUME_1000'
    ]

    for (const badgeType of volumeBadges) {
      const definition = BADGE_DEFINITIONS[badgeType]
      if (!definition.threshold || totalExercises < definition.threshold) {
        continue
      }

      // Check if already awarded
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeType: {
            userId,
            badgeType
          }
        }
      })

      if (!existingBadge) {
        // Award badge
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType
          }
        })

        awardedBadges.push(badgeType)
        logger.info('[BADGE_AWARDED] Volume badge', { userId, badgeType, totalExercises })
      }
    }

    return awardedBadges
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Volume badges', { userId, totalExercises })
    return awardedBadges
  }
}

/**
 * Calculate streak based on exercise attempts
 * Rules: 1 day break allowed, reset after 2+ consecutive days without activity
 */
export async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all valid exercise attempts (score > 0, duration > 30s)
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        userId,
        score: { gt: 0 },
        duration: { gt: 30 }
      },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true }
    })

    if (attempts.length === 0) {
      return 0
    }

    // Get unique dates (day granularity)
    const uniqueDates = Array.from(
      new Set(
        attempts.map(attempt => {
          const date = new Date(attempt.completedAt)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })
      )
    ).sort((a, b) => b - a) // Most recent first

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate streak from today backwards
    for (let i = 0; i < uniqueDates.length; i++) {
      const exerciseDate = new Date(uniqueDates[i])
      const expectedDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))

      // Check if exercise date matches expected date (allowing 1 day break)
      const daysDiff = Math.abs(exerciseDate.getTime() - expectedDate.getTime()) / (24 * 60 * 60 * 1000)
      
      if (daysDiff <= 1) {
        streak++
      } else if (daysDiff > 2) {
        // More than 2 days gap, streak is broken
        break
      }
    }

    return streak
  } catch (error) {
    logger.error(error, '[STREAK_ERROR] Calculate streak', { userId })
    return 0
  }
}

/**
 * Update streak data for user
 */
export async function updateStreakData(userId: string): Promise<void> {
  try {
    const currentStreak = await calculateStreak(userId)
    
    // Get or create streak data
    const streakData = await prisma.streakData.upsert({
      where: { userId },
      update: {
        currentStreak,
        longestStreak: {
          // Update longest streak if current is higher
          increment: currentStreak > 0 ? 0 : 0 // We'll calculate this properly
        },
        lastExerciseDate: new Date()
      },
      create: {
        userId,
        currentStreak,
        longestStreak: currentStreak,
        lastExerciseDate: new Date()
      }
    })

    // Update longest streak if current is higher
    if (currentStreak > streakData.longestStreak) {
      await prisma.streakData.update({
        where: { userId },
        data: { longestStreak: currentStreak }
      })
    }

    logger.info('[STREAK_UPDATED]', { userId, currentStreak })
  } catch (error) {
    logger.error(error, '[STREAK_ERROR] Update streak data', { userId })
  }
}

/**
 * Award streak badges based on current streak
 */
export async function checkAndAwardStreakBadges(userId: string, currentStreak: number): Promise<BadgeType[]> {
  const awardedBadges: BadgeType[] = []

  try {
    // Get all streak badges that should be awarded
    const streakBadges: BadgeType[] = [
      'STREAK_3', 'STREAK_7', 'STREAK_14', 'STREAK_30', 'STREAK_60', 'STREAK_100'
    ]

    for (const badgeType of streakBadges) {
      const definition = BADGE_DEFINITIONS[badgeType]
      if (!definition.threshold || currentStreak < definition.threshold) {
        continue
      }

      // Check if already awarded
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeType: {
            userId,
            badgeType
          }
        }
      })

      if (!existingBadge) {
        // Award badge
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType
          }
        })

        awardedBadges.push(badgeType)
        logger.info('[BADGE_AWARDED] Streak badge', { userId, badgeType, currentStreak })
      }
    }

    return awardedBadges
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Streak badges', { userId, currentStreak })
    return awardedBadges
  }
}

/**
 * Get all badges for a user with progress information
 */
export async function getBadgesByUser(userId: string): Promise<UserBadgeWithProgress[]> {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    })

    return userBadges.map(badge => ({
      id: badge.id,
      badgeType: badge.badgeType,
      earnedAt: badge.earnedAt,
      definition: getBadgeDefinition(badge.badgeType)
    }))
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Get badges by user', { userId })
    return []
  }
}

/**
 * Get next badges to unlock with progress
 */
export async function getNextBadges(userId: string): Promise<NextBadge[]> {
  try {
    const nextBadges: NextBadge[] = []

    // Get user's current stats
    const [userBadges, streakData, totalExercises] = await Promise.all([
      prisma.userBadge.findMany({
        where: { userId },
        select: { badgeType: true }
      }),
      prisma.streakData.findUnique({
        where: { userId },
        select: { currentStreak: true }
      }),
      prisma.exerciseAttempt.count({
        where: {
          userId,
          score: { gt: 0 },
          duration: { gt: 30 }
        }
      })
    ])

    const earnedBadgeTypes = new Set(userBadges.map(b => b.badgeType))
    const currentStreak = streakData?.currentStreak || 0

    // Check next streak badge
    const nextStreakBadge = getNextBadgeInCategory('streak', currentStreak)
    if (nextStreakBadge && !earnedBadgeTypes.has(nextStreakBadge.type)) {
      nextBadges.push({
        definition: nextStreakBadge,
        progress: calculateProgress(currentStreak, nextStreakBadge.threshold || 0)
      })
    }

    // Check next volume badge
    const nextVolumeBadge = getNextBadgeInCategory('volume', totalExercises)
    if (nextVolumeBadge && !earnedBadgeTypes.has(nextVolumeBadge.type)) {
      nextBadges.push({
        definition: nextVolumeBadge,
        progress: calculateProgress(totalExercises, nextVolumeBadge.threshold || 0)
      })
    }

    return nextBadges
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Get next badges', { userId })
    return []
  }
}

/**
 * Get comprehensive badge statistics for user
 */
export async function getBadgeStats(userId: string): Promise<BadgeStats> {
  try {
    const [userBadges, nextBadges] = await Promise.all([
      getBadgesByUser(userId),
      getNextBadges(userId)
    ])

    const totalEarned = userBadges.length
    const totalAvailable = Object.keys(BADGE_DEFINITIONS).length
    const completionPercentage = (totalEarned / totalAvailable) * 100

    return {
      totalEarned,
      totalAvailable,
      completionPercentage,
      nextBadges
    }
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Get badge stats', { userId })
    return {
      totalEarned: 0,
      totalAvailable: Object.keys(BADGE_DEFINITIONS).length,
      completionPercentage: 0,
      nextBadges: []
    }
  }
}

/**
 * Get newly earned badges (for notifications)
 * This would typically be called after badge awarding to show notifications
 */
export async function getNewlyEarnedBadges(userId: string): Promise<UserBadgeWithProgress[]> {
  // This is a simplified version - in a real implementation,
  // you might want to track "newly earned" badges differently
  // For now, we'll return recent badges (last 5 minutes)
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const recentBadges = await prisma.userBadge.findMany({
      where: {
        userId,
        earnedAt: { gte: fiveMinutesAgo }
      },
      orderBy: { earnedAt: 'desc' }
    })

    return recentBadges.map(badge => ({
      id: badge.id,
      badgeType: badge.badgeType,
      earnedAt: badge.earnedAt,
      definition: getBadgeDefinition(badge.badgeType)
    }))
  } catch (error) {
    logger.error(error, '[BADGE_ERROR] Get newly earned badges', { userId })
    return []
  }
}
