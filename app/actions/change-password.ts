'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  try {
    // Validate input
    const validated = changePasswordSchema.parse(data)

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Get user account with password (credential provider)
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'credential',
      },
    })

    if (!account || !account.password) {
      return { success: false, error: 'Compte sans mot de passe (connexion OAuth)' }
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(validated.currentPassword, account.password)

    if (!isValidPassword) {
      return { success: false, error: 'Mot de passe actuel incorrect' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    // Update password
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    // Revoke all other sessions (keep current one)
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        id: { not: session.session.id },
      },
    })

    // Log password change for audit
    console.log(`[PASSWORD_CHANGE] User ${session.user.id} changed password at ${new Date().toISOString()}`)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation échouée' }
    }
    console.error('[CHANGE_PASSWORD] Error:', error)
    return { success: false, error: 'Erreur lors du changement de mot de passe' }
  }
}
