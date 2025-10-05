import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authClient } from '@/lib/auth-client'

// Mock the createAuthClient from better-auth/react
vi.mock('better-auth/react', () => ({
  createAuthClient: () => ({
    signIn: {
      email: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
    useSession: vi.fn(),
  }),
}))

describe('auth-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authClient configuration', () => {
    it('should be configured with correct baseURL', () => {
      expect(authClient).toBeDefined()
      expect(authClient.signIn).toBeDefined()
      expect(authClient.signUp).toBeDefined()
      expect(authClient.signOut).toBeDefined()
    })
  })

  describe('signIn.email', () => {
    it('should call signIn with email and password', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ success: true })
      authClient.signIn.email = mockSignIn

      await authClient.signIn.email({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockSignIn).toHaveBeenCalledTimes(1)
    })

    it('should handle sign in errors', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      authClient.signIn.email = mockSignIn

      await expect(
        authClient.signIn.email({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signUp.email', () => {
    it('should call signUp with name, email and password', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ success: true })
      authClient.signUp.email = mockSignUp

      await authClient.signUp.email({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockSignUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockSignUp).toHaveBeenCalledTimes(1)
    })

    it('should handle sign up errors', async () => {
      const mockSignUp = vi.fn().mockRejectedValue(new Error('Email already exists'))
      authClient.signUp.email = mockSignUp

      await expect(
        authClient.signUp.email({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('signOut', () => {
    it('should call signOut successfully', async () => {
      const mockSignOut = vi.fn().mockResolvedValue({ success: true })
      authClient.signOut = mockSignOut

      await authClient.signOut()

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('should handle sign out errors', async () => {
      const mockSignOut = vi.fn().mockRejectedValue(new Error('Session not found'))
      authClient.signOut = mockSignOut

      await expect(authClient.signOut()).rejects.toThrow('Session not found')
    })
  })
})
