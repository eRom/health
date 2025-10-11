'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { headers } from 'next/headers'

export async function deleteAccount() {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Non authentifié" };
    }

    const userId = session.user.id;

    // Delete user (cascade will delete Account and Session via Prisma schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Send confirmation email AFTER deletion (RGPD compliant)
    try {
      const { sendAccountDeletedEmail } = await import("@/lib/email/send");
      const userLocale =
        (session.user as { locale?: string | null })?.locale ?? "fr";
      await sendAccountDeletedEmail(
        session.user.email,
        session.user.name,
        userLocale
      );
    } catch (emailError) {
    logger.error(emailError, "[ACCOUNT_DELETION] Email error");
      // Don't fail the deletion if email fails
    }

    // Log deletion for audit trail
    logger.info("[ACCOUNT_DELETION] User deleted", {
      userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    logger.error(error, '[ACCOUNT_DELETION] Error')
    return { success: false, error: 'Erreur lors de la suppression du compte' }
  }
}
