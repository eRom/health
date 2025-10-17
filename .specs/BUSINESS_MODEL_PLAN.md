# Plan d'implémentation - Système d'abonnement avec essai gratuit

**Document type**: Plan d'implémentation technique
**Status**: Draft
**Last updated**: 15 octobre 2025
**Estimation totale**: 12-17 heures de développement

---

## 📋 Vue d'ensemble

Ce document détaille l'implémentation complète d'un système d'abonnement avec essai gratuit de 14 jours pour Health In Cloud, utilisant Stripe comme processeur de paiement.

### Modèle d'affaires

- **Essai gratuit** : 14 jours avec accès complet
- **Abonnement obligatoire** après essai pour continuer
- **Tarification** :
  - Mensuel : 19 € / mois
  - Annuel : 180 € / an (15 €/mois, -20%)

### Intégration RGPD

Stripe agit comme **sous-traitant** au sens du RGPD (Art. 28). Les données suivantes sont transmises à Stripe :
- Nom et email de l'utilisateur
- Données de carte bancaire (gérées directement par Stripe, jamais stockées côté Health In Cloud)
- Adresse IP de connexion
- Historique de transactions

Ces informations doivent être mentionnées dans la politique de confidentialité.

---

## 🏗️ Architecture technique

### État actuel de l'application

**✅ Déjà en place :**
- Next.js 15 avec App Router
- Better Auth (email/password + Google OAuth)
- Prisma + Neon PostgreSQL (EU Frankfurt)
- next-intl (FR/EN)
- Middleware de protection des routes
- Système d'emails transactionnels (Resend)
- Page de profil modulaire

**❌ À implémenter :**
- Intégration Stripe
- Modèle de données Subscription
- Gestion des statuts d'abonnement
- Webhooks Stripe
- Système de notifications d'abonnement
- Protection des accès basée sur le statut

### Stack technique pour l'abonnement

```
User (Browser)
    ↓
Stripe Checkout (hébergé par Stripe) → Stripe Webhooks
    ↓                                          ↓
Next.js Server Actions                  API Route Webhook
    ↓                                          ↓
Prisma ORM                              Prisma ORM
    ↓                                          ↓
Neon PostgreSQL (EU Frankfurt)
```

---

## 📊 Phase 1 : Configuration de base (1-2h)

### 1.1 Installation des dépendances

```bash
npm install stripe @stripe/stripe-js
```

### 1.2 Variables d'environnement

Ajouter à `.env.example` et `.env` :

```bash
# Stripe - Payment Processing
STRIPE_SECRET_KEY="sk_test_..." # Test mode
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Test mode
STRIPE_WEBHOOK_SECRET="whsec_..." # Webhook signing secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Client-side key

# Stripe Products - ✅ DÉJÀ CONFIGURÉS
STRIPE_PRODUCT_ID="prod_TEyCCLs8neQmi2" # Health In Cloud product
STRIPE_PRICE_MONTHLY="price_1SIUGXQkq5HM6RShbIvlBJnw" # 19 EUR/month
STRIPE_PRICE_YEARLY="price_1SIV7IQkq5HM6RShkGIXDoGU" # 180 EUR/year

# Production keys (configure in Vercel)
# STRIPE_SECRET_KEY="sk_live_..."
# STRIPE_PUBLISHABLE_KEY="pk_live_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Note** : Les IDs de produit et prix ci-dessus sont vos IDs réels du compte test Stripe "Environnement de test Health In Cloud" (acct_1SIU3AQkq5HM6RSh).

### 1.3 Schéma Prisma - Nouveau modèle Subscription

Ajouter à `prisma/schema.prisma` :

```prisma
model User {
  id                            String            @id @default(cuid())
  createdAt                     DateTime          @default(now())
  updatedAt                     DateTime          @updatedAt
  email                         String            @unique
  emailVerified                 Boolean           @default(false)
  name                          String
  image                         String?
  locale                        String?           @default("fr")
  theme                         String?           @default("system")
  themeStyle                    String?           @default("default")
  emailNotifications            Boolean           @default(true)
  lastPasswordResetRequestAt    DateTime?
  passwordResetRequestCount     Int               @default(0)
  passwordResetRequestResetAt   DateTime?
  healthDataConsentGrantedAt    DateTime?
  role                          UserRole          @default(USER)

  // ✨ NOUVEAU : Stripe integration
  stripeCustomerId              String?           @unique

  accounts                      Account[]
  sessions                      Session[]
  exerciseAttempts              ExerciseAttempt[]
  consentHistory                ConsentHistory[]
  patientAssociations           PatientProviderAssociation[] @relation("PatientAssociations")
  providerAssociations          PatientProviderAssociation[] @relation("ProviderAssociations")
  sentMessages                  ProviderPatientMessage[] @relation("SentMessages")
  badges                        UserBadge[]
  streakData                    StreakData?
  badgeShares                   BadgeShare[]

  // ✨ NOUVEAU : Relation subscription
  subscription                  Subscription?
}

