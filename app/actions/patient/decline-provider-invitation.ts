'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'

const DeclineInvitationSchema = z.object({
  invitationToken: z.string()
})

export async function declineProviderInvitation(data: z.infer<typeof DeclineInvitationSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      throw new Error('Non authentifié')
    }
    
    const { invitationToken } = DeclineInvitationSchema.parse(data)
    
    // Trouver l'association avec ce token
    const association = await prisma.patientProviderAssociation.findUnique({
      where: {
        invitationToken,
        status: 'PENDING'
      }
    })
    
    if (!association) {
      throw new Error('Invitation non trouvée ou expirée')
    }
    
    // Vérifier que le patient connecté correspond à l'association
    if (association.patientId !== session.user.id) {
      throw new Error('Cette invitation ne vous est pas destinée')
    }
    
    // Refuser l'invitation
    await prisma.patientProviderAssociation.update({
      where: { id: association.id },
      data: {
        status: 'DECLINED',
        updatedAt: new Date()
      }
    })
    
    logger.info('[DECLINE_PROVIDER_INVITATION] Invitation declined', {
      associationId: association.id,
      patientId: session.user.id,
      providerId: association.providerId
    })
    
    return { success: true }
  } catch (error) {
    logger.error(error, '[DECLINE_PROVIDER_INVITATION] Error declining invitation')
    throw error
  }
}
