import { resend } from '@/lib/email/resend'
import { sendAccountDeletedEmail, sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email/send'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Resend
vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}))

// Mock render function
vi.mock('@react-email/render', () => ({
  render: vi.fn(() => '<html>Mocked email HTML</html>'),
}))

describe('Email sending functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const mockResponse = { id: 'email-123' }
      vi.mocked(resend.emails.send).mockResolvedValue({ data: mockResponse, error: null })

      const result = await sendVerificationEmail('test@example.com', 'token-123', 'fr')

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('email-123')
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: 'Health In Cloud <noreply@healthincloud.app>',
        to: ['test@example.com'],
        subject: 'Vérifiez votre adresse email - Health In Cloud',
        html: '<html>Mocked email HTML</html>',
      })
    })

    it('should handle Resend API errors', async () => {
      const mockError = { message: 'API Error' }
      vi.mocked(resend.emails.send).mockResolvedValue({ data: null, error: mockError })

      const result = await sendVerificationEmail('test@example.com', 'token-123', 'fr')

      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
    })

    it('should use English subject for English locale', async () => {
      const mockResponse = { id: 'email-123' }
      vi.mocked(resend.emails.send).mockResolvedValue({ data: mockResponse, error: null })

      await sendVerificationEmail('test@example.com', 'token-123', 'en')

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Verify your email address - Health In Cloud',
        })
      )
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const mockResponse = { id: 'email-456' }
      vi.mocked(resend.emails.send).mockResolvedValue({ data: mockResponse, error: null })

      const result = await sendPasswordResetEmail('test@example.com', 'token-456', 'fr')

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('email-456')
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: 'Health In Cloud <noreply@healthincloud.app>',
        to: ['test@example.com'],
        subject: 'Réinitialisez votre mot de passe - Health In Cloud',
        html: '<html>Mocked email HTML</html>',
      })
    })
  })

  describe('sendAccountDeletedEmail', () => {
    it('should send account deleted email successfully', async () => {
      const mockResponse = { id: 'email-789' }
      vi.mocked(resend.emails.send).mockResolvedValue({ data: mockResponse, error: null })

      const result = await sendAccountDeletedEmail('test@example.com', 'John Doe', 'fr')

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('email-789')
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: 'Health In Cloud <noreply@healthincloud.app>',
        to: ['test@example.com'],
        subject: 'Compte supprimé - Health In Cloud',
        html: '<html>Mocked email HTML</html>',
      })
    })
  })
})
