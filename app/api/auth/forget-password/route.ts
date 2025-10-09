import { sendPasswordResetEmail } from '@/lib/email/send'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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

    // Invalidate old tokens for this email
    await prisma.verification.deleteMany({
      where: {
        identifier: email,
      },
    })

    // Generate new verification token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store verification token
    await prisma.verification.create({
      data: {
        identifier: email,
        value: token,
        expiresAt,
      },
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
    const emailResult = await sendPasswordResetEmail(email, token, user.locale || 'fr')

    if (!emailResult.success) {
      console.error('[FORGET_PASSWORD] Email error:', emailResult.error)
      return NextResponse.json(
        { error: { message: 'Failed to send email' } },
        { status: 500 }
      )
    }

    console.log(`[FORGET_PASSWORD] Email sent to ${email}. Request count: ${newCount}/3`)

    return NextResponse.json({ 
      success: true,
      cooldown: 60 // 60 seconds cooldown for frontend
    })
  } catch (error) {
    console.error('[FORGET_PASSWORD] Error:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
