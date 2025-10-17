/**
 * PostHog Client-Side Configuration
 *
 * This module provides client-side utilities for PostHog analytics.
 * It should only be imported in client components ("use client").
 */

import posthog from 'posthog-js'

// Singleton initialization flag
let isPostHogInitialized = false

/**
 * Initialize PostHog client
 * Safe to call multiple times - will only initialize once
 */
export function initPostHog() {
  if (typeof window === 'undefined') {
    return // Server-side, skip
  }

  if (isPostHogInitialized) {
    return // Already initialized
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!key || !host) {
    console.warn('PostHog environment variables not configured')
    return
  }

  posthog.init(key, {
    api_host: host,
    // Only capture pageviews manually (we handle this in PostHogProvider)
    capture_pageview: false,
    // Only capture pageleave events in production
    capture_pageleave: process.env.NODE_ENV === 'production',
    // Disable session recording by default (requires GDPR consent)
    disable_session_recording: true,
    // Session recording configuration (when enabled)
    session_recording: {
      maskAllInputs: true, // Mask all form inputs for privacy
      maskTextSelector: '[data-private]', // Custom selector for sensitive content
      blockClass: 'ph-no-capture', // Block elements with this class
      blockSelector: '[data-posthog-block]', // Custom block selector
      ignoreClass: 'ph-ignore', // Ignore events on these elements
      maskTextClass: 'ph-mask', // Mask text in these elements
      collectFonts: true,
    },
    // Autocapture configuration
    autocapture: {
      dom_event_allowlist: ['click'], // Only capture clicks
      url_allowlist: undefined, // Capture on all URLs
      element_allowlist: ['button', 'a', 'form'], // Only these elements
      css_selector_allowlist: undefined, // No CSS selector filtering
    },
    // Persistence configuration
    persistence: 'localStorage+cookie',
    // Disable in development by default (unless NEXT_PUBLIC_POSTHOG_DEV_MODE=true)
    loaded: (ph) => {
      const enableInDev = process.env.NEXT_PUBLIC_POSTHOG_DEV_MODE === 'true'

      if (process.env.NODE_ENV === 'development' && !enableInDev) {
        console.log('📊 PostHog: Disabled in development (set NEXT_PUBLIC_POSTHOG_DEV_MODE=true to enable)')
        ph.opt_out_capturing()
        ph.set_config({ disable_session_recording: true })
      } else if (process.env.NODE_ENV === 'development' && enableInDev) {
        console.log('📊 PostHog: ✅ Enabled in development mode')
      }
    },
  })

  isPostHogInitialized = true
}

/**
 * Get the PostHog client instance
 * Must be called after initPostHog()
 */
export function getPostHog() {
  return posthog
}

/**
 * Identify a user in PostHog
 * Call this when a user logs in or their profile is loaded
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return

  posthog.identify(userId, properties)
}

/**
 * Reset PostHog state (call on logout)
 */
export function resetPostHog() {
  if (typeof window === 'undefined') return

  posthog.reset()
}

/**
 * Capture a custom event
 */
export function captureEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return

  posthog.capture(eventName, properties)
}

/**
 * Set user properties (without identifying)
 * Use for anonymous users or to update existing user properties
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  posthog.people.set(properties)
}

/**
 * Enable session recording (must be called after GDPR consent)
 */
export function enableSessionRecording() {
  if (typeof window === 'undefined') return

  posthog.startSessionRecording()
}

/**
 * Disable session recording
 */
export function disableSessionRecording() {
  if (typeof window === 'undefined') return

  posthog.stopSessionRecording()
}

/**
 * Opt out of all tracking
 */
export function optOut() {
  if (typeof window === 'undefined') return

  posthog.opt_out_capturing()
  posthog.set_config({ disable_session_recording: true })
}

/**
 * Opt back in to tracking
 */
export function optIn() {
  if (typeof window === 'undefined') return

  posthog.opt_in_capturing()
}

/**
 * Check if PostHog is initialized
 */
export function isInitialized() {
  return isPostHogInitialized
}

/**
 * Register properties to be sent with every event (super properties)
 */
export function registerSuperProperties(properties: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  posthog.register(properties)
}

/**
 * Unregister super properties
 */
export function unregisterSuperProperty(propertyName: string) {
  if (typeof window === 'undefined') return

  posthog.unregister(propertyName)
}
