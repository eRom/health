'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CancelInvitationSchema = z.object({
  associationId: z.string()
})

export async function cancelInvitation(data: z.infer<typeof CancelInvitationSchema>) {
  try {
    const session = await requireHealthcareProviderOrAdmin()
    const { associationId } = CancelInvitationSchema.parse(data)
    
    // Vérifier que l'association appartient au soignant
    const association = await prisma.patientProviderAssociation.findFirst({
      where: {
        id: associationId,
        providerId: session.user.id,
        status: 'PENDING'
      }
    })
    
    if (!association) {
      throw new Error('Invitation non trouvée ou déjà traitée')
    }
    
    // Mettre à jour le status
    await prisma.patientProviderAssociation.update({
      where: { id: associationId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
    
    logger.info('[CANCEL_INVITATION] Invitation cancelled', {
      associationId,
      providerId: session.user.id,
      patientId: association.patientId
    })
    
    return { success: true }
  } catch (error) {
    logger.error(error, '[CANCEL_INVITATION] Error cancelling invitation')
    throw error
  }
}
