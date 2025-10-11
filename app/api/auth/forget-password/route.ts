import { sendPasswordResetEmail } from '@/lib/email/send'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { createPasswordResetToken } from '@/lib/security/password-reset'
import { NextRequest, NextResponse } from 'next/server'

const maskEmail = (value: string) => {
  const [user, domain] = value.split('@')
  if (!user || !domain) {
    return value
  }

  if (user.length <= 2) {
    return `${user[0] ?? '*'}*@${domain}`
  }

  return `${user[0]}${'*'.repeat(Math.max(user.length - 2, 1))}${user[user.length - 1]}@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: { message: 'Email is required' } },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        lastPasswordResetRequestAt: true,
        passwordResetRequestCount: true,
        passwordResetRequestResetAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Rate limiting check
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Check if request was made in last 5 minutes
    if (user.lastPasswordResetRequestAt && user.lastPasswordResetRequestAt > fiveMinutesAgo) {
      const waitTime = Math.ceil((user.lastPasswordResetRequestAt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000)
      return NextResponse.json(
        { 
          error: { 
            message: `Veuillez patienter ${Math.ceil(waitTime / 60)} minute(s) avant de réessayer`,
            cooldown: waitTime
          } 
        },
        { status: 429 }
      )
    }

    // Reset count if more than 1 hour has passed
    let requestCount = user.passwordResetRequestCount
    if (!user.passwordResetRequestResetAt || user.passwordResetRequestResetAt < oneHourAgo) {
      requestCount = 0
    }

    // Check if user exceeded hourly limit (3 requests per hour)
    if (requestCount >= 3 && user.passwordResetRequestResetAt && user.passwordResetRequestResetAt > oneHourAgo) {
      const resetTime = new Date(user.passwordResetRequestResetAt.getTime() + 60 * 60 * 1000)
      const waitMinutes = Math.ceil((resetTime.getTime() - now.getTime()) / (60 * 1000))
      return NextResponse.json(
        { 
          error: { 
            message: `Trop de tentatives. Réessayez dans ${waitMinutes} minute(s)`,
            cooldown: waitMinutes * 60
          } 
        },
        { status: 429 }
      )
    }

    const headersList = request.headers
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() ?? headersList.get('x-real-ip') ?? null
    const userAgent = headersList.get('user-agent') ?? null

    const { token, tokenId, expiresAt } = await createPasswordResetToken({
      email,
      ipAddress,
      userAgent,
    })

    // Update user rate limiting fields
    const newCount = requestCount === 0 ? 1 : requestCount + 1
    await prisma.user.update({
      where: { email },
      data: {
        lastPasswordResetRequestAt: now,
        passwordResetRequestCount: newCount,
        passwordResetRequestResetAt: requestCount === 0 ? now : user.passwordResetRequestResetAt,
      },
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail({
      email,
      token,
      tokenId,
      locale: user.locale || 'fr',
    })

    if (!emailResult.success) {
      const errorMessage =
        typeof emailResult.error === 'string' && emailResult.error.length > 0
          ? emailResult.error
          : 'Email dispatch failed'

      logger.error(
        new Error(errorMessage),
        '[FORGET_PASSWORD] Email error',
        { email: maskEmail(email) },
      )
      return NextResponse.json(
        { error: { message: 'Failed to send email' } },
        { status: 500 }
      )
    }

    logger.info('[FORGET_PASSWORD] Reset email dispatched', {
      email: maskEmail(email),
      tokenId,
      expiresAt: expiresAt.toISOString(),
      requestCount: newCount,
    })

    return NextResponse.json({ 
      success: true,
      cooldown: 60 // 60 seconds cooldown for frontend
    })
  } catch (error) {
    logger.error(error, '[FORGET_PASSWORD] Unexpected error')
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
