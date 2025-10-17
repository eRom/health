/**
 * PostHog Event Type Definitions
 *
 * This module provides type-safe event tracking for PostHog analytics.
 * All events and their properties are defined here to ensure consistency.
 */

// =============================================================================
// Event Categories
// =============================================================================

export enum EventCategory {
  AUTH = 'auth',
  EXERCISE = 'exercise',
  BADGE = 'badge',
  SUBSCRIPTION = 'subscription',
  NAVIGATION = 'navigation',
  ONBOARDING = 'onboarding',
  CONSENT = 'consent',
  PROFILE = 'profile',
  HEALTHCARE = 'healthcare',
  ADMIN = 'admin',
}

// =============================================================================
// Authentication Events
// =============================================================================

export const AuthEvents = {
  SIGNUP_INITIATED: 'user_signup_initiated',
  SIGNUP_COMPLETED: 'user_signup_completed',
  SIGNUP_FAILED: 'user_signup_failed',
  LOGIN_INITIATED: 'user_login_initiated',
  LOGIN_COMPLETED: 'user_login_completed',
  LOGIN_FAILED: 'user_login_failed',
  LOGOUT: 'user_logout',
  EMAIL_VERIFICATION_SENT: 'email_verification_sent',
  EMAIL_VERIFIED: 'email_verified',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  OAUTH_LOGIN_INITIATED: 'oauth_login_initiated',
  OAUTH_LOGIN_COMPLETED: 'oauth_login_completed',
} as const

export type AuthEvent = (typeof AuthEvents)[keyof typeof AuthEvents]

export interface AuthEventProperties {
  method?: 'email' | 'google' | 'oauth'
  provider?: string
  error?: string
  error_code?: string
  email?: string
}

// =============================================================================
// Exercise Events
// =============================================================================

export const ExerciseEvents = {
  EXERCISE_VIEWED: 'exercise_viewed',
  EXERCISE_STARTED: 'exercise_started',
  EXERCISE_COMPLETED: 'exercise_completed',
  EXERCISE_ABANDONED: 'exercise_abandoned',
  EXERCISE_FAILED: 'exercise_failed',
  EXERCISE_RETRIED: 'exercise_retried',
} as const

export type ExerciseEvent = (typeof ExerciseEvents)[keyof typeof ExerciseEvents]

export interface ExerciseEventProperties {
  exercise_type: 'neuro' | 'ortho' | 'ergo' | 'kine'
  exercise_name: string
  exercise_id?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  duration_seconds?: number
  score?: number
  max_score?: number
  accuracy?: number
  attempts?: number
  completion_rate?: number
  session_id?: string
}

// =============================================================================
// Badge Events
// =============================================================================

export const BadgeEvents = {
  BADGE_UNLOCKED: 'badge_unlocked',
  BADGE_VIEWED: 'badge_viewed',
  BADGE_SHARED: 'badge_shared',
  BADGE_SHARE_CLICKED: 'badge_share_clicked',
  BADGE_LIST_VIEWED: 'badge_list_viewed',
} as const

export type BadgeEvent = (typeof BadgeEvents)[keyof typeof BadgeEvents]

export interface BadgeEventProperties {
  badge_id: string
  badge_name: string
  badge_type?: string
  badge_tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  share_platform?: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link'
  total_badges?: number
  progress_percentage?: number
}

// =============================================================================
// Subscription Events
// =============================================================================

export const SubscriptionEvents = {
  PRICING_VIEWED: 'pricing_viewed',
  SUBSCRIPTION_INITIATED: 'subscription_initiated',
  SUBSCRIPTION_COMPLETED: 'subscription_completed',
  SUBSCRIPTION_FAILED: 'subscription_failed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_PAST_DUE: 'subscription_past_due',
  PAYMENT_METHOD_UPDATED: 'payment_method_updated',
  TRIAL_STARTED: 'trial_started',
  TRIAL_ENDING: 'trial_ending',
  TRIAL_ENDED: 'trial_ended',
} as const

export type SubscriptionEvent =
  (typeof SubscriptionEvents)[keyof typeof SubscriptionEvents]

export interface SubscriptionEventProperties {
  plan_type?: 'monthly' | 'yearly'
  plan_price?: number
  plan_currency?: string
  trial_days?: number
  subscription_id?: string
  subscription_status?:
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
  payment_method?: string
  error?: string
  cancellation_reason?: string
}

// =============================================================================
// Navigation Events
// =============================================================================

export const NavigationEvents = {
  PAGE_VIEWED: 'page_viewed',
  LINK_CLICKED: 'link_clicked',
  NAVIGATION_ITEM_CLICKED: 'navigation_item_clicked',
  EXTERNAL_LINK_CLICKED: 'external_link_clicked',
  CTA_CLICKED: 'cta_clicked',
} as const

export type NavigationEvent =
  (typeof NavigationEvents)[keyof typeof NavigationEvents]

export interface NavigationEventProperties {
  page_path: string
  page_title?: string
  referrer?: string
  link_url?: string
  link_text?: string
  cta_type?: string
  cta_location?: string
}

// =============================================================================
// Onboarding Events
// =============================================================================

export const OnboardingEvents = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
} as const

export type OnboardingEvent =
  (typeof OnboardingEvents)[keyof typeof OnboardingEvents]

