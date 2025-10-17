/**
 * PostHog Property Builders
 *
 * This module provides helper functions to build consistent property objects
 * for PostHog events, including common properties that should be added to all events.
 */

import type { User } from '@prisma/client'

// =============================================================================
// Common Properties
// =============================================================================

export interface CommonProperties {
  locale?: 'fr' | 'en'
  environment: 'development' | 'preview' | 'production'
  timestamp?: string
  app_version?: string
  platform?: 'web' | 'mobile' | 'desktop'
  user_agent?: string
}

/**
 * Build common properties that should be added to all events
 */
export function buildCommonProperties(
  locale?: string,
  userAgent?: string
): CommonProperties {
  const environment =
    process.env.VERCEL_ENV === 'production'
      ? 'production'
      : process.env.VERCEL_ENV === 'preview'
        ? 'preview'
        : 'development'

  return {
    locale: (locale as 'fr' | 'en') || 'fr',
    environment,
    timestamp: new Date().toISOString(),
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    platform: 'web',
    user_agent: userAgent,
  }
}

// =============================================================================
// User Properties
// =============================================================================

export interface UserProperties {
  user_id: string
  email?: string
  role?: string
  email_verified?: boolean
  created_at?: string
  subscription_status?: string
  subscription_plan?: string
  total_exercises?: number
  total_badges?: number
  streak_days?: number
  locale?: 'fr' | 'en'
}

/**
 * Build user properties from a User object or session user
 */
export function buildUserProperties(
  user:
    | Pick<User, 'id' | 'email' | 'role' | 'emailVerified' | 'createdAt'>
    | { id: string; email: string; emailVerified: boolean; createdAt: Date }
): UserProperties {
  const role = 'role' in user ? user.role : undefined
  return {
    user_id: user.id,
    email: user.email,
    role,
    email_verified: user.emailVerified ?? false,
    created_at: user.createdAt.toISOString(),
  }
}

/**
 * Enrich user properties with additional data
 */
export function enrichUserProperties(
  baseProperties: UserProperties,
  additionalData: {
    subscriptionStatus?: string
    subscriptionPlan?: string
    totalExercises?: number
    totalBadges?: number
    streakDays?: number
    locale?: 'fr' | 'en'
  }
): UserProperties {
  return {
    ...baseProperties,
    subscription_status: additionalData.subscriptionStatus,
    subscription_plan: additionalData.subscriptionPlan,
    total_exercises: additionalData.totalExercises,
    total_badges: additionalData.totalBadges,
    streak_days: additionalData.streakDays,
    locale: additionalData.locale,
  }
}

// =============================================================================
// Exercise Properties
// =============================================================================

export interface ExerciseProperties {
  exercise_type: 'neuro' | 'ortho' | 'ergo' | 'kine'
  exercise_name: string
  exercise_id?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  duration_seconds?: number
  score?: number
  max_score?: number
  accuracy_percentage?: number
  attempts?: number
  is_completed?: boolean
  completion_time?: string
}

/**
 * Build exercise properties
 */
export function buildExerciseProperties(
  exerciseType: 'neuro' | 'ortho' | 'ergo' | 'kine',
  exerciseName: string,
  additionalData?: {
    exerciseId?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    durationSeconds?: number
    score?: number
    maxScore?: number
    attempts?: number
  }
): ExerciseProperties {
  const accuracy =
    additionalData?.score && additionalData?.maxScore
      ? Math.round((additionalData.score / additionalData.maxScore) * 100)
      : undefined

  return {
    exercise_type: exerciseType,
    exercise_name: exerciseName,
    exercise_id: additionalData?.exerciseId,
    difficulty: additionalData?.difficulty,
    duration_seconds: additionalData?.durationSeconds,
    score: additionalData?.score,
    max_score: additionalData?.maxScore,
    accuracy_percentage: accuracy,
    attempts: additionalData?.attempts,
    is_completed: true,
    completion_time: new Date().toISOString(),
  }
}

// =============================================================================
// Subscription Properties
// =============================================================================

export interface SubscriptionProperties {
  subscription_id?: string
  plan_type?: 'monthly' | 'yearly'
  plan_price?: number
  plan_currency?: string
  trial_days?: number
  subscription_status?:
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
  payment_method?: string
  next_billing_date?: string
  cancellation_reason?: string
}

/**
 * Build subscription properties
 */