// ✨ NOUVEAU : Modèle Subscription
model Subscription {
  id                      String              @id @default(cuid())
  userId                  String              @unique

  // Stripe identifiers
  stripeSubscriptionId    String              @unique
  stripeCustomerId        String
  stripePriceId           String
  stripeProductId         String?

  // Subscription status
  status                  SubscriptionStatus  @default(TRIALING)

  // Billing cycle
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  trialStart              DateTime?
  trialEnd                DateTime?

  // Cancellation
  cancelAtPeriodEnd       Boolean             @default(false)
  canceledAt              DateTime?
  cancelReason            String?

  // Metadata
  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt

  user                    User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([stripeSubscriptionId])
  @@index([status])
}

// ✨ NOUVEAU : Enum SubscriptionStatus
enum SubscriptionStatus {
  INCOMPLETE          // Initial state, payment pending
  INCOMPLETE_EXPIRED  // Payment wasn't completed in time
  TRIALING            // In trial period (14 days)
  ACTIVE              // Active subscription
  PAST_DUE            // Payment failed, in grace period
  CANCELED            // Subscription canceled
  UNPAID              // Payment failed after grace period
}
```

### 1.4 Migration de base de données

```bash
npx prisma migrate dev --name add_subscription_model
npx prisma generate
```

### 1.5 Helpers Stripe côté serveur

Créer `lib/stripe.ts` :

```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  appInfo: {
    name: 'Health In Cloud',
    version: '0.1.0',
  },
})

// Helper to get or create Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const { prisma } = await import('./prisma')

  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })

  // Store customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}
```

### 1.6 Helper Stripe côté client

Créer `lib/stripe-client.ts` :

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}
```

---

## 🔧 Phase 2 : Backend Stripe (2-3h)

### 2.0 Configuration Stripe (✅ Déjà fait partiellement via MCP)

**État actuel de votre configuration Stripe** :
- ✅ Compte test actif : "Environnement de test Health In Cloud"
- ✅ Produit créé : `prod_TEyCCLs8neQmi2` - "Health In Cloud (mensuel)"
- ✅ Prix mensuel créé : `price_1SIUGXQkq5HM6RShbIvlBJnw` - 19 EUR/mois
- ✅ Prix annuel créé : `price_1SIV7IQkq5HM6RShkGIXDoGU` - 180 EUR/an

**⚠️ Actions requises** :
1. Mettre à jour les prix pour inclure `trial_period_days: 14`
2. Ajouter metadata pour différencier mensuel/annuel
3. Configurer les webhooks Stripe

**Utilisation du MCP Stripe** : Vous pouvez utiliser le MCP Stripe pour gérer votre configuration sans script. Voir section "Gestion via MCP Stripe" ci-dessous.

### 2.1 Script de configuration des produits Stripe (Optionnel - déjà fait)

Si vous devez recréer les produits/prix (production, par exemple), créer `scripts/setup-stripe-products.ts` :

```typescript
import Stripe from 'stripe'
import * as dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

async function setupProducts() {
  console.log('🚀 Setting up Stripe products...')

  // Create product
  const product = await stripe.products.create({
    name: 'Health In Cloud - Abonnement',
    description:
      'Accès complet à la plateforme de rééducation orthophonique et neuropsychologique',
    metadata: {
      type: 'subscription',
    },
  })

  console.log('✅ Product created:', product.id)

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 1900, // 19.00 EUR
    recurring: {
      interval: 'month',
      trial_period_days: 14,
    },
    metadata: {
      type: 'monthly',
    },
  })

  console.log('✅ Monthly price created:', monthlyPrice.id)

  // Create yearly price
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 18000, // 180.00 EUR (15€/mois)
    recurring: {
      interval: 'year',
      trial_period_days: 14,
    },
    metadata: {
      type: 'yearly',
      discount: '20%',
    },
  })

  console.log('✅ Yearly price created:', yearlyPrice.id)

  console.log('\n📋 Add these to your .env:')
  console.log(`STRIPE_PRODUCT_ID="${product.id}"`)
  console.log(`STRIPE_PRICE_MONTHLY="${monthlyPrice.id}"`)
  console.log(`STRIPE_PRICE_YEARLY="${yearlyPrice.id}"`)
}

setupProducts().catch(console.error)
```

Exécuter :

```bash
npx tsx scripts/setup-stripe-products.ts
```

### 2.2 Server Action : Créer session de checkout

Créer `app/actions/create-checkout-session.ts` :

```typescript
'use server'

import { auth } from '@/lib/auth'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

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
```

### 2.3 Server Action : Créer portail client Stripe

Créer `app/actions/create-customer-portal-session.ts` :

```typescript
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
```

### 2.4 Server Action : Récupérer statut d'abonnement

Créer `app/actions/get-subscription-status.ts` :

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function getSubscriptionStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      trialEnd: true,
      cancelAtPeriodEnd: true,
      canceledAt: true,
      stripePriceId: true,
    },
  })

  return subscription
}
```

### 2.5 Route API : Webhooks Stripe

Créer `app/api/webhooks/stripe/route.ts` :

```typescript
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

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

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
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
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  const priceId = subscription.items.data[0]?.price.id
  const productId = subscription.items.data[0]?.price.product as string

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      stripeProductId: productId,
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripePriceId: priceId,
      stripeProductId: productId,
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
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
  })

  if (!user) return

  // Update subscription status to PAST_DUE
  await prisma.subscription.updateMany({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    data: {
      status: 'PAST_DUE',
    },
  })

  // TODO: Send email notification about payment failure
}
```

---

## 🎨 Phase 3 : Interface utilisateur (2-3h)

### 3.1 Composant SubscriptionCard

Créer `components/subscription/subscription-card.tsx` :

```typescript
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createCustomerPortalSession } from '@/app/actions/create-customer-portal-session'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'INCOMPLETE'
  | 'UNPAID'

