'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'

const AcceptInvitationSchema = z.object({
  invitationToken: z.string()
})

export async function acceptProviderInvitation(data: z.infer<typeof AcceptInvitationSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      throw new Error('Non authentifié')
    }
    
    const { invitationToken } = AcceptInvitationSchema.parse(data)
    
    // Trouver l'association avec ce token
    const association = await prisma.patientProviderAssociation.findUnique({
      where: {
        invitationToken,
        status: 'PENDING'
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!association) {
      throw new Error('Invitation non trouvée ou expirée')
    }
    
    // Vérifier que le patient connecté correspond à l'association
    if (association.patientId !== session.user.id) {
      throw new Error('Cette invitation ne vous est pas destinée')
    }
    
    // Vérifier que l'invitation n'est pas trop ancienne (7 jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    if (association.invitationSentAt && association.invitationSentAt < sevenDaysAgo) {
      // Marquer comme expirée
      await prisma.patientProviderAssociation.update({
        where: { id: association.id },
        data: { status: 'CANCELLED' }
      })
      throw new Error('Cette invitation a expiré')
    }
    
    // Accepter l'invitation
    await prisma.patientProviderAssociation.update({
      where: { id: association.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    logger.info('[ACCEPT_PROVIDER_INVITATION] Invitation accepted', {
      associationId: association.id,
      patientId: session.user.id,
      providerId: association.providerId
    })
    
    return { 
      success: true, 
      provider: association.provider,
      associationId: association.id 
    }
  } catch (error) {
    logger.error(error, '[ACCEPT_PROVIDER_INVITATION] Error accepting invitation')
    throw error
  }
}
