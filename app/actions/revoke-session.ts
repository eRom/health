'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function revokeSession(sessionId: string) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Prevent revoking current session
    if (sessionId === session.session.id) {
      return { success: false, error: 'Impossible de révoquer la session actuelle' }
    }

    // Verify session belongs to user before deleting
    const sessionToRevoke = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!sessionToRevoke) {
      return { success: false, error: 'Session introuvable' }
    }

    if (sessionToRevoke.userId !== session.user.id) {
      return { success: false, error: 'Non autorisé' }
    }

    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId },
    })

    // Log revocation for audit
    console.log(`[SESSION_REVOKE] User ${session.user.id} revoked session ${sessionId} at ${new Date().toISOString()}`)

    return { success: true }
  } catch (error) {
    console.error('[REVOKE_SESSION] Error:', error)
    return { success: false, error: 'Erreur lors de la révocation de la session' }
  }
}
