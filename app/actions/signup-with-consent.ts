"use server"

import { auth } from "@/lib/auth"
import { checkAndAwardWelcomeBadge } from "@/lib/badges";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { SignupSchema } from "@/lib/schemas/auth"
import { headers } from "next/headers"

export async function signUpWithConsent(data: {
  name: string
  email: string
  password: string
  healthDataConsent: boolean
}) {
  // Vérifier le consentement en premier
  if (!data.healthDataConsent) {
    throw new Error("Consentement requis pour le traitement des données de santé")
  }

  // Validation côté serveur des autres champs
  const validationResult = SignupSchema.safeParse(data)
  
  if (!validationResult.success) {
    throw new Error("Données de formulaire invalides")
  }

  try {
    // Créer l'utilisateur avec better-auth
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    if (!result.user) {
      throw new Error("Erreur lors de la création du compte");
    }

    // Enregistrer le consentement dans ConsentHistory
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
    const userAgent = headersList.get("user-agent");

    await prisma.consentHistory.create({
      data: {
        userId: result.user.id,
        consentType: "HEALTH_DATA",
        granted: true,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    // Mettre à jour le champ de référence rapide
    await prisma.user.update({
      where: { id: result.user.id },
      data: { healthDataConsentGrantedAt: new Date() },
    });

    // Attribuer le badge de bienvenue
    await checkAndAwardWelcomeBadge(result.user.id);

    return { success: true, user: result.user };
  } catch (error) {
    logger.error(error, "Erreur lors de l'inscription avec consentement")
    throw new Error("Erreur lors de la création du compte")
  }
}
