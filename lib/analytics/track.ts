/**
 * PostHog Tracking Helpers
 *
 * This module provides high-level helper functions for tracking events
 * with proper typing and automatic property enrichment.
 */

'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { trackUserEvent, trackAnonymousEvent } from '@/lib/posthog'
import {
  buildCommonProperties,
  buildUserProperties,
  buildEventProperties,
} from './properties'
import type {
  PostHogEvent,
  AuthEventProperties,
  ExerciseEventProperties,
  BadgeEventProperties,
  SubscriptionEventProperties,
  NavigationEventProperties,
  ConsentEventProperties,
} from './events'

// =============================================================================
// Core Tracking Function
// =============================================================================

/**
 * Track an event with automatic user identification and property enrichment
 *
 * This is the main tracking function that should be used from server actions.
 * It automatically adds common properties and user context.
 */
export async function trackEvent(
  eventName: PostHogEvent,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    // Get session and headers
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || undefined
    const locale = headersList.get('accept-language')?.split(',')[0]

    // Build common properties
    const commonProps = buildCommonProperties(locale, userAgent)

    // Merge with event-specific properties
    const allProperties = buildEventProperties(
      properties || {},
      locale,
      userAgent
    )

    // Track with user context if authenticated
    if (session?.user) {
      const userProps = buildUserProperties(session.user)
      const enrichedProps = {
        ...commonProps,
        ...userProps,
        ...allProperties,
      }

      await trackUserEvent(session.user.id, eventName, enrichedProps)
    } else {
      // Track as anonymous user
      const distinctId = headersList.get('x-forwarded-for') || 'anonymous'
      const enrichedProps = {
        ...commonProps,
        ...allProperties,
      }

      await trackAnonymousEvent(distinctId, eventName, enrichedProps)
    }
  } catch (error) {
    logger.error(error, 'Failed to track event', {
      eventName,
      properties,
    })
  }
}

// =============================================================================
// Specialized Tracking Functions
// =============================================================================

/**
 * Track an authentication event
 */
export async function trackAuthEvent(
  eventName: PostHogEvent,
  properties?: AuthEventProperties
): Promise<void> {
  return trackEvent(eventName, properties as Record<string, unknown>)
}

/**
 * Track an exercise event
 */
export async function trackExerciseEvent(
  eventName: PostHogEvent,
  properties: ExerciseEventProperties
): Promise<void> {
  return trackEvent(eventName, properties as unknown as Record<string, unknown>)
}

/**
 * Track a badge event
 */
export async function trackBadgeEvent(
  eventName: PostHogEvent,
  properties: BadgeEventProperties
): Promise<void> {
  return trackEvent(eventName, properties as unknown as Record<string, unknown>)
}

/**
 * Track a subscription event
 */
export async function trackSubscriptionEvent(
  eventName: PostHogEvent,
  properties?: SubscriptionEventProperties
): Promise<void> {
  return trackEvent(eventName, properties as unknown as Record<string, unknown>)
}

/**
 * Track a navigation event
 */
export async function trackNavigationEvent(
  eventName: PostHogEvent,
  properties: NavigationEventProperties
): Promise<void> {
  return trackEvent(eventName, properties as unknown as Record<string, unknown>)
}

/**
 * Track a consent event
 */
export async function trackConsentEvent(
  eventName: PostHogEvent,
  properties: ConsentEventProperties
): Promise<void> {
  return trackEvent(eventName, properties as unknown as Record<string, unknown>)
}

// =============================================================================
// Convenience Functions for Common Events
// =============================================================================

/**
 * Track user signup
 */
export async function trackSignup(
  method: 'email' | 'google' | 'oauth',
  email?: string
): Promise<void> {
  return trackAuthEvent('user_signup_completed', {
    method,
    email,
  })
}

/**
 * Track user login
 */
export async function trackLogin(
  method: 'email' | 'google' | 'oauth',
  email?: string
): Promise<void> {
  return trackAuthEvent('user_login_completed', {
    method,
    email,
  })
}

/**
 * Track user logout
 */
export async function trackLogout(): Promise<void> {
  return trackAuthEvent('user_logout', {})
}

/**
 * Track exercise completion
 */
export async function trackExerciseCompletion(
  exerciseType: 'neuro' | 'ortho' | 'ergo' | 'kine',
  exerciseName: string,
  options?: {
    durationSeconds?: number
    score?: number
    maxScore?: number
    difficulty?: 'easy' | 'medium' | 'hard'
  }
): Promise<void> {
  return trackExerciseEvent('exercise_completed', {
    exercise_type: exerciseType,
    exercise_name: exerciseName,
    duration_seconds: options?.durationSeconds,
    score: options?.score,
    max_score: options?.maxScore,
    difficulty: options?.difficulty,
    accuracy:
      options?.score && options?.maxScore
        ? Math.round((options.score / options.maxScore) * 100)
        : undefined,
  })
}

/**
 * Track badge unlock
 */
export async function trackBadgeUnlock(
  badgeId: string,
  badgeName: string,
  options?: {
    badgeType?: string
    badgeTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  }
): Promise<void> {
  return trackBadgeEvent('badge_unlocked', {
    badge_id: badgeId,
    badge_name: badgeName,
    badge_type: options?.badgeType,
    badge_tier: options?.badgeTier,
  })
}

/**
 * Track badge share
 */
export async function trackBadgeShare(
  badgeId: string,
  badgeName: string,
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link'
): Promise<void> {
  return trackBadgeEvent('badge_shared', {
    badge_id: badgeId,
    badge_name: badgeName,
    share_platform: platform,
  })
}

/**
 * Track page view
 */
export async function trackPageView(
  pagePath: string,
  pageTitle?: string
): Promise<void> {
  const headersList = await headers()
  const referrer = headersList.get('referer') || undefined

  return trackNavigationEvent('page_viewed', {
    page_path: pagePath,
    page_title: pageTitle,
    referrer,
  })
}

/**
 * Track consent granted
 */
export async function trackConsentGranted(
  consentType: 'health_data' | 'analytics' | 'marketing' | 'session_recording'
): Promise<void> {
  return trackConsentEvent('consent_granted', {
    consent_type: consentType,
    consent_status: true,
  })
}

/**
 * Track consent declined
 */
export async function trackConsentDeclined(
  consentType: 'health_data' | 'analytics' | 'marketing' | 'session_recording'
): Promise<void> {
  return trackConsentEvent('consent_declined', {
    consent_type: consentType,
    consent_status: false,
  })
}
