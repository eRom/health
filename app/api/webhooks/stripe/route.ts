import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendPaymentFailedEmail } from '@/lib/email'
import { SubscriptionStatus } from '@prisma/client'
import { trackUserEvent, flushPostHog } from '@/lib/posthog'
import { logger } from '@/lib/logger'

// Helper to convert Stripe status to Prisma SubscriptionStatus
function mapStripeStatusToPrisma(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    trialing: 'TRIALING',
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    paused: 'CANCELED', // Stripe 'paused' maps to our CANCELED status
  }
  return statusMap[stripeStatus]
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new NextResponse('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Flush PostHog events before responding to webhook
    // Critical: ensures all events are sent before the webhook response
    await flushPostHog()

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error(error, 'Error processing webhook', { eventType: event.type })
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Update user with Stripe customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customerId },
  })

  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await handleSubscriptionUpdate(subscription)

  // Track subscription completion
  const priceId = subscription.items.data[0]?.price.id
  const planType = priceId === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly'
  const amount = subscription.items.data[0]?.price.unit_amount || 0

  await trackUserEvent(userId, 'subscription_completed', {
    plan_type: planType,
    plan_price: amount / 100, // Convert cents to dollars
    plan_currency: subscription.currency,
    subscription_id: subscription.id,
    subscription_status: subscription.status,
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  const priceId = subscription.items.data[0]?.price.id
  const productId = subscription.items.data[0]?.price.product as string

  // Access Stripe properties with snake_case (Stripe SDK v19)
  const sub = subscription as unknown as {
    id: string
    status: Stripe.Subscription.Status
    current_period_start: number
    current_period_end: number
    trial_start?: number | null
    trial_end?: number | null
    cancel_at_period_end: boolean
    canceled_at?: number | null
  }

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      stripeProductId: productId,
      status: mapStripeStatusToPrisma(subscription.status),
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialStart: sub.trial_start
        ? new Date(sub.trial_start * 1000)
        : null,
      trialEnd: sub.trial_end
        ? new Date(sub.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripePriceId: priceId,
      stripeProductId: productId,
      status: mapStripeStatusToPrisma(subscription.status),
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialEnd: sub.trial_end
        ? new Date(sub.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })

  // Track subscription cancellation
  await trackUserEvent(user.id, 'subscription_cancelled', {
    subscription_id: subscription.id,
    subscription_status: 'canceled',
  })
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  // Update subscription status to ACTIVE
  await prisma.subscription.updateMany({
    where: {
      userId: user.id,
      status: { in: ['PAST_DUE', 'UNPAID'] },
    },
    data: {
      status: 'ACTIVE',
    },
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      locale: true,
    },
  })

  if (!user) return

  // Update subscription status to PAST_DUE
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    })

    // Calculate grace period end (7 days)
    const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

    // Send email notification about payment failure
    try {
      await sendPaymentFailedEmail({
        to: user.email,
        userName: user.name,
        amount: `${(invoice.amount_due / 100).toFixed(2)}€`,
        reason: invoice.last_finalization_error?.message,
        gracePeriodEnd: gracePeriodEnd.toLocaleDateString(
          user.locale === 'en' ? 'en-US' : 'fr-FR',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        ),
        locale: (user.locale as 'fr' | 'en') || 'fr',
      })
    } catch (error) {
      console.error(`Error sending payment failed email to ${user.email}:`, error)
    }
  }
}
