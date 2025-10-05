import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updatePreferences } from '@/app/actions/update-preferences'

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

describe('updatePreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  describe('authentication checks', () => {
    it('should return error when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await updatePreferences({ locale: 'fr' })

      expect(result).toEqual({
        success: false,
        error: 'Non authentifié',
      })
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  describe('successful updates', () => {
    it('should update locale preference', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updatePreferences({ locale: 'en' })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { locale: 'en' },
      })
    })

    it('should update theme preference', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updatePreferences({ theme: 'dark' })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { theme: 'dark' },
      })
    })

    it('should update emailNotifications preference', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updatePreferences({ emailNotifications: false })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { emailNotifications: false },
      })
    })

    it('should update multiple preferences at once', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)

      const result = await updatePreferences({
        locale: 'fr',
        theme: 'light',
        emailNotifications: true,
      })

      expect(result).toEqual({ success: true })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          locale: 'fr',
          theme: 'light',
          emailNotifications: true,
        },
      })
    })
  })

  describe('validation', () => {
    it('should reject invalid locale', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)

      const result = await updatePreferences({ locale: 'invalid' as any })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should reject invalid theme', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)

      const result = await updatePreferences({ theme: 'invalid' as any })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      }
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database error'))

      const result = await updatePreferences({ locale: 'fr' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })
})
