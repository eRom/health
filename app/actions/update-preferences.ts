'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { headers } from 'next/headers'
import { z } from 'zod'

const preferencesSchema = z.object({
  locale: z.enum(['fr', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
})

export async function updatePreferences(data: {
  locale?: 'fr' | 'en'
  theme?: 'light' | 'dark' | 'system'
  emailNotifications?: boolean
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { success: false, error: 'Non authentifié' }
    }

    // Validate input
    const validated = preferencesSchema.parse(data)

    // Update user preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: validated,
    })

    logger.info('[Preferences] Updated', {
      userId: session.user.id,
      preferences: validated,
    })

    return { success: true }
  } catch (error) {
    logger.error(error, '[Preferences] Error updating preferences')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    }
  }
}
