'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SendMessageSchema = z.object({
  associationId: z.string(),
  content: z.string().min(1, 'Le message ne peut pas être vide').max(1000, 'Le message est trop long')
})

export async function sendMessage(data: z.infer<typeof SendMessageSchema>) {
  try {
    const session = await requireHealthcareProviderOrAdmin()
    const { associationId, content } = SendMessageSchema.parse(data)
    
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
    
    // Créer le message
    const message = await prisma.providerPatientMessage.create({
      data: {
        associationId,
        senderId: session.user.id,
        content,
        read: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })
    
    logger.info('[SEND_MESSAGE] Message sent', {
      messageId: message.id,
      associationId,
      providerId: session.user.id,
      patientId: association.patientId
    })
    
    return { success: true, message }
  } catch (error) {
    logger.error(error, '[SEND_MESSAGE] Error sending message')
    throw error
  }
}
