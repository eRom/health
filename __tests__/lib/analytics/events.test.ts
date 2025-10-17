import { describe, expect, it } from 'vitest'
import {
  getEventCategory,
  isValidEvent,
  EventCategory,
  AuthEvents,
  ExerciseEvents,
  BadgeEvents,
  SubscriptionEvents,
} from '@/lib/analytics/events'

describe('Analytics Events', () => {
  describe('getEventCategory', () => {
    it('should return AUTH category for auth events', () => {
      expect(getEventCategory(AuthEvents.SIGNUP_COMPLETED)).toBe(
        EventCategory.AUTH
      )
      expect(getEventCategory(AuthEvents.LOGIN_COMPLETED)).toBe(
        EventCategory.AUTH
      )
      expect(getEventCategory(AuthEvents.LOGOUT)).toBe(EventCategory.AUTH)
    })

    it('should return EXERCISE category for exercise events', () => {
      expect(getEventCategory(ExerciseEvents.EXERCISE_COMPLETED)).toBe(
        EventCategory.EXERCISE
      )
      expect(getEventCategory(ExerciseEvents.EXERCISE_STARTED)).toBe(
        EventCategory.EXERCISE
      )
    })

    it('should return BADGE category for badge events', () => {
      expect(getEventCategory(BadgeEvents.BADGE_UNLOCKED)).toBe(
        EventCategory.BADGE
      )
      expect(getEventCategory(BadgeEvents.BADGE_SHARED)).toBe(
        EventCategory.BADGE
      )
    })

    it('should return SUBSCRIPTION category for subscription events', () => {
      expect(getEventCategory(SubscriptionEvents.SUBSCRIPTION_COMPLETED)).toBe(
        EventCategory.SUBSCRIPTION
      )
    })

    it('should return undefined for invalid event names', () => {
      expect(getEventCategory('invalid_event')).toBeUndefined()
      expect(getEventCategory('')).toBeUndefined()
    })
  })

  describe('isValidEvent', () => {
    it('should return true for valid events', () => {
      expect(isValidEvent(AuthEvents.SIGNUP_COMPLETED)).toBe(true)
      expect(isValidEvent(ExerciseEvents.EXERCISE_COMPLETED)).toBe(true)
      expect(isValidEvent(BadgeEvents.BADGE_UNLOCKED)).toBe(true)
    })

    it('should return false for invalid events', () => {
      expect(isValidEvent('invalid_event')).toBe(false)
      expect(isValidEvent('')).toBe(false)
    })
  })

  describe('Event constants', () => {
    it('should have unique event names', () => {
      const allEvents = [
        ...Object.values(AuthEvents),
        ...Object.values(ExerciseEvents),
        ...Object.values(BadgeEvents),
        ...Object.values(SubscriptionEvents),
      ]

      const uniqueEvents = new Set(allEvents)
      expect(uniqueEvents.size).toBe(allEvents.length)
    })

    it('should follow naming convention (snake_case)', () => {
      const allEvents = [
        ...Object.values(AuthEvents),
        ...Object.values(ExerciseEvents),
        ...Object.values(BadgeEvents),
      ]

      allEvents.forEach((event) => {
        expect(event).toMatch(/^[a-z_$]+$/)
      })
    })
  })
})
