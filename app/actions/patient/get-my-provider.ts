'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function getMyProvider() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      throw new Error('Non authentifié')
    }
    
    // Trouver l'association active du patient
    const association = await prisma.patientProviderAssociation.findFirst({
      where: {
        patientId: session.user.id,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        messages: {
          where: {
            read: false,
            senderId: { not: session.user.id }, // Messages non lus du soignant
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    if (!association) {
      return null
    }
    
    logger.info('[GET_MY_PROVIDER] Retrieved provider info', {
      patientId: session.user.id,
      providerId: association.providerId,
      status: association.status
    })
    
    return {
      id: association.id,
      provider: association.provider,
      status: association.status,
      createdAt: association.createdAt,
      acceptedAt: association.acceptedAt,
      invitationSentAt: association.invitationSentAt,
      stats: {
        unreadMessages: association.messages.length,
        totalMessages: association._count.messages
      }
    }
  } catch (error) {
    logger.error(error, '[GET_MY_PROVIDER] Error retrieving provider')
    throw error
  }
}
