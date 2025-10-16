/**
 * Server-side subscription guard for protected pages
 * Use this in Server Components to protect routes that require an active subscription
 */

import { redirect } from '@/i18n/routing'
import { hasActiveSubscription } from './subscription'

/**
 * Check if user has active subscription and redirect if not
 * Use this at the top of protected page components
 *
 * @example
 * ```tsx
 * export default async function ProtectedPage({ params }) {
 *   const { locale } = await params
 *   const session = await auth.api.getSession({ headers: await headers() })
 *   if (!session) redirect({ href: '/auth/login', locale })
 *
 *   await requireSubscription(session.user.id, locale)
 *
 *   // ... rest of page
 * }
 * ```
 */
export async function requireSubscription(
  userId: string,
  locale: string
): Promise<void> {
  const hasSubscription = await hasActiveSubscription(userId)

  if (!hasSubscription) {
    redirect({ href: '/subscription?blocked=true', locale })
  }
}