export interface OnboardingEventProperties {
  step_number?: number
  step_name?: string
  total_steps?: number
  completion_rate?: number
  time_spent_seconds?: number
}

// =============================================================================
// Consent Events
// =============================================================================

export const ConsentEvents = {
  CONSENT_VIEWED: 'consent_viewed',
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_DECLINED: 'consent_declined',
  CONSENT_UPDATED: 'consent_updated',
  CONSENT_WITHDRAWN: 'consent_withdrawn',
  SESSION_RECORDING_ENABLED: 'session_recording_enabled',
  SESSION_RECORDING_DISABLED: 'session_recording_disabled',
} as const

export type ConsentEvent = (typeof ConsentEvents)[keyof typeof ConsentEvents]

export interface ConsentEventProperties {
  consent_type: 'health_data' | 'analytics' | 'marketing' | 'session_recording'
  consent_status: boolean
  consent_version?: string
  previous_status?: boolean
}

// =============================================================================
// Profile Events
// =============================================================================

export const ProfileEvents = {
  PROFILE_VIEWED: 'profile_viewed',
  PROFILE_UPDATED: 'profile_updated',
  AVATAR_UPDATED: 'avatar_updated',
  PREFERENCES_UPDATED: 'preferences_updated',
  LOCALE_CHANGED: 'locale_changed',
  THEME_CHANGED: 'theme_changed',
} as const

export type ProfileEvent = (typeof ProfileEvents)[keyof typeof ProfileEvents]

export interface ProfileEventProperties {
  field_updated?: string
  previous_value?: string
  new_value?: string
  locale?: 'fr' | 'en'
  theme?: string
}

// =============================================================================
// Healthcare Provider Events
// =============================================================================

export const HealthcareEvents = {
  PATIENT_VIEWED: 'patient_viewed',
  PATIENT_ADDED: 'patient_added',
  PATIENT_REMOVED: 'patient_removed',
  PATIENT_PROGRESS_VIEWED: 'patient_progress_viewed',
  PATIENT_REPORT_GENERATED: 'patient_report_generated',
  PATIENT_NOTE_ADDED: 'patient_note_added',
} as const

export type HealthcareEvent =
  (typeof HealthcareEvents)[keyof typeof HealthcareEvents]

export interface HealthcareEventProperties {
  patient_id?: string
  provider_id?: string
  report_type?: string
  note_type?: string
  patient_count?: number
}

// =============================================================================
// Admin Events
// =============================================================================

export const AdminEvents = {
  ADMIN_PANEL_VIEWED: 'admin_panel_viewed',
  USER_MANAGED: 'user_managed',
  CONTENT_MANAGED: 'content_managed',
  SYSTEM_SETTINGS_UPDATED: 'system_settings_updated',
} as const

export type AdminEvent = (typeof AdminEvents)[keyof typeof AdminEvents]

export interface AdminEventProperties {
  action?: 'create' | 'update' | 'delete' | 'view'
  resource_type?: string
  resource_id?: string
}

// =============================================================================
// Union Types
// =============================================================================

export type PostHogEvent =
  | AuthEvent
  | ExerciseEvent
  | BadgeEvent
  | SubscriptionEvent
  | NavigationEvent
  | OnboardingEvent
  | ConsentEvent
  | ProfileEvent
  | HealthcareEvent
  | AdminEvent

export type PostHogEventProperties =
  | AuthEventProperties
  | ExerciseEventProperties
  | BadgeEventProperties
  | SubscriptionEventProperties
  | NavigationEventProperties
  | OnboardingEventProperties
  | ConsentEventProperties
  | ProfileEventProperties
  | HealthcareEventProperties
  | AdminEventProperties

// =============================================================================
// Event Helpers
// =============================================================================

/**
 * Get event category from event name
 */
export function getEventCategory(eventName: string): EventCategory | undefined {
  if (Object.values(AuthEvents).includes(eventName as AuthEvent)) {
    return EventCategory.AUTH
  }
  if (Object.values(ExerciseEvents).includes(eventName as ExerciseEvent)) {
    return EventCategory.EXERCISE
  }
  if (Object.values(BadgeEvents).includes(eventName as BadgeEvent)) {
    return EventCategory.BADGE
  }
  if (
    Object.values(SubscriptionEvents).includes(eventName as SubscriptionEvent)
  ) {
    return EventCategory.SUBSCRIPTION
  }
  if (
    Object.values(NavigationEvents).includes(eventName as NavigationEvent)
  ) {
    return EventCategory.NAVIGATION
  }
  if (
    Object.values(OnboardingEvents).includes(eventName as OnboardingEvent)
  ) {
    return EventCategory.ONBOARDING
  }
  if (Object.values(ConsentEvents).includes(eventName as ConsentEvent)) {
    return EventCategory.CONSENT
  }
  if (Object.values(ProfileEvents).includes(eventName as ProfileEvent)) {
    return EventCategory.PROFILE
  }
  if (
    Object.values(HealthcareEvents).includes(eventName as HealthcareEvent)
  ) {
    return EventCategory.HEALTHCARE
  }
  if (Object.values(AdminEvents).includes(eventName as AdminEvent)) {
    return EventCategory.ADMIN
  }
  return undefined
}

/**
 * Check if an event name is valid
 */
export function isValidEvent(eventName: string): eventName is PostHogEvent {
  return getEventCategory(eventName) !== undefined
}
