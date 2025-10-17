import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendTrialEndingEmail,
  sendTrialEndedEmail,
  sendRenewalReminderEmail,
} from '@/lib/email'

/**
 * Cron job pour envoyer les notifications d'abonnement
 *
 * Déclenché quotidiennement par Vercel Cron
 * Envoie :
 * - Rappels de fin d'essai (3 jours avant)
 * - Notifications d'essai terminé
 * - Rappels de renouvellement (7 jours avant)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    trialEndingReminders: 0,
    trialEndedNotifications: 0,
    renewalReminders: 0,
    errors: [] as string[],
  }

  try {
    const now = new Date()

    // 1. Send trial ending reminders (3 days before end)
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    threeDaysFromNow.setHours(23, 59, 59, 999)

    const threeDaysStart = new Date(threeDaysFromNow)
    threeDaysStart.setHours(0, 0, 0, 0)

    const trialsEndingSoon = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        trialEnd: {
          gte: threeDaysStart,
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            locale: true,
          },
        },
      },
    })

    for (const subscription of trialsEndingSoon) {
      try {
        if (!subscription.trialEnd) continue

        const daysLeft = Math.ceil(
          (subscription.trialEnd.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )

        await sendTrialEndingEmail({
          to: subscription.user.email,
          userName: subscription.user.name,
          daysLeft,
          locale: (subscription.user.locale as 'fr' | 'en') || 'fr',
        })

        results.trialEndingReminders++
      } catch (error) {
        console.error(
          `Error sending trial ending email to ${subscription.user.email}:`,
          error
        )
        results.errors.push(
          `Trial ending email failed for ${subscription.user.email}`
        )
      }
    }

    // 2. Send trial ended notifications (ended today)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const trialsEndedToday = await prisma.subscription.findMany({
      where: {
        status: 'INCOMPLETE_EXPIRED',
        trialEnd: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            locale: true,
          },
        },
      },
    })

    for (const subscription of trialsEndedToday) {
      try {
        await sendTrialEndedEmail({
          to: subscription.user.email,
          userName: subscription.user.name,
          locale: (subscription.user.locale as 'fr' | 'en') || 'fr',
        })

        results.trialEndedNotifications++
      } catch (error) {
        console.error(
          `Error sending trial ended email to ${subscription.user.email}:`,
          error
        )
        results.errors.push(
          `Trial ended email failed for ${subscription.user.email}`
        )
      }
    }

    // 3. Send renewal reminders (7 days before renewal)
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    sevenDaysFromNow.setHours(23, 59, 59, 999)

    const sevenDaysStart = new Date(sevenDaysFromNow)
    sevenDaysStart.setHours(0, 0, 0, 0)

    const subscriptionsRenewingSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: {
          gte: sevenDaysStart,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            locale: true,
          },
        },
      },
    })

    for (const subscription of subscriptionsRenewingSoon) {
      try {
        if (!subscription.currentPeriodEnd) continue

        // Determine plan type and amount
        const isMonthly =
          subscription.stripePriceId === process.env.STRIPE_PRICE_MONTHLY
        const plan = isMonthly ? 'monthly' : 'yearly'
        const amount = isMonthly ? '19€' : '180€'

        const renewalDate = subscription.currentPeriodEnd.toLocaleDateString(
          subscription.user.locale === 'en' ? 'en-US' : 'fr-FR',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        )

        await sendRenewalReminderEmail({
          to: subscription.user.email,
          userName: subscription.user.name,
          renewalDate,
          amount,
          plan,
          locale: (subscription.user.locale as 'fr' | 'en') || 'fr',
        })

        results.renewalReminders++
      } catch (error) {
        console.error(
          `Error sending renewal reminder to ${subscription.user.email}:`,
          error
        )
        results.errors.push(
          `Renewal reminder failed for ${subscription.user.email}`
        )
      }
    }

    console.log('Subscription notifications cron completed:', results)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Error in subscription notifications cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        ...results,
      },
      { status: 500 }
    )
  }
}