export function buildSubscriptionProperties(
  subscriptionData: {
    subscriptionId?: string
    planType?: 'monthly' | 'yearly'
    planPrice?: number
    planCurrency?: string
    trialDays?: number
    status?:
      | 'incomplete'
      | 'incomplete_expired'
      | 'trialing'
      | 'active'
      | 'past_due'
      | 'canceled'
      | 'unpaid'
    paymentMethod?: string
    nextBillingDate?: Date
    cancellationReason?: string
  }
): SubscriptionProperties {
  return {
    subscription_id: subscriptionData.subscriptionId,
    plan_type: subscriptionData.planType,
    plan_price: subscriptionData.planPrice,
    plan_currency: subscriptionData.planCurrency || 'EUR',
    trial_days: subscriptionData.trialDays,
    subscription_status: subscriptionData.status,
    payment_method: subscriptionData.paymentMethod,
    next_billing_date: subscriptionData.nextBillingDate?.toISOString(),
    cancellation_reason: subscriptionData.cancellationReason,
  }
}

// =============================================================================
// Badge Properties
// =============================================================================

export interface BadgeProperties {
  badge_id: string
  badge_name: string
  badge_type?: string
  badge_tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  earned_at?: string
  share_platform?: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link'
  total_user_badges?: number
  badge_progress_percentage?: number
}

/**
 * Build badge properties
 */
export function buildBadgeProperties(
  badgeId: string,
  badgeName: string,
  additionalData?: {
    badgeType?: string
    badgeTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
    earnedAt?: Date
    sharePlatform?: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link'
    totalUserBadges?: number
    progressPercentage?: number
  }
): BadgeProperties {
  return {
    badge_id: badgeId,
    badge_name: badgeName,
    badge_type: additionalData?.badgeType,
    badge_tier: additionalData?.badgeTier,
    earned_at: additionalData?.earnedAt?.toISOString(),
    share_platform: additionalData?.sharePlatform,
    total_user_badges: additionalData?.totalUserBadges,
    badge_progress_percentage: additionalData?.progressPercentage,
  }
}

// =============================================================================
// Navigation Properties
// =============================================================================

export interface NavigationProperties {
  page_path: string
  page_title?: string
  referrer?: string
  search_params?: string
  hash?: string
}

/**
 * Build navigation properties
 */
export function buildNavigationProperties(
  pagePath: string,
  additionalData?: {
    pageTitle?: string
    referrer?: string
    searchParams?: URLSearchParams
    hash?: string
  }
): NavigationProperties {
  return {
    page_path: pagePath,
    page_title: additionalData?.pageTitle,
    referrer: additionalData?.referrer,
    search_params: additionalData?.searchParams?.toString(),
    hash: additionalData?.hash,
  }
}

// =============================================================================
// Error Properties
// =============================================================================

export interface ErrorProperties {
  error_message: string
  error_code?: string
  error_type?: string
  error_stack?: string
  context?: Record<string, unknown>
}

/**
 * Build error properties
 */
export function buildErrorProperties(
  error: Error | string,
  additionalData?: {
    errorCode?: string
    errorType?: string
    context?: Record<string, unknown>
  }
): ErrorProperties {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack

  return {
    error_message: errorMessage,
    error_code: additionalData?.errorCode,
    error_type: additionalData?.errorType,
    error_stack: errorStack,
    context: additionalData?.context,
  }
}

// =============================================================================
// Merge Utilities
// =============================================================================

/**
 * Merge multiple property objects into one
 * Later objects override earlier ones
 */
export function mergeProperties(
  ...propertyObjects: Array<Record<string, unknown> | undefined>
): Record<string, unknown> {
  return propertyObjects.reduce<Record<string, unknown>>(
    (acc, obj) => ({
      ...acc,
      ...obj,
    }),
    {}
  )
}

/**
 * Remove undefined and null values from properties
 */
export function cleanProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) => value !== undefined && value !== null
    )
  )
}

/**
 * Build complete event properties with common properties
 */
export function buildEventProperties(
  specificProperties: Record<string, unknown>,
  locale?: string,
  userAgent?: string
): Record<string, unknown> {
  const commonProps = buildCommonProperties(locale, userAgent) as unknown as Record<string, unknown>
  const merged = mergeProperties(commonProps, specificProperties)
  return cleanProperties(merged)
}
