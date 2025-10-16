/**
 * Wrapper component to protect client pages that require an active subscription
 * This is a Server Component that checks subscription before rendering the client component
 */

import { auth } from '@/lib/auth'
import { requireSubscription } from '@/lib/subscription-guard'
import { headers } from 'next/headers'
import { redirect } from '@/i18n/routing'
import { ReactNode } from 'react'

interface ProtectedClientPageProps {
  locale: string
  children: ReactNode
}

export async function ProtectedClientPage({
  locale,
  children,
}: ProtectedClientPageProps) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect({ href: '/auth/login', locale })
    return null
  }

  // Check subscription
  await requireSubscription(session.user.id, locale)

  // Render the client component if all checks pass
  return <>{children}</>
}
