'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function createCustomerPortalSession(locale: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Non authentifié')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    throw new Error('Aucun client Stripe trouvé')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/${locale}/subscription`,
      locale: locale === 'fr' ? 'fr' : 'en',
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw new Error('Erreur lors de la création de la session portail')
  }
}
