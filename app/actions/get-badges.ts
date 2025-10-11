'use server'

import { auth } from '@/lib/auth'
import { getBadgesByUser, getBadgeStats } from '@/lib/badges'
import { logger } from '@/lib/logger'
import type { BadgeStats, UserBadgeWithProgress } from '@/lib/types/badge'
import { headers } from 'next/headers'

export async function getBadges(): Promise<{
  badges: UserBadgeWithProgress[]
  stats: BadgeStats
}> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id

    // Get user badges and stats
    const [badges, stats] = await Promise.all([
      getBadgesByUser(userId),
      getBadgeStats(userId)
    ])

    logger.info('[GET_BADGES] Retrieved badges', { 
      userId, 
      totalBadges: badges.length,
      completionPercentage: stats.completionPercentage 
    })

    return {
      badges,
      stats
    }
  } catch (error) {
    logger.error(error, '[GET_BADGES] Error retrieving badges')
    throw new Error('Erreur lors de la récupération des badges')
  }
}
