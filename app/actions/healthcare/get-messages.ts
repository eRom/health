'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const GetMessagesSchema = z.object({
  associationId: z.string()
})

export async function getMessages(data: z.infer<typeof GetMessagesSchema>) {
  try {
    const session = await requireHealthcareProviderOrAdmin()
    const { associationId } = GetMessagesSchema.parse(data)
    
    // Vérifier que l'association appartient au soignant
    const association = await prisma.patientProviderAssociation.findFirst({
      where: {
        id: associationId,
        providerId: session.user.id,
        status: 'ACCEPTED'
      }
    })
    
    if (!association) {
      throw new Error('Association non trouvée ou non acceptée')
    }
    
    // Récupérer les messages
    const messages = await prisma.providerPatientMessage.findMany({
      where: {
        associationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Marquer les messages du patient comme lus
    await prisma.providerPatientMessage.updateMany({
      where: {
        associationId,
        senderId: { not: session.user.id },
        read: false
      },
      data: {
        read: true
      }
    })
    
    logger.info('[GET_MESSAGES] Retrieved messages', {
      associationId,
      providerId: session.user.id,
      messageCount: messages.length
    })
    
    return messages
  } catch (error) {
    logger.error(error, '[GET_MESSAGES] Error retrieving messages')
    throw error
  }
}
