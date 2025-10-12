import type { ShareFormat } from '@/app/api/badges/templates'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type { UserBadgeWithProgress } from '@/lib/types/badge'
import type { BadgeType } from '@prisma/client'

export type { ShareFormat }

export type SharePlatform = 
  | 'native-share'
  | 'copy'
  | 'download'
  | ShareFormat

export interface BadgeShareData {
  badgeId: string
  format: ShareFormat
  url: string
  text: string
}

/**
 * Track a badge share for analytics
 */
export async function trackBadgeShare(
  userId: string,
  badgeType: BadgeType,
  platform: SharePlatform
): Promise<void> {
  try {
    await prisma.badgeShare.create({
      data: {
        userId,
        badgeType,
        platform,
      },
    })
  } catch (error) {
    logger.error(error, 'Error tracking badge share', {
      userId,
      badgeType,
      platform,
    })
    // Don't throw - tracking failure shouldn't break the share action
  }
}

/**
 * Generate share URL for a badge image
 */
export async function getBadgeShareUrl(
  badgeId: string,
  format: ShareFormat = 'facebook'
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/api/badges/share/${badgeId}/${format}`
}

/**
 * Generate share URL for a badge page
 */
export async function getBadgePageUrl(
  badgeId: string,
  locale: string = 'fr'
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/${locale}/badges/${badgeId}`
}

/**
 * Generate share text for a badge
 */
export async function generateShareText(
  badge: UserBadgeWithProgress,
  locale: string = 'fr'
): Promise<string> {
  const badgeName = badge.definition.name
  const hashtags = locale === 'fr' 
    ? '#HealthInCloud #Rééducation #Badges'
    : '#HealthInCloud #Rehabilitation #Badges'
  
  const message = locale === 'fr'
    ? `Je viens d'obtenir le badge ${badgeName} sur Health In Cloud ! 🎉 ${hashtags}`
    : `I just earned the ${badgeName} badge on Health In Cloud! 🎉 ${hashtags}`
  
  return message
}

/**
 * Get share data for a badge with all formats
 */
export async function getBadgeShareData(
  badge: UserBadgeWithProgress,
  locale: string = 'fr'
): Promise<BadgeShareData[]> {
  const formats: ShareFormat[] = ['facebook', 'whatsapp', 'instagram', 'instagramStory', 'facebookStory', 'twitter']
  const shareText = await generateShareText(badge, locale)
  
  const shareData: BadgeShareData[] = []
  
  for (const format of formats) {
    const url = await getBadgeShareUrl(badge.id, format)
    shareData.push({
      badgeId: badge.id,
      format,
      url,
      text: shareText,
    })
  }
  
  return shareData
}

/**
 * Get share statistics for a user
 */
export async function getUserShareStats(userId: string): Promise<{
  totalShares: number
  sharesByPlatform: Record<string, number>
  sharesByBadge: Record<string, number>
}> {
  try {
    const shares = await prisma.badgeShare.findMany({
      where: { userId },
      select: {
        platform: true,
        badgeType: true,
      },
    })

    const totalShares = shares.length
    const sharesByPlatform: Record<string, number> = {}
    const sharesByBadge: Record<string, number> = {}

    shares.forEach(share => {
      // Count by platform
      const platform = share.platform || 'unknown'
      sharesByPlatform[platform] = (sharesByPlatform[platform] || 0) + 1
      
      // Count by badge type
      sharesByBadge[share.badgeType] = (sharesByBadge[share.badgeType] || 0) + 1
    })

    return {
      totalShares,
      sharesByPlatform,
      sharesByBadge,
    }
  } catch (error) {
    logger.error(error, 'Error getting user share stats', { userId })
    return {
      totalShares: 0,
      sharesByPlatform: {},
      sharesByBadge: {},
    }
  }
}

/**
 * Get most shared badges across all users
 */
export async function getMostSharedBadges(limit: number = 10): Promise<{
  badgeType: BadgeType
  shareCount: number
}[]> {
  try {
    const result = await prisma.badgeShare.groupBy({
      by: ['badgeType'],
      _count: {
        badgeType: true,
      },
      orderBy: {
        _count: {
          badgeType: 'desc',
        },
      },
      take: limit,
    })

    return result.map(item => ({
      badgeType: item.badgeType,
      shareCount: item._count.badgeType,
    }))
  } catch (error) {
    logger.error(error, 'Error getting most shared badges')
    return []
  }
}
