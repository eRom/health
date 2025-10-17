'use server'

import { auth } from '@/lib/auth'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe'
import { headers } from 'next/headers'

type PlanType = 'monthly' | 'yearly'

export async function createCheckoutSession(plan: PlanType, locale: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Non authentifié')
  }

  const { user } = session

  try {
    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      user.id,
      user.email,
      user.name
    )

    // Determine price ID
    const priceId =
      plan === 'monthly'
        ? process.env.STRIPE_PRICE_MONTHLY!
        : process.env.STRIPE_PRICE_YEARLY!

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
        },
      },
      success_url: `${baseUrl}/${locale}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/subscription`,
      locale: locale === 'fr' ? 'fr' : 'en',
      customer_update: {
        address: 'auto',
      },
      metadata: {
        userId: user.id,
      },
    })

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Erreur lors de la création de la session de paiement')
  }
}
