import { Suspense } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getSubscriptionStatus } from '@/app/actions/get-subscription-status'
import { PricingTable } from '@/components/subscription/pricing-table'
import { SubscriptionCard } from '@/components/subscription/subscription-card'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'subscription' })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}

async function SubscriptionContent({
  searchParams,
}: {
  searchParams: { blocked?: string }
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const subscription = session?.user
    ? await getSubscriptionStatus()
    : null

  const t = await getTranslations('subscription')

  // Show alert if user was redirected due to no subscription
  const showBlockedAlert = searchParams.blocked === 'true' && !subscription

  return (
    <div className="container max-w-6xl space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('page.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('page.description')}
        </p>
      </div>

      {/* Alert when user was blocked due to no subscription */}
      {showBlockedAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('page.accessBlocked.title')}</AlertTitle>
          <AlertDescription>
            {t('page.accessBlocked.description')}
          </AlertDescription>
        </Alert>
      )}

      {/* Current subscription status if authenticated */}
      {session?.user && (
        <div className="mx-auto max-w-2xl">
          <SubscriptionCard subscription={subscription} />
        </div>
      )}

      {/* Pricing plans */}
      {(!session?.user || !subscription || subscription.status === 'CANCELED') && (
        <>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">{t('page.choosePlan')}</h2>
            <p className="text-muted-foreground">
              {t('page.choosePlanDescription')}
            </p>
          </div>

          <PricingTable isAuthenticated={!!session?.user} />

          {/* Trial information card */}
          <Card className="mx-auto max-w-2xl border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {t('page.trialInfo.title')}
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{t('page.trialInfo.duration')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{t('page.trialInfo.fullAccess')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{t('page.trialInfo.noCharge')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{t('page.trialInfo.cancelAnytime')}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>
}) {
  const resolvedSearchParams = await searchParams

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SubscriptionContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}
