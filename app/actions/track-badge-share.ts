'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { SharePlatform } from '@/lib/services/badge-share'
import { trackBadgeShare } from '@/lib/services/badge-share'
import { headers } from 'next/headers'

export async function trackBadgeShareAction(
  badgeId: string,
  platform: SharePlatform
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour partager un badge',
      }
    }

    // Get badge to verify ownership and get badge type
    const { prisma } = await import('@/lib/prisma')
    const badge = await prisma.userBadge.findUnique({
      where: { id: badgeId },
      select: { userId: true, badgeType: true },
    })

    if (!badge) {
      return {
        success: false,
        error: 'Badge non trouvé',
      }
    }

    if (badge.userId !== session.user.id) {
      return {
        success: false,
        error: 'Vous ne pouvez partager que vos propres badges',
      }
    }

    // Track the share
    await trackBadgeShare(session.user.id, badge.badgeType, platform)

    return { success: true }
  } catch (error) {
    logger.error(error, 'Error tracking badge share', {
      badgeId,
      platform,
    })
    return {
      success: false,
      error: 'Erreur lors du tracking du partage',
    }
  }
}
