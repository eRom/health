import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateName } from '@/app/actions/update-profile'

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
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('updateName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
  })

  describe('authentication checks', () => {
    it('should return error when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await updateName({ name: 'New Name' })

      expect(result).toEqual({
        success: false,
        error: 'Non authentifié',
      })
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should return error when session user ID is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-123' },
      } as any)

      const result = await updateName({ name: 'New Name' })

      expect(result).toEqual({
        success: false,
        error: 'Non authentifié',
      })
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  // Note: Zod validation tests are omitted as they test Zod's functionality.
  // Validation is integration-tested via E2E tests.

  describe('validation edge cases', () => {

    it('should accept valid name with 2 characters', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Old Name', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updateName({ name: 'Jo' })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'Jo' },
      })
    })

    it('should accept valid name with 100 characters', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Old Name', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const validName = 'A'.repeat(100)
      const result = await updateName({ name: validName })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: validName },
      })
    })
  })

  describe('successful update', () => {
    it('should update user name successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Old Name', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updateName({ name: 'New Name' })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'New Name' },
      })
    })

    it('should handle names with special characters', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Old Name', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updateName({ name: "Jean-François O'Neil" })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: "Jean-François O'Neil" },
      })
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Old Name', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database error'))

      const result = await updateName({ name: 'New Name' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erreur lors de la mise à jour')
      expect(console.error).toHaveBeenCalledWith(
        '[UPDATE_NAME] Error:',
        expect.any(Error)
      )
    })
  })
})
