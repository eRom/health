import { describe, it, expect, vi, beforeEach } from 'vitest'
import { changePassword } from '@/app/actions/change-password'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

describe('changePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  describe('authentication checks', () => {
    it('should return error when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await changePassword({
        currentPassword: 'oldpass',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      })

      expect(result).toEqual({
        success: false,
        error: 'Non authentifié',
      })
    })
  })

  // Note: Zod validation tests are omitted as they test Zod's functionality,
  // not our business logic. Validation is integration-tested via E2E tests.

  describe('account checks', () => {
    it('should return error when account not found', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.account.findFirst).mockResolvedValue(null)

      const result = await changePassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('OAuth')
    })

    it('should return error for OAuth accounts without password', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        providerId: 'google',
        password: null,
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)

      const result = await changePassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('OAuth')
    })
  })

  describe('password verification', () => {
    it('should return error when current password is incorrect', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        providerId: 'credential',
        password: 'hashed-old-password',
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const result = await changePassword({
        currentPassword: 'WrongPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      })

      expect(result).toEqual({
        success: false,
        error: 'Mot de passe actuel incorrect',
      })
      expect(prisma.account.update).not.toHaveBeenCalled()
    })
  })

  describe('successful password change', () => {
    it('should update password and revoke other sessions', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        providerId: 'credential',
        password: 'hashed-old-password',
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-new-password' as never)
      vi.mocked(prisma.account.update).mockResolvedValue({} as any)
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 2 } as any)

      const result = await changePassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      })

      expect(result).toEqual({ success: true })
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10)
      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: 'account-123' },
        data: { password: 'hashed-new-password' },
      })
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          id: { not: 'session-123' },
        },
      })
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.account.findFirst).mockRejectedValue(new Error('Database error'))

      const result = await changePassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erreur lors du changement de mot de passe')
    })
  })
})