type SubscriptionData = {
  id: string
  status: SubscriptionStatus
  currentPeriodEnd: Date
  trialEnd: Date | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  stripePriceId: string
}

type Props = {
  subscription: SubscriptionData | null
}

export function SubscriptionCard({ subscription }: Props) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [isLoading, setIsLoading] = useState(false)

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const { url } = await createCustomerPortalSession(locale)
      router.push(url)
    } catch (error) {
      console.error('Error opening portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun abonnement</CardTitle>
          <CardDescription>
            Vous n&apos;avez pas encore d&apos;abonnement actif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(`/${locale}/subscription`)}>
            Choisir une formule
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'TRIALING':
        return <Badge variant="secondary">Essai gratuit</Badge>
      case 'ACTIVE':
        return <Badge variant="default">Actif</Badge>
      case 'PAST_DUE':
        return <Badge variant="destructive">Paiement en retard</Badge>
      case 'CANCELED':
        return <Badge variant="outline">Annulé</Badge>
      default:
        return <Badge variant="outline">{subscription.status}</Badge>
    }
  }

  const getPlanName = () => {
    const isYearly = subscription.stripePriceId.includes('yearly')
    return isYearly ? 'Abonnement annuel' : 'Abonnement mensuel'
  }

  const dateLocale = locale === 'fr' ? fr : enUS

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mon abonnement</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{getPlanName()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.status === 'TRIALING' && subscription.trialEnd && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Fin de l&apos;essai gratuit
            </p>
            <p className="text-lg">
              {format(new Date(subscription.trialEnd), 'PPP', {
                locale: dateLocale,
              })}
            </p>
          </div>
        )}

        {subscription.status === 'ACTIVE' && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Prochain renouvellement
            </p>
            <p className="text-lg">
              {format(new Date(subscription.currentPeriodEnd), 'PPP', {
                locale: dateLocale,
              })}
            </p>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Votre abonnement sera annulé le{' '}
              {format(new Date(subscription.currentPeriodEnd), 'PPP', {
                locale: dateLocale,
              })}
            </p>
          </div>
        )}

        <Button
          onClick={handleManageSubscription}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Chargement...' : 'Gérer mon abonnement'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 3.2 Composant PricingTable

Créer `components/subscription/pricing-table.tsx` :

```typescript
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createCheckoutSession } from '@/app/actions/create-checkout-session'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check } from 'lucide-react'

export function PricingTable() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | null>(null)

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setIsLoading(plan)
    try {
      const { url } = await createCheckoutSession(plan, locale)
      if (url) {
        router.push(url)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const features = [
    'Accès illimité à tous les exercices',
    'Suivi personnalisé de progression',
    'Statistiques et analyses détaillées',
    'Synchronisation multi-appareils',
    'Support prioritaire',
    'Mises à jour gratuites',
  ]

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Monthly Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Mensuel</CardTitle>
          <CardDescription>Flexible, sans engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <span className="text-4xl font-bold">19 €</span>
            <span className="text-muted-foreground">/mois</span>
          </div>

          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              🎉 14 jours d&apos;essai gratuit inclus
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => handleSubscribe('monthly')}
            disabled={isLoading !== null}
            className="w-full"
          >
            {isLoading === 'monthly' ? 'Chargement...' : 'Commencer l&apos;essai'}
          </Button>
        </CardFooter>
      </Card>

      {/* Yearly Plan */}
      <Card className="relative border-2 border-primary">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            Meilleure offre
          </Badge>
        </div>

        <CardHeader>
          <CardTitle>Annuel</CardTitle>
          <CardDescription>Économisez 20%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">180 €</span>
              <span className="text-muted-foreground">/an</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Soit 15 €/mois
            </p>
          </div>

          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              🎉 14 jours d&apos;essai gratuit inclus
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => handleSubscribe('yearly')}
            disabled={isLoading !== null}
            className="w-full"
          >
            {isLoading === 'yearly' ? 'Chargement...' : 'Commencer l&apos;essai'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### 3.3 Page dédiée à l'abonnement

Créer `app/[locale]/(app)/subscription/page.tsx` :

```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from '@/i18n/routing'
import { headers } from 'next/headers'
import { SubscriptionCard } from '@/components/subscription/subscription-card'
import { PricingTable } from '@/components/subscription/pricing-table'

export const metadata = {
  title: 'Abonnement - Health In Cloud',
  description: 'Gérez votre abonnement Health In Cloud',
}

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect({ href: '/auth/login', locale })
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Mon abonnement</h1>

      <div className="grid gap-8">
        {/* Current subscription status */}
        <SubscriptionCard subscription={subscription} />

        {/* Pricing options (only if no active subscription) */}
        {!subscription ||
        ['CANCELED', 'UNPAID'].includes(subscription.status) ? (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Choisir une formule</h2>
            <PricingTable />
          </div>
        ) : null}
      </div>
    </div>
  )
}
```

### 3.4 Page de confirmation

Créer `app/[locale]/(app)/subscription/success/page.tsx` :

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default async function SubscriptionSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-8">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Abonnement activé !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Votre essai gratuit de 14 jours a commencé. Profitez de toutes les
            fonctionnalités de Health In Cloud !
          </p>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href={`/${locale}/dashboard`}>
                Accéder au tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3.5 Intégration dans le profil

Modifier `app/[locale]/(app)/profile/page.tsx` pour ajouter après la section "Informations personnelles" :

```typescript
// Fetch subscription data
const subscription = await prisma.subscription.findUnique({
  where: { userId: user.id },
})

