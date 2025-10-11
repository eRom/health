import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto"

import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const DEFAULT_TOKEN_TTL_MINUTES = 60
const DEFAULT_MAX_ATTEMPTS = 5

const TOKEN_TTL_MINUTES = Number.parseInt(
  process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? `${DEFAULT_TOKEN_TTL_MINUTES}`,
  10,
)

const TOKEN_MAX_ATTEMPTS = Number.parseInt(
  process.env.PASSWORD_RESET_TOKEN_MAX_ATTEMPTS ?? `${DEFAULT_MAX_ATTEMPTS}`,
  10,
)

const TOKEN_BYTES = 32

interface CreateTokenOptions {
  email: string
  ipAddress?: string | null
  userAgent?: string | null
  expiresAt?: Date
}

export interface PasswordResetTokenRecord {
  id: string
  tokenId?: string | null
  identifier: string
  expiresAt: Date
}

export type PasswordResetTokenStatus =
  | { status: "valid"; record: PasswordResetTokenRecord }
  | { status: "expired" | "not_found" | "too_many_attempts" | "invalid" }

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@")
  if (!user || !domain) {
    return email
  }

  const visibleUser = user.length <= 2 ? user[0] ?? "*" : `${user[0]}${"*".repeat(Math.max(user.length - 2, 1))}${user[user.length - 1]}`
  return `${visibleUser}@${domain}`
}

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

const constantTimeEqualHex = (a: string, b: string) => {
  if (a.length !== b.length) {
    return false
  }

  try {
    const bufferA = Buffer.from(a, "hex")
    const bufferB = Buffer.from(b, "hex")

    if (bufferA.length !== bufferB.length) {
      return false
    }

    return timingSafeEqual(bufferA, bufferB)
  } catch {
    return false
  }
}

export async function createPasswordResetToken({
  email,
  ipAddress,
  userAgent,
  expiresAt,
}: CreateTokenOptions) {
  const effectiveExpiresAt =
    expiresAt ??
    new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000)

  const tokenId = randomUUID()
  const token = randomBytes(TOKEN_BYTES).toString("hex")
  const tokenHash = hashToken(token)

  await prisma.verification.deleteMany({
    where: {
      identifier: email,
      tokenId: {
        not: null,
      },
    },
  })

  await prisma.verification.create({
    data: {
      identifier: email,
      value: tokenHash,
      expiresAt: effectiveExpiresAt,
      tokenId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      attempts: 0,
    },
  })

  logger.info("[PASSWORD_RESET] Token generated", {
    email: maskEmail(email),
    tokenId,
    expiresAt: effectiveExpiresAt.toISOString(),
  })

  return {
    tokenId,
    token,
    expiresAt: effectiveExpiresAt,
  }
}

export async function validatePasswordResetToken({
  tokenId,
  token,
}: {
  tokenId?: string | null
  token: string
}): Promise<PasswordResetTokenStatus> {
  if (!tokenId || !token) {
    return { status: "invalid" }
  }

  const hashedToken = hashToken(token)

  const tokenRecord = await prisma.verification.findUnique({
    where: { tokenId },
  })

  if (!tokenRecord) {
    logger.warn("[PASSWORD_RESET] Token not found", {
      tokenId,
    })
    return { status: "not_found" }
  }

  const attempts = tokenRecord.attempts ?? 0

  if (attempts >= TOKEN_MAX_ATTEMPTS) {
    await prisma.verification.delete({
      where: { id: tokenRecord.id },
    })

    logger.warn("[PASSWORD_RESET] Token locked after max attempts", {
      tokenId: tokenRecord.tokenId ?? tokenId,
      email: maskEmail(tokenRecord.identifier),
    })

    return { status: "too_many_attempts" }
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    await prisma.verification.delete({
      where: { id: tokenRecord.id },
    })

    logger.warn("[PASSWORD_RESET] Token expired", {
      tokenId: tokenRecord.tokenId ?? tokenId,
      email: maskEmail(tokenRecord.identifier),
    })

    return { status: "expired" }
  }

  const storedValue = tokenRecord.value

  const matches = constantTimeEqualHex(storedValue, hashedToken)

  if (!matches) {
    const nextAttempts = attempts + 1

    await prisma.verification.update({
      where: { id: tokenRecord.id },
      data: {
        attempts: nextAttempts,
        lastAttemptAt: new Date(),
      },
    })

    const locked = nextAttempts >= TOKEN_MAX_ATTEMPTS

    if (locked) {
      await prisma.verification.delete({
        where: { id: tokenRecord.id },
      })
    }

    logger.warn("[PASSWORD_RESET] Invalid token attempt", {
      tokenId: tokenRecord.tokenId ?? tokenId,
      email: maskEmail(tokenRecord.identifier),
      attempts: nextAttempts,
    })

    return { status: locked ? "too_many_attempts" : "invalid" }
  }

  await prisma.verification.update({
    where: { id: tokenRecord.id },
    data: {
      lastAttemptAt: new Date(),
      attempts: 0,
    },
  })

  return {
    status: "valid",
    record: {
      id: tokenRecord.id,
      tokenId: tokenRecord.tokenId,
      identifier: tokenRecord.identifier,
      expiresAt: tokenRecord.expiresAt,
    },
  }
}

export async function consumePasswordResetToken({
  tokenId,
  id,
}: {
  tokenId?: string | null
  id: string
}) {
  try {
    if (tokenId) {
      await prisma.verification.delete({
        where: { tokenId },
      })
    } else {
      await prisma.verification.delete({
        where: { id },
      })
    }
  } catch (error) {
    logger.warn("[PASSWORD_RESET] Failed to consume token", {
      tokenId,
      error: error instanceof Error ? error.message : "unknown_error",
    })
  }
}
