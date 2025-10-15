import { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'subscription' })

  return {
    title: t('success.meta.title'),
    description: t('success.meta.description'),
  }
}

function LoadingState() {
  return (
    <div className="container flex min-h-[60vh] max-w-2xl items-center justify-center py-8">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuccessContent({
  searchParams,
  locale,
}: {
  searchParams: { session_id?: string }
  locale: string
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect(`/${locale}/subscription`)
  }

  // Retrieve checkout session details
  let checkoutSession
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    redirect(`/${locale}/subscription`)
  }

  // Verify this session belongs to the current user
  if (checkoutSession.metadata?.userId !== session.user.id) {
    redirect(`/${locale}/subscription`)
  }

  const t = await getTranslations({ locale, namespace: 'subscription' })

  return (
    <div className="container max-w-2xl space-y-8 py-8">
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-900 dark:text-green-100">
            {t('success.title')}
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            {t('success.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border border-green-300 bg-white p-4 dark:border-green-800 dark:bg-green-950/50">
            <h3 className="mb-3 font-semibold text-green-900 dark:text-green-100">
              {t('success.nextSteps.title')}
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>{t('success.nextSteps.step1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>{t('success.nextSteps.step2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>{t('success.nextSteps.step3')}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">{t('success.reminder.title')}</span>{' '}
              {t('success.reminder.description')}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:flex-1">
            <Link href={`/${locale}/dashboard`}>
              {t('success.cta.dashboard')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:flex-1">
            <Link href={`/${locale}/profile`}>
              {t('success.cta.profile')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default async function SubscriptionSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessContent searchParams={resolvedSearchParams} locale={locale} />
    </Suspense>
  )
}
