'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { z } from 'zod'

const updateNameSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
})

export async function updateName(data: { name: string }) {
  try {
    // Validate input
    const validated = updateNameSchema.parse(data)

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Update user name
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: validated.name },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('[UPDATE_NAME] Error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}
