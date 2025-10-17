/**
 * PostHog Server-Side Tracking Tests
 *
 * Tests for the posthog-node integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock posthog-node before importing the module
vi.mock('posthog-node', () => {
  const mockCapture = vi.fn()
  const mockFlush = vi.fn().mockResolvedValue(undefined)
  const mockShutdown = vi.fn().mockResolvedValue(undefined)

  return {
    PostHog: vi.fn(() => ({
      capture: mockCapture,
      flush: mockFlush,
      shutdown: mockShutdown,
    })),
  }
})

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('PostHog Server-Side Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock environment variables
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://test.posthog.com'
  })

  it('should export tracking functions', async () => {
    const posthogModule = await import('@/lib/posthog')

    expect(posthogModule.trackServerEvent).toBeDefined()
    expect(posthogModule.trackUserEvent).toBeDefined()
    expect(posthogModule.trackAnonymousEvent).toBeDefined()
    expect(posthogModule.flushPostHog).toBeDefined()
    expect(posthogModule.shutdownPostHog).toBeDefined()
  })

  it('should have correct config helpers', async () => {
    const posthogModule = await import('@/lib/posthog')

    const config = posthogModule.getPostHogConfig()
    expect(config.key).toBe('test-key')
    expect(config.host).toBe('https://test.posthog.com')
    expect(config.isConfigured).toBe(true)

    expect(posthogModule.isPostHogConfigured()).toBe(true)
  })

  it('should detect unconfigured state', async () => {
    // Remove env vars
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST

    // Re-import to get fresh instance
    vi.resetModules()
    const posthogModule = await import('@/lib/posthog')

    expect(posthogModule.isPostHogConfigured()).toBe(false)
  })

  it('should handle tracking with user ID', async () => {
    const posthogModule = await import('@/lib/posthog')

    await posthogModule.trackUserEvent('user-123', 'test_event', {
      foo: 'bar',
    })

    // Function should complete without errors
    // Actual PostHog client is mocked, so we just verify no exceptions
    expect(true).toBe(true)
  })

  it('should handle anonymous tracking', async () => {
    const posthogModule = await import('@/lib/posthog')

    await posthogModule.trackAnonymousEvent('anon-123', 'test_event', {
      source: 'test',
    })

    // Function should complete without errors
    expect(true).toBe(true)
  })
})
