import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  hasActiveSubscription,
  getDaysUntilTrialEnd,
  isInGracePeriod,
} from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Subscription Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasActiveSubscription', () => {
    const userId = 'test-user-123'

    // Role-based exemption tests
    it('should return true for ADMIN users without subscription', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        role: 'ADMIN',
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(true)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { role: true },
      })
      // Should not check subscription for admins
      expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
    })

    it('should return true for HEALTHCARE_PROVIDER users without subscription', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        role: 'HEALTHCARE_PROVIDER',
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(true)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { role: true },
      })
      // Should not check subscription for healthcare providers
      expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
    })

    it('should return false when user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { role: true },
      })
      // Should not check subscription if user doesn't exist
      expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
    })

    it('should check subscription for regular USER role', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        role: 'USER',
      })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(true)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { role: true },
      })
      // Should check subscription for regular users
      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: {
          status: true,
          currentPeriodEnd: true,
          trialEnd: true,
        },
      })
    })

    it('should return false for USER role without subscription', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        role: 'USER',
      })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce(null)

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: {
          status: true,
          currentPeriodEnd: true,
          trialEnd: true,
        },
      })
    })

    it('should return true for TRIALING status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        currentPeriodEnd: new Date(),
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(true)
    })

    it('should return true for ACTIVE status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(true)
    })

    it('should return true for PAST_DUE within grace period', async () => {
      const currentPeriodEnd = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(true)
    })

    it('should return false for PAST_DUE after grace period', async () => {
      const currentPeriodEnd = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
    })

    it('should return false for CANCELED status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'CANCELED',
        currentPeriodEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
    })

    it('should return false for INCOMPLETE status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'INCOMPLETE',
        currentPeriodEnd: new Date(),
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
    })

    it('should return false for INCOMPLETE_EXPIRED status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'INCOMPLETE_EXPIRED',
        currentPeriodEnd: new Date(),
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
    })

    it('should return false for UNPAID status', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'UNPAID',
        currentPeriodEnd: new Date(),
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      expect(result).toBe(false)
    })

    it('should handle grace period edge case at exactly 7 days', async () => {
      const currentPeriodEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Exactly 7 days ago

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
        trialEnd: null,
      })

      const result = await hasActiveSubscription(userId)

      // Should still be within grace period
      expect(result).toBe(true)
    })
  })

  describe('getDaysUntilTrialEnd', () => {
    const userId = 'test-user-123'

    it('should return null when no subscription exists', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce(null)

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBeNull()
    })

    it('should return null when not in trial period', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'ACTIVE',
        trialEnd: null,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBeNull()
    })

    it('should return null when trial end is missing', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        trialEnd: null,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBeNull()
    })

    it('should return correct days remaining in trial', async () => {
      const trialEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        trialEnd,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBe(10)
    })

    it('should return 0 when trial has ended', async () => {
      const trialEnd = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        trialEnd,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBe(0)
    })

    it('should round up partial days', async () => {
      const trialEnd = new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000) // 1.5 days from now

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        trialEnd,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBe(2) // Should round up
    })

    it('should handle trial ending today', async () => {
      const trialEnd = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        trialEnd,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBe(1) // Should show 1 day remaining
    })

    it('should handle trial ending in exactly 14 days', async () => {
      const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        trialEnd,
      })

      const result = await getDaysUntilTrialEnd(userId)

      expect(result).toBe(14)
    })
  })

  describe('isInGracePeriod', () => {
    const userId = 'test-user-123'

    it('should return false when no subscription exists', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce(null)

      const result = await isInGracePeriod(userId)

      expect(result).toBe(false)
    })

    it('should return false when not in PAST_DUE status', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(),
      })

      const result = await isInGracePeriod(userId)

      expect(result).toBe(false)
    })

    it('should return true when in grace period', async () => {
      const currentPeriodEnd = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
      })

      const result = await isInGracePeriod(userId)

      expect(result).toBe(true)
    })

    it('should return false when grace period has ended', async () => {
      const currentPeriodEnd = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
      })

      const result = await isInGracePeriod(userId)

      expect(result).toBe(false)
    })

    it('should return true at exactly 7 days after period end', async () => {
      const currentPeriodEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Exactly 7 days ago

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
      })

      const result = await isInGracePeriod(userId)

      expect(result).toBe(true)
    })

    it('should return false just after 7 days', async () => {
      const currentPeriodEnd = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000 - 1000
      ) // 7 days and 1 second ago

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
      })

      const result = await isInGracePeriod(userId)

      expect(result).toBe(false)
    })

    it('should return true on first day of grace period', async () => {
      const currentPeriodEnd = new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago

      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd,
      })

      const result = await isInGracePeriod(userId)

      expect(result).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    const userId = 'test-user-123'

    it('should handle transition from trial to active', async () => {
      // First call: User in trial with 1 day remaining
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'TRIALING',
        currentPeriodEnd: new Date(),
        trialEnd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })

      const hasActiveBefore = await hasActiveSubscription(userId)
      expect(hasActiveBefore).toBe(true)

      // Second call: Trial ended, now active
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEnd: new Date(Date.now() - 1 * 60 * 60 * 1000),
      })

      const hasActiveAfter = await hasActiveSubscription(userId)
      expect(hasActiveAfter).toBe(true)
    })

    it('should handle payment failure scenario', async () => {
      // Active subscription
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEnd: null,
      })

      const activeResult = await hasActiveSubscription(userId)
      expect(activeResult).toBe(true)

      // Payment fails, enters PAST_DUE
      const failureDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd: failureDate,
        trialEnd: null,
      })

      const pastDueResult = await hasActiveSubscription(userId)
      expect(pastDueResult).toBe(true) // Still in grace period

      // Check grace period status
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'PAST_DUE',
        currentPeriodEnd: failureDate,
      })

      const graceResult = await isInGracePeriod(userId)
      expect(graceResult).toBe(true)

      // After 10 days, subscription becomes CANCELED
      const oldFailureDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'CANCELED',
        currentPeriodEnd: oldFailureDate,
        trialEnd: null,
      })

      const canceledResult = await hasActiveSubscription(userId)
      expect(canceledResult).toBe(false)
    })

    it('should handle incomplete subscription that expires', async () => {
      // Incomplete subscription (checkout started but not completed)
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'INCOMPLETE',
        currentPeriodEnd: new Date(),
        trialEnd: null,
      })

      const incompleteResult = await hasActiveSubscription(userId)
      expect(incompleteResult).toBe(false)

      // Subscription expires after 23 hours
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ role: 'USER' })
      vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
        status: 'INCOMPLETE_EXPIRED',
        currentPeriodEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        trialEnd: null,
      })

      const expiredResult = await hasActiveSubscription(userId)
      expect(expiredResult).toBe(false)
    })
  })
})
