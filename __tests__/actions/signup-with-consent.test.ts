import { signUpWithConsent } from '@/app/actions/signup-with-consent'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    consentHistory: {
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

describe('signUpWithConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create user and consent record when consent is given', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockHeaders = {
      get: vi.fn()
        .mockReturnValueOnce('192.168.1.1') // x-forwarded-for
        .mockReturnValueOnce('Mozilla/5.0') // user-agent
    }

    vi.mocked(auth.api.signUpEmail).mockResolvedValue({ user: mockUser } as any)
    vi.mocked(prisma.consentHistory.create).mockResolvedValue({} as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)
    
    const { headers } = await import('next/headers')
    vi.mocked(headers).mockResolvedValue(mockHeaders as any)

    const result = await signUpWithConsent({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      healthDataConsent: true,
    })

    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
    })
    expect(prisma.consentHistory.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        consentType: 'HEALTH_DATA',
        granted: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { healthDataConsentGrantedAt: expect.any(Date) },
    })
  })

  it('should throw error when consent is not given', async () => {
    await expect(signUpWithConsent({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      healthDataConsent: false,
    })).rejects.toThrow('Consentement requis pour le traitement des données de santé')
  })

  it('should throw error when validation fails', async () => {
    await expect(signUpWithConsent({
      name: '', // Invalid name
      email: 'invalid-email',
      password: '123', // Too short
      healthDataConsent: true,
    })).rejects.toThrow('Données de formulaire invalides')
  })

  it('should throw error when user creation fails', async () => {
    vi.mocked(auth.api.signUpEmail).mockResolvedValue({ user: null } as any)

    await expect(signUpWithConsent({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      healthDataConsent: true,
    })).rejects.toThrow('Erreur lors de la création du compte')
  })
})
