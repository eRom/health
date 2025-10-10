import { deleteUser } from '@/app/actions/admin/delete-user'
import { getUsers } from '@/app/actions/admin/get-users'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock des dépendances
vi.mock('@/lib/auth-utils')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Admin Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deleteUser', () => {
    it('should reject if user is not admin', async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('Unauthorized'))
      
      await expect(deleteUser('user-id')).rejects.toThrow('Unauthorized')
    })

    it('should reject if trying to delete own account', async () => {
      const mockSession = { user: { id: 'admin-id' } }
      vi.mocked(requireAdmin).mockResolvedValueOnce(mockSession)
      
      await expect(deleteUser('admin-id')).rejects.toThrow('Cannot delete your own account')
    })

    it('should successfully delete user', async () => {
      const mockSession = { user: { id: 'admin-id' } }
      vi.mocked(requireAdmin).mockResolvedValueOnce(mockSession)
      vi.mocked(prisma.user.delete).mockResolvedValueOnce({} as any)
      
      const result = await deleteUser('user-id')
      
      expect(result).toEqual({ success: true })
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-id' }
      })
    })
  })

  describe('getUsers', () => {
    it('should reject if user is not admin', async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error('Unauthorized'))
      
      await expect(getUsers()).rejects.toThrow('Unauthorized')
    })

    it('should return users list for admin', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: 'USER',
          createdAt: new Date(),
          emailVerified: true,
          healthDataConsentGrantedAt: new Date(),
          _count: { exerciseAttempts: 5, sessions: 2 },
          consentHistory: []
        }
      ]
      
      vi.mocked(requireAdmin).mockResolvedValueOnce({} as any)
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce(mockUsers as any)
      
      const result = await getUsers()
      
      expect(result).toEqual(mockUsers)
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
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
          consentHistory: expect.any(Object)
        }),
        orderBy: { createdAt: 'desc' }
      })
    })
  })
})