// Add in JSX after personal info card:
{/* Abonnement */}
<SubscriptionCard subscription={subscription} />
```

---

## 🔒 Phase 4 : Protection des accès (1-2h)

### 4.1 Helper de vérification d'abonnement

Créer `lib/subscription.ts` :

```typescript
import { prisma } from './prisma'

/**
 * Check if user has an active subscription
 * Returns true if:
 * - User is in trial period (TRIALING)
 * - User has active subscription (ACTIVE)
 * - User is in grace period after payment failure (PAST_DUE, within 7 days)
 */
export async function hasActiveSubscription(
  userId: string
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      currentPeriodEnd: true,
      trialEnd: true,
    },
  })

  if (!subscription) {
    return false
  }

  // Allow access during trial
  if (subscription.status === 'TRIALING') {
    return true
  }

  // Allow access with active subscription
  if (subscription.status === 'ACTIVE') {
    return true
  }

  // Allow 7-day grace period for failed payments
  if (subscription.status === 'PAST_DUE') {
    const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)
    return new Date() < gracePeriodEnd
  }

  return false
}

/**
 * Get days remaining in trial period
 * Returns null if not in trial
 */
export async function getDaysUntilTrialEnd(
  userId: string
): Promise<number | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      trialEnd: true,
    },
  })

  if (!subscription || subscription.status !== 'TRIALING' || !subscription.trialEnd) {
    return null
  }

  const now = new Date()
  const trialEnd = new Date(subscription.trialEnd)
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/**
 * Check if user is in grace period after payment failure
 */
export async function isInGracePeriod(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      currentPeriodEnd: true,
    },
  })

  if (!subscription || subscription.status !== 'PAST_DUE') {
    return false
  }

  const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

  return new Date() < gracePeriodEnd
}
```

### 4.2 Mise à jour du middleware

Modifier `middleware.ts` pour ajouter la vérification d'abonnement :

```typescript
// Add after email verification check (around line 193)

// Check subscription status for protected routes (except subscription page itself)
if (!pathname.includes('/subscription') && !pathname.includes('/consent')) {
  try {
    const session = await fetchSession(request)

    if (session?.user) {
      // Import subscription helper
      const { hasActiveSubscription } = await import('./lib/subscription')

      const hasAccess = await hasActiveSubscription(session.user.id)

      if (!hasAccess) {
        logger.info('[MIDDLEWARE] No active subscription, redirecting', {
          userId: session.user.id,
        })
        const subscriptionUrl = new URL(`/${locale}/subscription`, request.url)
        return NextResponse.redirect(subscriptionUrl)
      }
    }
  } catch (error) {
    logger.error(error, '[MIDDLEWARE] Error checking subscription')
    // Continue to allow access if check fails
  }
}
```

---

## 📧 Phase 5 : Système d'emails (2h)

### 5.1 Templates React Email

Créer `emails/trial-ending-soon.tsx` :

```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

type Props = {
  name: string
  trialEndsAt: string
  upgradeUrl: string
  locale: string
}

