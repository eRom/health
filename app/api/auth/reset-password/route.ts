import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  consumePasswordResetToken,
  validatePasswordResetToken,
} from "@/lib/security/password-reset"

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  tokenId: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
})

const maskEmail = (value: string) => {
  const [user, domain] = value.split("@")
  if (!user || !domain) {
    return value
  }
  if (user.length <= 2) {
    return `${user[0] ?? "*"}*@${domain}`
  }
  return `${user[0]}${"*".repeat(Math.max(user.length - 2, 1))}${user[user.length - 1]}@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { token, tokenId, newPassword } = resetPasswordSchema.parse(payload)

    const validation = await validatePasswordResetToken({
      tokenId,
      token,
    })

    if (validation.status !== "valid") {
      return NextResponse.json(
        {
          error: {
            message: "Token de réinitialisation invalide ou expiré",
          },
        },
        { status: 400 },
      )
    }

    const resetRecord = validation.record

    const user = await prisma.user.findUnique({
      where: { email: resetRecord.identifier },
      select: { id: true, email: true },
    })

    if (!user) {
      logger.warn("[PASSWORD_RESET] User not found for token", {
        tokenId: resetRecord.tokenId,
        email: maskEmail(resetRecord.identifier),
      })

      await consumePasswordResetToken({
        tokenId: resetRecord.tokenId,
        id: resetRecord.id,
      })

      return NextResponse.json(
        {
          error: {
            message: "Token de réinitialisation invalide ou expiré",
          },
        },
        { status: 400 },
      )
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      select: { id: true },
    })

    if (!account) {
      logger.warn("[PASSWORD_RESET] Credential account missing", {
        userId: user.id,
      })

      return NextResponse.json(
        {
          error: {
            message: "Réinitialisation impossible pour ce compte",
          },
        },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastPasswordResetRequestAt: null,
        passwordResetRequestCount: 0,
        passwordResetRequestResetAt: null,
      },
    })

    await consumePasswordResetToken({
      tokenId: resetRecord.tokenId,
      id: resetRecord.id,
    })

    logger.info("[PASSWORD_RESET] Password updated successfully", {
      userId: user.id,
      tokenId: resetRecord.tokenId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: error.issues[0]?.message ?? "Payload invalide",
          },
        },
        { status: 400 },
      )
    }

    logger.error(error, "[PASSWORD_RESET] Unexpected error")

    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    )
  }
}
