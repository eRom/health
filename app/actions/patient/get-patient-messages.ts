'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'

const getMessagesSchema = z.object({
  associationId: z.string().cuid(),
})

export async function getPatientMessages({ associationId }: { associationId: string }) {
  const { associationId: validatedAssociationId } = getMessagesSchema.parse({ associationId })

  const session = await auth.api.getSession({ headers: await headers() })
  const patientId = session?.user?.id

  if (!patientId) {
    logger.warn('[GET_PATIENT_MESSAGES] Unauthorized attempt to get messages')
    throw new Error('Non autorisé.')
  }

  try {
    const association = await prisma.patientProviderAssociation.findUnique({
      where: { id: validatedAssociationId },
    })

    if (!association || association.patientId !== patientId || association.status !== 'ACCEPTED') {
      logger.warn('[GET_PATIENT_MESSAGES] Association not found, unauthorized or not accepted', { patientId, associationId: validatedAssociationId })
      throw new Error('Association invalide ou non autorisée.')
    }

    const messages = await prisma.providerPatientMessage.findMany({
      where: { associationId: validatedAssociationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    // Mark messages sent by the provider as read by the patient
    await prisma.providerPatientMessage.updateMany({
      where: {
        associationId: validatedAssociationId,
        senderId: association.providerId,
        read: false,
      },
      data: {
        read: true,
      },
    })

    logger.info('[GET_PATIENT_MESSAGES] Fetched messages for association', { patientId, associationId: validatedAssociationId, count: messages.length })
    return messages
  } catch (error) {
    logger.error(error, '[GET_PATIENT_MESSAGES] Failed to fetch messages', { patientId, associationId: validatedAssociationId })
    throw new Error('Échec de la récupération des messages.')
  }
}