export default function TrialEndingSoonEmail({
  name,
  trialEndsAt,
  upgradeUrl,
  locale = 'fr',
}: Props) {
  const isFrench = locale === 'fr'

  const previewText = isFrench
    ? 'Votre essai gratuit se termine dans 3 jours'
    : 'Your free trial ends in 3 days'

  const heading = isFrench
    ? 'Votre essai gratuit se termine bientôt'
    : 'Your free trial ends soon'

  const greeting = isFrench ? `Bonjour ${name},` : `Hello ${name},`

  const mainText = isFrench
    ? `Votre essai gratuit de 14 jours prend fin le ${trialEndsAt}. Nous espérons que vous avez apprécié Health In Cloud !`
    : `Your 14-day free trial ends on ${trialEndsAt}. We hope you've enjoyed Health In Cloud!`

  const ctaText = isFrench
    ? 'Pour continuer à profiter de tous les exercices et fonctionnalités, souscrivez dès maintenant à l'une de nos formules.'
    : 'To continue enjoying all exercises and features, subscribe to one of our plans now.'

  const buttonText = isFrench ? 'Choisir une formule' : 'Choose a plan'

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{heading}</Heading>
          <Text style={text}>{greeting}</Text>
          <Text style={text}>{mainText}</Text>
          <Text style={text}>{ctaText}</Text>
          <Link href={upgradeUrl} style={button}>
            {buttonText}
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  margin: '32px auto',
  padding: '12px',
}
```

Créer de même `emails/trial-ended.tsx`, `emails/renewal-reminder.tsx`, `emails/payment-failed.tsx`.

### 5.2 Route API Cron

Créer `app/api/cron/subscription-reminders/route.ts` :

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import TrialEndingSoonEmail from '@/emails/trial-ending-soon'
import TrialEndedEmail from '@/emails/trial-ended'
import RenewalReminderEmail from '@/emails/renewal-reminder'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Find trials ending in 3 days
    const trialsEndingSoon = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        trialEnd: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            locale: true,
            emailNotifications: true,
          },
        },
      },
    })

    // Send trial ending soon emails
    for (const subscription of trialsEndingSoon) {
      if (!subscription.user.emailNotifications) continue

      const locale = subscription.user.locale || 'fr'
      const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscription`

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: subscription.user.email,
        subject:
          locale === 'fr'
            ? 'Votre essai gratuit se termine dans 3 jours'
            : 'Your free trial ends in 3 days',
        react: TrialEndingSoonEmail({
          name: subscription.user.name,
          trialEndsAt: subscription.trialEnd!.toLocaleDateString(locale),
          upgradeUrl,
          locale,
        }),
      })
    }

    // Find trials that just ended
    const trialsEnded = await prisma.subscription.findMany({
      where: {
        status: 'INCOMPLETE',
        trialEnd: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            locale: true,
            emailNotifications: true,
          },
        },
      },
    })

    // Send trial ended emails
    for (const subscription of trialsEnded) {
      if (!subscription.user.emailNotifications) continue

      const locale = subscription.user.locale || 'fr'
      const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscription`

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: subscription.user.email,
        subject:
          locale === 'fr'
            ? 'Votre essai gratuit est terminé'
            : 'Your free trial has ended',
        react: TrialEndedEmail({
          name: subscription.user.name,
          upgradeUrl,
          locale,
        }),
      })
    }

    // Find subscriptions renewing in 7 days
    const subscriptionsRenewingSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            locale: true,
            emailNotifications: true,
          },
        },
      },
    })

    // Send renewal reminder emails
    for (const subscription of subscriptionsRenewingSoon) {
      if (!subscription.user.emailNotifications) continue

      const locale = subscription.user.locale || 'fr'
      const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscription`

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: subscription.user.email,
        subject:
          locale === 'fr'
            ? 'Renouvellement de votre abonnement dans 7 jours'
            : 'Your subscription renews in 7 days',
        react: RenewalReminderEmail({
          name: subscription.user.name,
          renewalDate: subscription.currentPeriodEnd.toLocaleDateString(locale),
          manageUrl,
          locale,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      trialsEndingSoon: trialsEndingSoon.length,
      trialsEnded: trialsEnded.length,
      subscriptionsRenewing: subscriptionsRenewingSoon.length,
    })
  } catch (error) {
    console.error('Error in subscription reminders cron:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 5.3 Configuration Vercel Cron

Créer `vercel.json` à la racine :

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Ajouter à `.env` :

```bash
CRON_SECRET="generate-a-random-secret-here"
```

---

## 🌍 Phase 6 : Traductions (1h)

Ajouter à `locales/fr/common.json` :

```json
{
  "subscription": {
    "title": "Mon abonnement",
    "noSubscription": "Aucun abonnement",
    "noSubscriptionDescription": "Vous n'avez pas encore d'abonnement actif",
    "choosePlan": "Choisir une formule",
    "manageBilling": "Gérer mon abonnement",
    "status": {
      "trialing": "Essai gratuit",
      "active": "Actif",
      "pastDue": "Paiement en retard",
      "canceled": "Annulé",
      "unpaid": "Impayé"
    },
    "trialEndsAt": "Fin de l'essai gratuit",
    "renewsAt": "Prochain renouvellement",
    "canceledAt": "Annulé le",
    "cancelAtPeriodEnd": "Votre abonnement sera annulé le {date}",
    "plans": {
      "monthly": {
        "title": "Mensuel",
        "description": "Flexible, sans engagement",
        "price": "19 €",
        "period": "/mois"
      },
      "yearly": {
        "title": "Annuel",
        "description": "Économisez 20%",
        "price": "180 €",
        "period": "/an",
        "equivalent": "Soit 15 €/mois",
        "badge": "Meilleure offre"
      }
    },
    "features": {
      "title": "Fonctionnalités incluses",
      "unlimited": "Accès illimité à tous les exercices",
      "tracking": "Suivi personnalisé de progression",
      "stats": "Statistiques et analyses détaillées",
      "sync": "Synchronisation multi-appareils",
      "support": "Support prioritaire",
      "updates": "Mises à jour gratuites"
    },
    "trial": "14 jours d'essai gratuit inclus",
    "startTrial": "Commencer l'essai",
    "success": {
      "title": "Abonnement activé !",
      "description": "Votre essai gratuit de 14 jours a commencé. Profitez de toutes les fonctionnalités de Health In Cloud !",
      "cta": "Accéder au tableau de bord"
    }
  }
}
```

Traduire de même dans `locales/en/common.json`.

---

## ⚖️ Phase 7 : Conformité RGPD (1h)

### 7.1 Mise à jour de la politique de confidentialité

Modifier `app/[locale]/(site)/privacy/page.tsx` pour ajouter après la section "Third Parties" :

```typescript
<section>
  <h2 className="mb-4 text-2xl font-semibold">
    9. Traitement des Paiements
  </h2>
  <p className="mb-4">
    Les paiements sont traités par <strong>Stripe, Inc.</strong>, notre
    sous-traitant au sens de l'article 28 du RGPD.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Données transmises à Stripe :</h3>
  <ul className="mb-4 list-disc pl-6">
    <li>Nom et adresse email</li>
    <li>Données de carte bancaire (gérées directement par Stripe via leur interface sécurisée)</li>
    <li>Adresse IP de connexion</li>
    <li>Historique de transactions</li>
  </ul>

  <h3 className="mb-2 text-xl font-semibold">Base légale :</h3>
  <p className="mb-4">
    Exécution du contrat (Art. 6.1.b RGPD) pour le traitement des paiements
    de votre abonnement.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Transferts de données :</h3>
  <p className="mb-4">
    Stripe est certifié conforme au RGPD et stocke vos données dans des
    datacenters européens. Pour plus d'informations sur la politique de
    confidentialité de Stripe, consultez :{' '}
    <a
      href="https://stripe.com/fr/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline"
    >
      https://stripe.com/fr/privacy
    </a>
  </p>

  <h3 className="mb-2 text-xl font-semibold">Durée de conservation :</h3>
  <p className="mb-4">
    Les données de transaction sont conservées pendant la durée de votre
    abonnement, puis 10 ans supplémentaires pour des raisons comptables et
    fiscales conformément aux obligations légales.
  </p>
</section>
```

### 7.2 Mise à jour des mentions légales

Ajouter une section dans `app/[locale]/(site)/legal/page.tsx` :

```typescript
<section>
  <h2 className="mb-4 text-2xl font-semibold">
    9. Conditions Générales de Vente (CGV)
  </h2>

  <h3 className="mb-2 text-xl font-semibold">Prix et facturation</h3>
  <p className="mb-4">
    Les prix affichés sont en euros (EUR), toutes taxes comprises (TTC).
    Le paiement s'effectue par carte bancaire via Stripe.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Période d'essai gratuite</h3>
  <p className="mb-4">
    Tout nouvel abonnement bénéficie d'une période d'essai gratuite de 14
    jours calendaires. À l'issue de cette période, votre abonnement sera
    automatiquement renouvelé selon la formule choisie, sauf annulation de
    votre part.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Renouvellement automatique</h3>
  <p className="mb-4">
    Votre abonnement se renouvelle automatiquement à chaque échéance
    (mensuelle ou annuelle) jusqu'à résiliation. Un email de rappel vous sera
    envoyé 7 jours avant chaque renouvellement.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Droit de rétractation</h3>
  <p className="mb-4">
    Conformément au Code de la consommation, vous disposez d'un délai de 14
    jours calendaires pour exercer votre droit de rétractation sans avoir à
    justifier de motifs ni à payer de pénalités. Le remboursement intégral
    sera effectué dans un délai maximum de 14 jours ouvrés.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Résiliation</h3>
  <p className="mb-4">
    Vous pouvez résilier votre abonnement à tout moment via votre espace
    client ou le portail Stripe. La résiliation prendra effet à la fin de la
    période de facturation en cours. Aucun remboursement partiel ne sera
    effectué pour la période en cours.
  </p>

  <h3 className="mb-2 text-xl font-semibold">Échec de paiement</h3>
  <p className="mb-4">
    En cas d'échec de paiement, vous serez notifié par email. Stripe tentera
    automatiquement de prélever le montant à J+1 et J+3. Si le paiement
    échoue définitivement après 7 jours, votre abonnement sera suspendu et
    vous perdrez l'accès aux fonctionnalités premium.
  </p>
</section>
```

---

## 🧪 Phase 8 : Tests & Documentation (2-3h)

### 8.1 Tests E2E Playwright

Créer `e2e/subscription.spec.ts` :

```typescript
import { test, expect } from '@playwright/test'

test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('http://localhost:3000/fr/auth/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should display subscription page', async ({ page }) => {
    await page.goto('http://localhost:3000/fr/subscription')
    await expect(page.locator('h1')).toContainText('Mon abonnement')
  })

  test('should show pricing options when no subscription', async ({ page }) => {
    await page.goto('http://localhost:3000/fr/subscription')
    await expect(page.locator('text=Mensuel')).toBeVisible()
    await expect(page.locator('text=Annuel')).toBeVisible()
  })

  test('should redirect to Stripe checkout on subscribe', async ({ page }) => {
    await page.goto('http://localhost:3000/fr/subscription')

    // Click monthly plan button
    await page.click('button:has-text("Commencer l\'essai")')

    // Should redirect to Stripe
    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 10000 })
    expect(page.url()).toContain('checkout.stripe.com')
  })

  test('should block access to exercises without active subscription', async ({
    page,
  }) => {
    // TODO: Mock expired subscription state
    await page.goto('http://localhost:3000/fr/neuro')

    // Should redirect to subscription page
    await page.waitForURL('**/subscription')
    expect(page.url()).toContain('/subscription')
  })
})
```

### 8.2 Tests unitaires

Créer `__tests__/lib/subscription.test.ts` :

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hasActiveSubscription, getDaysUntilTrialEnd } from '@/lib/subscription'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
    },
  },
}))

