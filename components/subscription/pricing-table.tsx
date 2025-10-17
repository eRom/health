'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
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
import { createCheckoutSession } from '@/app/actions/create-checkout-session'
import { useTranslations } from 'next-intl'

type PlanType = 'monthly' | 'yearly'

interface PricingTableProps {
  isAuthenticated: boolean
}

const features = [
  'features.unlimitedAccess',
  'features.allExercises',
  'features.progressTracking',
  'features.personalizedDashboard',
  'features.dataExport',
  'features.emailSupport',
]

export function PricingTable({ isAuthenticated }: PricingTableProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('subscription')
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)

  const handleSelectPlan = async (plan: PlanType) => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=/subscription`)
      return
    }

    setLoadingPlan(plan)
    try {
      const { url } = await createCheckoutSession(plan, locale)
      if (url) {
        router.push(url)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      {/* Monthly Plan */}
      <Card className="relative flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl">{t('pricing.monthly.title')}</CardTitle>
          <CardDescription>
            {t('pricing.monthly.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">X€</span>
              <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('pricing.trialIncluded')}
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                <span className="text-sm">{t(feature)}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => handleSelectPlan('monthly')}
            disabled={loadingPlan !== null}
            className="w-full"
            size="lg"
          >
            {loadingPlan === 'monthly' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('pricing.loading')}
              </>
            ) : (
              t('pricing.selectPlan')
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Yearly Plan */}
      <Card className="relative flex flex-col border-primary shadow-lg">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            {t('pricing.yearly.badge')}
          </Badge>
        </div>

        <CardHeader>
          <CardTitle className="text-2xl">{t('pricing.yearly.title')}</CardTitle>
          <CardDescription>
            {t('pricing.yearly.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">X€</span>
              <span className="text-muted-foreground">{t('pricing.perYear')}</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">
              {t('pricing.yearly.savings')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('pricing.trialIncluded')}
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                <span className="text-sm">{t(feature)}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => handleSelectPlan('yearly')}
            disabled={loadingPlan !== null}
            className="w-full"
            size="lg"
          >
            {loadingPlan === 'yearly' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('pricing.loading')}
              </>
            ) : (
              t('pricing.selectPlan')
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
