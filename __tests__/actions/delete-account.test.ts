import { deleteAccount } from '@/app/actions/delete-account'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/email/send', () => ({
  sendAccountDeletedEmail: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
  })

  it('should delete account and send confirmation email', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        locale: 'fr',
      },
    }

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.delete).mockResolvedValue({} as any)

    const { sendAccountDeletedEmail } = await import('@/lib/email/send')
    vi.mocked(sendAccountDeletedEmail).mockResolvedValue({ success: true })

    const result = await deleteAccount()

    expect(result.success).toBe(true)
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    })
    expect(sendAccountDeletedEmail).toHaveBeenCalledWith(
      'test@example.com',
      'John Doe',
      'fr'
    )
  })

  it('should handle email sending failure gracefully', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        locale: 'fr',
      },
    }

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.delete).mockResolvedValue({} as any)

    const { sendAccountDeletedEmail } = await import('@/lib/email/send')
    vi.mocked(sendAccountDeletedEmail).mockRejectedValue(new Error('Email failed'))

    const result = await deleteAccount()

    // Should still succeed even if email fails
    expect(result.success).toBe(true)
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    })
  })

  it('should return error if user not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const result = await deleteAccount()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Non authentifié')
    expect(prisma.user.delete).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        locale: 'fr',
      },
    }

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.delete).mockRejectedValue(new Error('Database error'))

    const result = await deleteAccount()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Erreur lors de la suppression du compte')
  })
})
