"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { headers } from "next/headers"

export async function grantConsent() {
  try {
    // Vérifier que l'utilisateur est authentifié
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw new Error("Utilisateur non authentifié")
    }

    // Vérifier si le consentement n'a pas déjà été accordé
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { healthDataConsentGrantedAt: true },
    });

    if (existingUser?.healthDataConsentGrantedAt) {
      throw new Error("Consentement déjà accordé");
    }

    // Capturer les informations de requête
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip")
    const userAgent = headersList.get("user-agent")

    // Créer l'entrée dans ConsentHistory
    await prisma.consentHistory.create({
      data: {
        userId: session.user.id,
        consentType: "HEALTH_DATA",
        granted: true,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    })

    // Mettre à jour le champ de référence rapide
    await prisma.user.update({
      where: { id: session.user.id },
      data: { healthDataConsentGrantedAt: new Date() },
    })

    return { success: true }
  } catch (error) {
    logger.error(error, "Erreur lors de l'octroi du consentement")
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de l'octroi du consentement"
    )
  }
}
