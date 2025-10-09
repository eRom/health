'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
      await sendAccountDeletedEmail(
        session.user.email,
        session.user.name,
        session.user.locale || "fr"
      );
    } catch (emailError) {
      console.error("[ACCOUNT_DELETION] Email error:", emailError);
      // Don't fail the deletion if email fails
    }

    // Log deletion for audit trail (console log will go to Sentry in production)
    console.log(
      `[ACCOUNT_DELETION] User deleted: ${userId} at ${new Date().toISOString()}`
    );

    return { success: true };
  } catch (error) {
    console.error('[ACCOUNT_DELETION] Error:', error)
    return { success: false, error: 'Erreur lors de la suppression du compte' }
  }
}
