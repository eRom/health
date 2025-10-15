/**
 * Subscription check utilities for middleware and server components
 * These are optimized for performance and avoid heavy Prisma queries
 */

import { prisma } from './prisma'

/**
 * Check if a user has an active subscription (including trial and grace period)
 * Optimized for middleware with minimal database queries
 */
export async function checkUserSubscription(userId: string): Promise<{
  hasAccess: boolean
  subscription: {
    status: string
    trialEnd: Date | null
    currentPeriodEnd: Date | null
  } | null
}> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
        trialEnd: true,
        currentPeriodEnd: true,
      },
    })

    if (!subscription) {
      return { hasAccess: false, subscription: null }
    }

    // Check if subscription grants access
    const now = new Date()

    // Trial period grants access
    if (subscription.status === 'TRIALING') {
      return { hasAccess: true, subscription }
    }

    // Active subscription grants access
    if (subscription.status === 'ACTIVE') {
      return { hasAccess: true, subscription }
    }

    // Past due with grace period (7 days after period end)
    if (subscription.status === 'PAST_DUE' && subscription.currentPeriodEnd) {
      const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

      if (now < gracePeriodEnd) {
        return { hasAccess: true, subscription }
      }
    }

    return { hasAccess: false, subscription }
  } catch (error) {
    console.error('Error checking subscription:', error)
    // On error, deny access by default for security
    return { hasAccess: false, subscription: null }
  }
}

/**
 * Routes that require an active subscription
 * Public routes and subscription-related pages are excluded
 */
export function requiresSubscription(pathname: string): boolean {
  // Exclude public routes
  if (
    pathname === '/' ||
    pathname.match(/^\/(fr|en)\/?$/) ||
    pathname.includes('/auth/') ||
    pathname.includes('/about') ||
    pathname.includes('/legal') ||
    pathname.includes('/privacy') ||
    pathname.includes('/gdpr') ||
    pathname.includes('/thanks') ||
    pathname.includes('/consent') ||
    pathname.includes('/offline')
  ) {
    return false
  }

  // Exclude subscription management pages
  if (
    pathname.includes('/subscription') ||
    pathname.includes('/api/webhooks/stripe')
  ) {
    return false
  }

  // Exclude admin routes (they have their own protection)
  if (pathname.includes('/admin')) {
    return false
  }

  // All other protected routes require subscription
  // This includes: dashboard, exercises, profile, analyse, healthcare, badges
  return true
}
