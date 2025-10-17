'use client'

/**
 * PostHog Provider Component
 *
 * This provider initializes PostHog analytics and handles:
 * - Automatic pageview tracking
 * - User identification when authenticated
 * - Session recording (with GDPR consent)
 * - Locale and environment configuration
 */

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import {
  initPostHog,
  identifyUser,
  resetPostHog,
  captureEvent,
  registerSuperProperties,
  isInitialized,
} from '@/lib/posthog-client'

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const previousUserIdRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize PostHog on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      initPostHog()
      isInitializedRef.current = true

      // Register super properties (added to all events)
      const locale = pathname.startsWith('/fr') ? 'fr' : 'en'
      registerSuperProperties({
        locale,
        app_name: 'Health In Cloud',
        app_environment: process.env.NODE_ENV,
      })
    }
  }, [pathname])

  // Handle user identification and session changes
  useEffect(() => {
    if (!isInitialized()) return

    const currentUserId = session?.user?.id

    // User logged in or switched accounts
    if (currentUserId && currentUserId !== previousUserIdRef.current) {
      // Identify user in PostHog
      identifyUser(currentUserId, {
        email: session.user.email,
        email_verified: session.user.emailVerified,
        locale: pathname.startsWith('/fr') ? 'fr' : 'en',
      })

      previousUserIdRef.current = currentUserId
    }

    // User logged out
    if (!currentUserId && previousUserIdRef.current) {
      resetPostHog()
      previousUserIdRef.current = null
    }
  }, [session, pathname])

  // Track pageviews
  useEffect(() => {
    if (!isInitialized()) return

    // Extract locale from pathname
    const locale = pathname.startsWith('/fr') ? 'fr' : 'en'

    // Build page properties
    const pageProperties = {
      page_path: pathname,
      page_url: window.location.href,
      page_title: document.title,
      locale,
      referrer: document.referrer || undefined,
      search_params: searchParams.toString() || undefined,
    }

    // Capture pageview event
    captureEvent('$pageview', pageProperties)
  }, [pathname, searchParams])

  // Return children without wrapper (provider logic is in hooks)
  return <>{children}</>
}
