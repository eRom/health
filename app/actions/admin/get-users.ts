'use server'

import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function getUsers() {
  await requireAdmin()

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      healthDataConsentGrantedAt: true,
      _count: {
        select: {
          exerciseAttempts: true,
          sessions: true
        }
      },
      consentHistory: {
        orderBy: { grantedAt: 'desc' },
        take: 1,
        select: {
          consentType: true,
          granted: true,
          grantedAt: true
        }
      },
      subscription: {
        select: {
          status: true,
          currentPeriodEnd: true,
          trialEnd: true,
          cancelAtPeriodEnd: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return users
}