describe('subscription helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasActiveSubscription', () => {
    it('should return true for TRIALING status', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        status: 'TRIALING',
        currentPeriodEnd: new Date(),
        trialEnd: new Date(),
      } as any)

      const result = await hasActiveSubscription('user-123')
      expect(result).toBe(true)
    })

    it('should return true for ACTIVE status', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(),
        trialEnd: null,
      } as any)

      const result = await hasActiveSubscription('user-123')
      expect(result).toBe(true)
    })

    it('should return false for CANCELED status', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        status: 'CANCELED',
        currentPeriodEnd: new Date(),
        trialEnd: null,
      } as any)

      const result = await hasActiveSubscription('user-123')
      expect(result).toBe(false)
    })
  })

  describe('getDaysUntilTrialEnd', () => {
    it('should calculate days correctly', async () => {
      const { prisma } = await import('@/lib/prisma')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)

      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        status: 'TRIALING',
        trialEnd: futureDate,
      } as any)

      const result = await getDaysUntilTrialEnd('user-123')
      expect(result).toBe(5)
    })

    it('should return null when not in trial', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        status: 'ACTIVE',
        trialEnd: null,
      } as any)

      const result = await getDaysUntilTrialEnd('user-123')
      expect(result).toBeNull()
    })
  })
})
```

### 8.3 Guide administrateur

Créer `.specs/SUBSCRIPTION_ADMIN_GUIDE.md` avec procédures :
- Rembourser un utilisateur
- Annuler un abonnement manuellement
- Gérer les litiges Stripe
- Accéder aux logs de webhooks
- Tester en mode test Stripe

---

## 📦 Checklist de déploiement

### Configuration Stripe

- [ ] Créer compte Stripe (test + production)
- [ ] Configurer produits et prix via script
- [ ] Configurer webhook endpoint sur Stripe Dashboard
  - URL : `https://healthincloud.app/api/webhooks/stripe`
  - Events : `customer.subscription.*`, `invoice.*`, `checkout.session.*`
