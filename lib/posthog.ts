/**
 * PostHog Server-Side Configuration
 *
 * This module provides server-side utilities for PostHog analytics.
 * It uses the PostHog Node.js SDK for tracking events from server actions and API routes.
 */

import { PostHog } from 'posthog-node'
import { logger } from './logger'

// Type-safe server-side tracking interface
interface ServerTrackOptions {
  userId?: string
  distinctId?: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

// Singleton PostHog client instance
let posthogClient: PostHog | null = null

/**
 * Get or create PostHog client instance (singleton pattern)
 */
function getPostHogClient(): PostHog | null {
  // Skip if not configured
  const config = getPostHogConfig()
  if (!config.isConfigured) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('PostHog not configured, skipping server-side tracking')
    }
    return null
  }

  // Return existing instance
  if (posthogClient) {
    return posthogClient
  }

  // Create new instance
  try {
    posthogClient = new PostHog(config.key!, {
      host: config.host,
      // Flush events every 10 seconds or when 20 events are queued
      flushAt: 20,
      flushInterval: 10000,
    })

    logger.info('PostHog server-side client initialized', {
      host: config.host,
    })

    return posthogClient
  } catch (error) {
    logger.error(error, 'Failed to initialize PostHog client')
    return null
  }
}

/**
 * Force flush all pending events to PostHog
 * Use this in critical paths like webhooks or before process exit
 */
export async function flushPostHog(): Promise<void> {
  const client = getPostHogClient()
  if (client) {
    await client.flush()
    logger.debug('PostHog events flushed')
  }
}

/**
 * Shutdown the PostHog client (call this on app shutdown)
 * Important: Flushes any pending events before closing
 */
export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown()
    posthogClient = null
    logger.info('PostHog client shutdown complete')
  }
}

/**
 * Track an event from server-side code
 *
 * Uses the PostHog Node.js SDK to send events directly from the server.
 * This is more reliable than client-side tracking (no ad-blockers, no page close issues).
 */
export async function trackServerEvent(
  eventName: string,
  options: ServerTrackOptions = {}
): Promise<void> {
  try {
    const { userId, distinctId, properties, timestamp } = options
    const client = getPostHogClient()

    // Skip if client not available (not configured or initialization failed)
    if (!client) {
      // Only log in development to avoid noise
      if (process.env.NODE_ENV === 'development') {
        logger.debug('PostHog event (not sent - client unavailable)', {
          event: eventName,
          userId,
          distinctId,
          properties,
        })
      }
      return
    }

    // Send event to PostHog
    client.capture({
      distinctId: distinctId || userId || 'anonymous',
      event: eventName,
      properties: properties || {},
      timestamp: timestamp,
    })

    // Note: We don't await client.flush() here for performance
    // Events are batched and sent automatically by the SDK
    // Use shutdownPostHog() on app shutdown to ensure all events are sent

    if (process.env.NODE_ENV === 'development') {
      logger.debug('PostHog event tracked (server-side)', {
        event: eventName,
        userId,
        distinctId,
        propertiesCount: Object.keys(properties || {}).length,
      })
    }
  } catch (error) {
    logger.error(error, 'Failed to track server-side event', {
      eventName,
      userId: options.userId,
    })
  }
}

/**
 * Track an event with user context
 * Convenience wrapper for authenticated server actions
 */
export async function trackUserEvent(
  userId: string,
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  return trackServerEvent(eventName, {
    userId,
    distinctId: userId,
    properties,
  })
}

/**
 * Track an anonymous event
 * For events that occur before user authentication
 */
export async function trackAnonymousEvent(
  distinctId: string,
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  return trackServerEvent(eventName, {
    distinctId,
    properties,
  })
}

/**
 * Configuration helper for PostHog environment
 */
export function getPostHogConfig() {
  return {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST
    ),
  }
}

/**
 * Check if PostHog is properly configured
 */
export function isPostHogConfigured(): boolean {
  return getPostHogConfig().isConfigured
}
