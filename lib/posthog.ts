/**
 * PostHog Server-Side Configuration
 *
 * This module provides server-side utilities for PostHog analytics.
 * It uses the PostHog Node.js SDK for tracking events from server actions and API routes.
 *
 * Note: This file uses posthog-js client SDK for simplicity. For high-volume server-side
 * tracking, consider migrating to the official posthog-node SDK.
 */

import { logger } from './logger'

// Type-safe server-side tracking interface
interface ServerTrackOptions {
  userId?: string
  distinctId?: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

/**
 * Track an event from server-side code
 *
 * This is a placeholder implementation that logs events.
 * For production use with server-side tracking, install posthog-node:
 * npm install posthog-node
 *
 * Then replace this implementation with the official Node.js SDK.
 */
export async function trackServerEvent(
  eventName: string,
  options: ServerTrackOptions = {}
): Promise<void> {
  try {
    const { userId, distinctId, properties, timestamp } = options

    // In production, you would use the PostHog Node.js SDK here:
    // const { PostHog } = require('posthog-node')
    // const client = new PostHog(process.env.POSTHOG_API_KEY)
    // await client.capture({
    //   distinctId: distinctId || userId || 'anonymous',
    //   event: eventName,
    //   properties,
    //   timestamp,
    // })
    // await client.shutdown()

    // For now, we'll log server-side events
    // The client-side SDK will handle most tracking
    logger.info('PostHog event (server-side)', {
      event: eventName,
      userId,
      distinctId,
      properties,
      timestamp,
    })
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
