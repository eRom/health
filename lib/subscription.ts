import { prisma } from './prisma'

/**
 * Check if user has an active subscription
 * Returns true if:
 * - User is ADMIN or HEALTHCARE_PROVIDER (exempted from subscription requirement)
 * - User is in trial period (TRIALING)
 * - User has active subscription (ACTIVE)
 * - User is in grace period after payment failure (PAST_DUE, within 7 days)
 */
export async function hasActiveSubscription(
  userId: string
): Promise<boolean> {
  // Check user role first - admins and healthcare providers have free access
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
    },
  })

  if (!user) {
    return false
  }

  // Admins and healthcare providers don't need a subscription
  if (user.role === 'ADMIN' || user.role === 'HEALTHCARE_PROVIDER') {
    return true
  }

  // For regular users, check subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      currentPeriodEnd: true,
      trialEnd: true,
    },
  })

  if (!subscription) {
    return false
  }

  // Allow access during trial
  if (subscription.status === 'TRIALING') {
    return true
  }

  // Allow access with active subscription
  if (subscription.status === 'ACTIVE') {
    return true
  }

  // Allow 7-day grace period for failed payments
  if (subscription.status === 'PAST_DUE') {
    const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)
    return new Date() <= gracePeriodEnd
  }

  return false
}

/**
 * Get days remaining in trial period
 * Returns null if not in trial
 */
export async function getDaysUntilTrialEnd(
  userId: string
): Promise<number | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      trialEnd: true,
    },
  })

  if (!subscription || subscription.status !== 'TRIALING' || !subscription.trialEnd) {
    return null
  }

  const now = new Date()
  const trialEnd = new Date(subscription.trialEnd)
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/**
 * Check if user is in grace period after payment failure
 */
export async function isInGracePeriod(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      currentPeriodEnd: true,
    },
  })

  if (!subscription || subscription.status !== 'PAST_DUE') {
    return false
  }

  const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

  return new Date() <= gracePeriodEnd
}
