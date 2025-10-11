'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RemovePatientSchema = z.object({
  associationId: z.string()
})

export async function removePatient(data: z.infer<typeof RemovePatientSchema>) {
  try {
    const session = await requireHealthcareProviderOrAdmin()
    const { associationId } = RemovePatientSchema.parse(data)
    
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
    
    // Mettre à jour le status
    await prisma.patientProviderAssociation.update({
      where: { id: associationId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
    
    logger.info('[REMOVE_PATIENT] Patient removed', {
      associationId,
      providerId: session.user.id,
      patientId: association.patientId
    })
    
    return { success: true }
  } catch (error) {
    logger.error(error, '[REMOVE_PATIENT] Error removing patient')
    throw error
  }
}