- [ ] Activer Customer Portal dans Stripe Dashboard
- [ ] Configurer branding (logo, couleurs) dans Stripe Dashboard
- [ ] Tester webhooks avec Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Variables d'environnement Vercel

**Test (Preview) :**
- [ ] `STRIPE_SECRET_KEY` (sk_test_...)
- [ ] `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_test_...)
- [ ] `STRIPE_PRICE_MONTHLY` (price_...)
- [ ] `STRIPE_PRICE_YEARLY` (price_...)
- [ ] `CRON_SECRET` (random string)

**Production :**
- [ ] Mêmes variables avec clés `sk_live_...` et `pk_live_...`

### Vérifications finales

- [ ] Migration Prisma déployée en production
- [ ] Webhooks Stripe configurés et testés
- [ ] Emails transactionnels testés (via Resend)
- [ ] Vercel Cron activé (plan Pro requis)
- [ ] Tests E2E passés en preview
- [ ] Page de tarification accessible publiquement
- [ ] Politique de confidentialité mise à jour
- [ ] Mentions légales mises à jour avec CGV

---

## 🎯 Métriques de succès

Après déploiement, surveiller :
- **Taux de conversion essai → abonnement payant** (objectif : >30%)
- **Taux de rétention mensuel** (objectif : >85%)
- **Taux d'annulation en période d'essai** (objectif : <40%)
- **Délai moyen de paiement après échec** (objectif : <3 jours)
- **Logs d'erreurs webhooks Stripe** (objectif : 0 erreur)

---

## 📚 Ressources

- [Documentation Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [RGPD - Article 28 (Sous-traitance)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre4#Article28)
- [Code de la consommation - Droit de rétractation](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227301)

---

## ⚠️ Notes importantes

1. **Mode test Stripe** : Utiliser les cartes de test Stripe pour valider le flux complet
   - Succès : `4242 4242 4242 4242`
   - Échec : `4000 0000 0000 0002`

2. **Webhooks en local** : Utiliser Stripe CLI pour tester en développement
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Migrations** : Toujours tester les migrations sur une branche Neon de dev avant production

4. **Sécurité** : Ne jamais exposer `STRIPE_SECRET_KEY` côté client, toujours utiliser `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

5. **RGPD** : Stripe est conforme RGPD en tant que sous-traitant (Art. 28), pas besoin de DPA séparé pour volumes faibles

---

## 🤖 Annexe : Gestion via MCP Stripe

Le MCP (Model Context Protocol) Stripe permet de gérer votre configuration Stripe directement via Claude Code, sans écrire de scripts. Voici comment l'utiliser pour accélérer votre workflow.

### Commandes MCP Stripe disponibles

#### 1. Vérifier la configuration actuelle

```plaintext
# Obtenir les informations du compte
mcp__stripe__get_stripe_account_info

# Lister les produits
mcp__stripe__list_products (limit: 10)

# Lister les prix
mcp__stripe__list_prices (limit: 10)

# Lister les clients
mcp__stripe__list_customers (limit: 10, email: "user@example.com")

# Lister les abonnements
mcp__stripe__list_subscriptions (customer: "cus_xxx", status: "active", limit: 10)
```

#### 2. Créer des éléments

