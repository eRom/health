'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createCustomerPortalSession } from '@/app/actions/create-customer-portal-session'
import { useTranslations } from 'next-intl'

type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'INCOMPLETE'
  | 'INCOMPLETE_EXPIRED'
  | 'UNPAID'

interface SubscriptionCardProps {
  subscription: {
    id: string
    status: SubscriptionStatus
    currentPeriodStart: Date
    currentPeriodEnd: Date
    trialEnd: Date | null
    cancelAtPeriodEnd: boolean
    canceledAt: Date | null
    stripePriceId: string
  } | null
}

const statusConfig = {
  TRIALING: {
    variant: 'default' as const,
    labelKey: 'status.trialing',
  },
  ACTIVE: {
    variant: 'default' as const,
    labelKey: 'status.active',
  },
  PAST_DUE: {
    variant: 'destructive' as const,
    labelKey: 'status.pastDue',
  },
  CANCELED: {
    variant: 'secondary' as const,
    labelKey: 'status.canceled',
  },
  INCOMPLETE: {
    variant: 'destructive' as const,
    labelKey: 'status.incomplete',
  },
  INCOMPLETE_EXPIRED: {
    variant: 'destructive' as const,
    labelKey: 'status.incompleteExpired',
  },
  UNPAID: {
    variant: 'destructive' as const,
    labelKey: 'status.unpaid',
  },
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('subscription')
  const [isLoading, setIsLoading] = useState(false)

  const dateLocale = locale === 'fr' ? fr : enUS

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const { url } = await createCustomerPortalSession(locale)
      if (url) {
        router.push(url)
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // No subscription
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('card.title')}</CardTitle>
          <CardDescription>{t('card.noSubscription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('card.noSubscriptionDescription')}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push(`/${locale}/subscription`)}
            className="w-full"
          >
            {t('card.startTrial')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const config = statusConfig[subscription.status]
  const isMonthly =
    subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
  const isYearly =
    subscription.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('card.title')}</CardTitle>
          <Badge variant={config.variant}>{t(config.labelKey)}</Badge>
        </div>
        <CardDescription>
          {isMonthly && t('plan.monthly')}
          {isYearly && t('plan.yearly')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial period */}
        {subscription.status === 'TRIALING' && subscription.trialEnd && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('card.trialEndsOn', {
                date: format(new Date(subscription.trialEnd), 'PPP', {
                  locale: dateLocale,
                }),
              })}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('card.trialDescription')}
            </p>
          </div>
        )}

        {/* Active subscription */}
        {subscription.status === 'ACTIVE' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('card.renewalDate')}
              </span>
              <span className="font-medium">
                {format(
                  new Date(subscription.currentPeriodEnd),
                  'PPP',
                  { locale: dateLocale }
                )}
              </span>
            </div>
          </div>
        )}

        {/* Cancellation warning */}
        {subscription.cancelAtPeriodEnd && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('card.canceledWarning', {
                date: format(
                  new Date(subscription.currentPeriodEnd),
                  'PPP',
                  { locale: dateLocale }
                ),
              })}
            </AlertDescription>
          </Alert>
        )}

        {/* Past due warning */}
        {subscription.status === 'PAST_DUE' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('card.pastDueWarning')}
            </AlertDescription>
          </Alert>
        )}

        {/* Canceled */}
        {subscription.status === 'CANCELED' && subscription.canceledAt && (
          <div className="text-sm text-muted-foreground">
            {t('card.canceledOn', {
              date: format(new Date(subscription.canceledAt), 'PPP', {
                locale: dateLocale,
              }),
            })}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleManageSubscription}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('card.loading')}
            </>
          ) : (
            <>
              {t('card.manageSubscription')}
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
