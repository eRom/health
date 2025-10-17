'use server'

import { auth } from '@/lib/auth'
import { trackBadgeShare as trackBadgeSharePostHog } from '@/lib/analytics/track'
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

    // Track the share in database (for audit/compliance)
    await trackBadgeShare(session.user.id, badge.badgeType, platform)

    // Track the share in PostHog (for analytics)
    // Map SharePlatform to PostHog platform types
    const postHogPlatform: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link' =
      platform === 'copy' ? 'copy_link' :
      platform === 'facebook' ? 'facebook' :
      platform === 'twitter' ? 'twitter' :
      platform === 'whatsapp' ? 'whatsapp' :
      'copy_link' // default for 'download', 'native-share', 'instagram', etc.

    await trackBadgeSharePostHog(badgeId, badge.badgeType, postHogPlatform)

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
