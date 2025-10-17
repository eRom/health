import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  buildCommonProperties,
  buildUserProperties,
  buildExerciseProperties,
  buildSubscriptionProperties,
  buildBadgeProperties,
  mergeProperties,
  cleanProperties,
  buildEventProperties,
} from '@/lib/analytics/properties'

describe('Analytics Properties', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('buildCommonProperties', () => {
    it('should build common properties with locale', () => {
      const props = buildCommonProperties('fr', 'Mozilla/5.0')

      expect(props).toMatchObject({
        locale: 'fr',
        platform: 'web',
        user_agent: 'Mozilla/5.0',
      })
      expect(props.timestamp).toBeDefined()
      expect(props.environment).toBeDefined()
    })

    it('should default to "fr" locale if not provided', () => {
      const props = buildCommonProperties()

      expect(props.locale).toBe('fr')
    })

    it('should detect production environment', () => {
      process.env.VERCEL_ENV = 'production'
      const props = buildCommonProperties()

      expect(props.environment).toBe('production')
    })

    it('should detect preview environment', () => {
      process.env.VERCEL_ENV = 'preview'
      const props = buildCommonProperties()

      expect(props.environment).toBe('preview')
    })

    it('should default to development environment', () => {
      delete process.env.VERCEL_ENV
      const props = buildCommonProperties()

      expect(props.environment).toBe('development')
    })
  })

  describe('buildUserProperties', () => {
    it('should build user properties from User object', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
      }

      const props = buildUserProperties(user)

      expect(props).toMatchObject({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        email_verified: true,
      })
      expect(props.created_at).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should handle null emailVerified', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER' as const,
        emailVerified: false,
        createdAt: new Date('2024-01-01'),
      }

      const props = buildUserProperties(user)

      expect(props.email_verified).toBe(false)
    })
  })

  describe('buildExerciseProperties', () => {
    it('should build exercise properties', () => {
      const props = buildExerciseProperties('neuro', 'memory-game', {
        durationSeconds: 120,
        score: 8,
        maxScore: 10,
        difficulty: 'medium',
      })

      expect(props).toMatchObject({
        exercise_type: 'neuro',
        exercise_name: 'memory-game',
        duration_seconds: 120,
        score: 8,
        max_score: 10,
        difficulty: 'medium',
        is_completed: true,
      })
      expect(props.accuracy_percentage).toBe(80)
    })

    it('should handle missing optional data', () => {
      const props = buildExerciseProperties('ortho', 'word-recognition')

      expect(props).toMatchObject({
        exercise_type: 'ortho',
        exercise_name: 'word-recognition',
        is_completed: true,
      })
      expect(props.accuracy_percentage).toBeUndefined()
    })

    it('should calculate accuracy correctly', () => {
      const props = buildExerciseProperties('neuro', 'test', {
        score: 7,
        maxScore: 10,
      })

      expect(props.accuracy_percentage).toBe(70)
    })
  })

  describe('buildSubscriptionProperties', () => {
    it('should build subscription properties', () => {
      const props = buildSubscriptionProperties({
        subscriptionId: 'sub_123',
        planType: 'monthly',
        planPrice: 999,
        planCurrency: 'EUR',
        status: 'active',
      })

      expect(props).toMatchObject({
        subscription_id: 'sub_123',
        plan_type: 'monthly',
        plan_price: 999,
        plan_currency: 'EUR',
        subscription_status: 'active',
      })
    })

    it('should default currency to EUR', () => {
      const props = buildSubscriptionProperties({
        planPrice: 999,
      })

      expect(props.plan_currency).toBe('EUR')
    })
  })

  describe('buildBadgeProperties', () => {
    it('should build badge properties', () => {
      const props = buildBadgeProperties('badge-123', 'First Steps', {
        badgeType: 'welcome',
        badgeTier: 'bronze',
        sharePlatform: 'twitter',
      })

      expect(props).toMatchObject({
        badge_id: 'badge-123',
        badge_name: 'First Steps',
        badge_type: 'welcome',
        badge_tier: 'bronze',
        share_platform: 'twitter',
      })
    })
  })

  describe('mergeProperties', () => {
    it('should merge multiple property objects', () => {
      const props1 = { a: 1, b: 2 }
      const props2 = { b: 3, c: 4 }
      const props3 = { c: 5, d: 6 }

      const merged = mergeProperties(props1, props2, props3)

      expect(merged).toEqual({ a: 1, b: 3, c: 5, d: 6 })
    })

    it('should handle undefined values', () => {
      const props1 = { a: 1 }
      const props2 = undefined
      const props3 = { b: 2 }

      const merged = mergeProperties(props1, props2, props3)

      expect(merged).toEqual({ a: 1, b: 2 })
    })
  })

  describe('cleanProperties', () => {
    it('should remove undefined and null values', () => {
      const props = {
        a: 1,
        b: undefined,
        c: null,
        d: 'value',
        e: 0,
        f: false,
      }

      const cleaned = cleanProperties(props)

      expect(cleaned).toEqual({
        a: 1,
        d: 'value',
        e: 0,
        f: false,
      })
    })
  })

  describe('buildEventProperties', () => {
    it('should build complete event properties', () => {
      const specific = { event_specific: 'value' }
      const props = buildEventProperties(specific, 'en', 'Mozilla/5.0')

      expect(props).toMatchObject({
        locale: 'en',
        platform: 'web',
        user_agent: 'Mozilla/5.0',
        event_specific: 'value',
      })
      expect(props.timestamp).toBeDefined()
    })

    it('should clean undefined values', () => {
      const specific = { a: 'value', b: undefined }
      const props = buildEventProperties(specific)

      expect(props).not.toHaveProperty('b')
    })
  })
})
