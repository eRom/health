'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
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
    logger.info('[SESSION_REVOKE] Session revoked', {
      userId: session.user.id,
      sessionId,
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    logger.error(error, '[REVOKE_SESSION] Error')
    return { success: false, error: 'Erreur lors de la révocation de la session' }
  }
}

export async function revokeAllOtherSessions() {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Delete all sessions except current one
    const result = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        NOT: {
          id: session.session.id,
        },
      },
    })

    // Log bulk revocation for audit
    logger.info('[SESSION_REVOKE_ALL] Sessions revoked', {
      userId: session.user.id,
      revokedCount: result.count,
      timestamp: new Date().toISOString(),
    })

    return { success: true, count: result.count }
  } catch (error) {
    logger.error(error, '[REVOKE_ALL_SESSIONS] Error')
    return { success: false, error: 'Erreur lors de la révocation des sessions' }
  }
}
