'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'

const sendMessageSchema = z.object({
  associationId: z.string().cuid(),
  content: z.string().min(1).max(1000),
})

export async function sendPatientMessage(formData: FormData) {
  const associationId = formData.get('associationId')
  const content = formData.get('content')

  const { associationId: validatedAssociationId, content: validatedContent } = sendMessageSchema.parse({
    associationId,
    content,
  })

  const session = await auth.api.getSession({ headers: await headers() })
  const senderId = session?.user?.id

  if (!senderId) {
    logger.warn('[SEND_PATIENT_MESSAGE] Unauthorized attempt to send message')
    return { success: false, error: 'Non autorisé.' }
  }

  try {
    const association = await prisma.patientProviderAssociation.findUnique({
      where: { id: validatedAssociationId },
    })

    if (!association || association.patientId !== senderId || association.status !== 'ACCEPTED') {
      logger.warn('[SEND_PATIENT_MESSAGE] Association not found, unauthorized or not accepted', { senderId, associationId: validatedAssociationId })
      return { success: false, error: 'Association invalide ou non autorisée.' }
    }

    await prisma.providerPatientMessage.create({
      data: {
        associationId: validatedAssociationId,
        senderId: senderId,
        content: validatedContent,
      },
    })

    logger.info('[SEND_PATIENT_MESSAGE] Message sent', { senderId, associationId: validatedAssociationId })
    return { success: true, message: 'Message envoyé.' }
  } catch (error) {
    logger.error(error, '[SEND_PATIENT_MESSAGE] Failed to send message', { senderId, associationId: validatedAssociationId })
    return { success: false, error: 'Échec de l\'envoi du message.' }
  }
}