```plaintext
# Créer un produit
mcp__stripe__create_product (
  name: "Health In Cloud - Abonnement",
  description: "Accès complet à la plateforme"
)

# Créer un prix
mcp__stripe__create_price (
  product: "prod_xxx",
  unit_amount: 1900,  # En centimes (19.00 EUR)
  currency: "eur",
  recurring: {"interval": "month"}
)

# Créer un client
mcp__stripe__create_customer (
  name: "Jean Dupont",
  email: "jean@example.com"
)

# Créer un coupon
mcp__stripe__create_coupon (
  name: "Lancement -50%",
  percent_off: 50,
  duration: "repeating",
  duration_in_months: 3
)

# Créer un lien de paiement
mcp__stripe__create_payment_link (
  price: "price_xxx",
  quantity: 1
)
```

#### 3. Rechercher dans Stripe

```plaintext
# Rechercher des clients par email
mcp__stripe__search_stripe_resources (
  query: "customers:email~\"@example.com\""
)

# Rechercher des abonnements actifs
mcp__stripe__search_stripe_resources (
  query: "subscriptions:status:\"active\""
)

# Rechercher des paiements échoués
mcp__stripe__search_stripe_resources (
  query: "payment_intents:status:\"requires_payment_method\""
)
```

#### 4. Récupérer un objet spécifique

```plaintext
# Récupérer les détails d'un client, abonnement, etc.
mcp__stripe__fetch_stripe_resources (
  id: "cus_xxx" ou "sub_xxx" ou "pi_xxx"
)
```

### Workflow typique avec MCP Stripe

#### Scénario 1 : Configuration initiale (déjà fait !)

```plaintext
1. Vérifier le compte
   → mcp__stripe__get_stripe_account_info

2. Créer un produit
   → mcp__stripe__create_product (...)
   → Résultat : prod_TEyCCLs8neQmi2 ✅

3. Créer les prix
   → mcp__stripe__create_price (mensuel) ✅
   → mcp__stripe__create_price (annuel) ✅

4. Vérifier la configuration
   → mcp__stripe__list_products
   → mcp__stripe__list_prices
```

#### Scénario 2 : Debugging d'un problème client

```plaintext
1. Rechercher le client par email
   → mcp__stripe__search_stripe_resources (
       query: "customers:email:\"user@example.com\""
     )

2. Récupérer les détails du client
   → mcp__stripe__fetch_stripe_resources (id: "cus_xxx")

3. Voir ses abonnements
   → mcp__stripe__list_subscriptions (customer: "cus_xxx")

4. Vérifier les paiements
   → mcp__stripe__list_payment_intents (customer: "cus_xxx", limit: 10)

5. Voir les factures
   → mcp__stripe__list_invoices (customer: "cus_xxx", limit: 10)
```

#### Scénario 3 : Créer un coupon promotionnel

```plaintext
1. Créer le coupon
   → mcp__stripe__create_coupon (
       name: "NOEL2025",
       percent_off: 30,
       duration: "repeating",
       duration_in_months: 3
     )

2. Lister les coupons existants
   → mcp__stripe__list_coupons (limit: 10)
```

#### Scénario 4 : Gérer un litige (dispute)

```plaintext
1. Lister les litiges récents
   → mcp__stripe__list_disputes (limit: 10)

2. Mettre à jour un litige avec des preuves
   → mcp__stripe__update_dispute (
       dispute: "dp_xxx",
       evidence: {
         "cancellation_rebuttal": "Le client a bien reçu l'accès..."
       },
       submit: true
     )
```

### Avantages du MCP Stripe

✅ **Pas de script nécessaire** : Toutes les opérations via commandes Claude
✅ **Feedback immédiat** : Voir les résultats en temps réel
✅ **Debugging rapide** : Recherche et inspection en une commande
✅ **Sécurisé** : Utilise vos clés API Stripe existantes
✅ **Documentation intégrée** : Claude connaît la syntaxe Stripe

### Configuration requise

Le MCP Stripe nécessite que vos clés API Stripe soient configurées dans votre environnement. Assurez-vous que `STRIPE_SECRET_KEY` est définie.

### Exemples d'utilisation avancée

#### Créer un lien de paiement pour une offre spéciale

```plaintext
# 1. Créer un prix spécial (one-time)
mcp__stripe__create_price (
  product: "prod_TEyCCLs8neQmi2",
  unit_amount: 990,  # 9.90 EUR
  currency: "eur",
  recurring: {"interval": "month", "trial_period_days": 30}
)

# 2. Créer le lien de paiement
mcp__stripe__create_payment_link (
  price: "price_xxx",
  quantity: 1
)
→ Résultat : https://buy.stripe.com/xxx (lien à partager)
```

#### Analyser les métriques d'abonnement

```plaintext
# Abonnements actifs
mcp__stripe__list_subscriptions (status: "active")

# Abonnements annulés ce mois
mcp__stripe__search_stripe_resources (
  query: "subscriptions:status:\"canceled\" AND canceled_at>2025-10-01"
)

# Clients avec paiements échoués
mcp__stripe__list_payment_intents (status: "requires_payment_method")
```

### Ressources MCP Stripe

- **Documentation Stripe** : [stripe.com/docs/api](https://stripe.com/docs/api)
- **Syntaxe de recherche** : [stripe.com/docs/search](https://stripe.com/docs/search)
- **Cartes de test** : [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

**Document créé le** : 15 octobre 2025
**Dernière mise à jour** : 15 octobre 2025
**Auteur** : Claude Code (avec validation humaine requise)
