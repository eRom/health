'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { sendProviderInvitationEmail } from '@/lib/email/send'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const InvitePatientSchema = z.object({
  patientEmail: z.string().email('Email invalide'),
  customMessage: z.string().optional(),
})

export async function invitePatient(data: z.infer<typeof InvitePatientSchema>) {
  try {
    await requireHealthcareProviderOrAdmin()
    
    const { patientEmail, customMessage } = InvitePatientSchema.parse(data)
    
    // Vérifier que le patient existe
    const patient = await prisma.user.findUnique({
      where: { email: patientEmail },
      select: { id: true, name: true, locale: true }
    })
    
    if (!patient) {
      throw new Error('Patient non trouvé avec cette adresse email')
    }
    
    // Vérifier qu'il n'y a pas déjà une association active
    const existingAssociation = await prisma.patientProviderAssociation.findFirst({
      where: {
        patientId: patient.id,
        providerId: (await requireHealthcareProviderOrAdmin()).user.id,
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    })
    
    if (existingAssociation) {
      throw new Error('Ce patient a déjà une association active')
    }
    
    // Générer un token d'invitation unique
    const invitationToken = uuidv4()
    
    // Créer l'association
    const association = await prisma.patientProviderAssociation.create({
      data: {
        patientId: patient.id,
        providerId: (await requireHealthcareProviderOrAdmin()).user.id,
        status: 'PENDING',
        invitationToken,
        invitationSentAt: new Date(),
      }
    })
    
    // Envoyer l'email d'invitation
    const provider = await prisma.user.findUnique({
      where: { id: (await requireHealthcareProviderOrAdmin()).user.id },
      select: { name: true, email: true }
    })
    
    if (!provider) {
      throw new Error('Soignant non trouvé')
    }
    
    const emailResult = await sendProviderInvitationEmail(
      patientEmail,
      provider.name,
      provider.email,
      invitationToken,
      customMessage,
      patient.locale || 'fr'
    )
    
    if (!emailResult.success) {
      // Supprimer l'association si l'email n'a pas pu être envoyé
      await prisma.patientProviderAssociation.delete({
        where: { id: association.id }
      })
      throw new Error(`Erreur lors de l'envoi de l'email: ${emailResult.error}`)
    }
    
    logger.info('[INVITE_PATIENT] Invitation sent successfully', {
      associationId: association.id,
      patientEmail,
      providerId: provider.email,
      invitationToken,
    })
    
    return { success: true, associationId: association.id }
  } catch (error) {
    logger.error(error, '[INVITE_PATIENT] Error inviting patient')
    throw error
  }
}
