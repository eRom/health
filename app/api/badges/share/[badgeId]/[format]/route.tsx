import { IMAGE_TEMPLATES, type ShareFormat } from '@/app/api/badges/templates'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { BADGE_DEFINITIONS } from '@/lib/types/badge'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Removed edge runtime to allow Prisma to work

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ badgeId: string; format: string }> }
) {
  try {
    const { badgeId, format } = await params

    // Validate format
    if (!format || !(format in IMAGE_TEMPLATES)) {
      return new Response('Invalid format', { status: 400 })
    }

    // Fetch badge data with user info
    const badge = await prisma.userBadge.findUnique({
      where: { id: badgeId },
      include: { user: true },
    })

    if (!badge) {
      return new Response('Badge not found', { status: 404 })
    }

    // Get badge definition
    const definition = BADGE_DEFINITIONS[badge.badgeType]
    if (!definition) {
      return new Response('Badge definition not found', { status: 404 })
    }

    // Get template for requested format
    const template = IMAGE_TEMPLATES[format as ShareFormat]

    // Prepare data for image generation
    const imageData = {
      badgeEmoji: definition.emoji,
      badgeName: definition.name,
      userName: badge.user.name || 'Utilisateur',
      earnedDate: badge.earnedAt.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      message: definition.message,
    }

    // Generate image using ImageResponse
    return new ImageResponse(template.generate(imageData), {
      width: template.width,
      height: template.height,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 1 day cache
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    logger.error(error, 'Error generating badge share image')
    return new Response('Internal Server Error', { status: 500 })
  }
}
