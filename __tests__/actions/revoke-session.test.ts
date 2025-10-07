import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revokeSession, revokeAllOtherSessions } from '@/app/actions/revoke-session'

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
    session: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('revokeSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  describe('authentication checks', () => {
    it('should return error when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await revokeSession('session-456')

      expect(result).toEqual({
        success: false,
        error: 'Non authentifié',
      })
      expect(prisma.session.delete).not.toHaveBeenCalled()
    })
  })

  describe('session validation', () => {
    it('should prevent revoking current session', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)

      const result = await revokeSession('session-123')

      expect(result).toEqual({
        success: false,
        error: 'Impossible de révoquer la session actuelle',
      })
      expect(prisma.session.findUnique).not.toHaveBeenCalled()
    })

    it('should return error when session not found', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

      const result = await revokeSession('session-456')

      expect(result).toEqual({
        success: false,
        error: 'Session introuvable',
      })
      expect(prisma.session.delete).not.toHaveBeenCalled()
    })

    it('should return error when session belongs to different user', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      const mockSessionToRevoke = {
        id: 'session-456',
        userId: 'user-789', // different user
        expiresAt: new Date(),
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSessionToRevoke as any)

      const result = await revokeSession('session-456')

      expect(result).toEqual({
        success: false,
        error: 'Non autorisé',
      })
      expect(prisma.session.delete).not.toHaveBeenCalled()
    })
  })

  describe('successful revocation', () => {
    it('should revoke session belonging to current user', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      const mockSessionToRevoke = {
        id: 'session-456',
        userId: 'user-123', // same user
        expiresAt: new Date(),
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSessionToRevoke as any)
      vi.mocked(prisma.session.delete).mockResolvedValue(mockSessionToRevoke as any)

      const result = await revokeSession('session-456')

      expect(result).toEqual({ success: true })
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: 'session-456' },
      })
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SESSION_REVOKE]')
      )
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.session.findUnique).mockRejectedValue(new Error('Database error'))

      const result = await revokeSession('session-456')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erreur lors de la révocation de la session')
      expect(console.error).toHaveBeenCalled()
    })
  })
})

describe('revokeAllOtherSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  describe('authentication checks', () => {
    it('should return error when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await revokeAllOtherSessions()

      expect(result).toEqual({
        success: false,
        error: 'Non authentifié',
      })
      expect(prisma.session.deleteMany).not.toHaveBeenCalled()
    })
  })

  describe('successful bulk revocation', () => {
    it('should revoke all sessions except current one', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 3 })

      const result = await revokeAllOtherSessions()

      expect(result).toEqual({ success: true, count: 3 })
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          NOT: {
            id: 'session-123',
          },
        },
      })
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SESSION_REVOKE_ALL]')
      )
    })

    it('should handle case when no other sessions exist', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 0 })

      const result = await revokeAllOtherSessions()

      expect(result).toEqual({ success: true, count: 0 })
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          NOT: {
            id: 'session-123',
          },
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
      vi.mocked(prisma.session.deleteMany).mockRejectedValue(new Error('Database error'))

      const result = await revokeAllOtherSessions()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erreur lors de la révocation des sessions')
      expect(console.error).toHaveBeenCalled()
    })
  })
})
