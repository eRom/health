import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'

// Mock dependencies
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.signIn': 'Se connecter',
    }
    return translations[key] || key
  },
}))

const mockPush = vi.fn()

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render email and password fields', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /se connecter/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render cancel link', () => {
      render(<LoginForm />)

      const cancelLink = screen.getByRole('link', { name: /annuler/i })
      expect(cancelLink).toBeInTheDocument()
      expect(cancelLink).toHaveAttribute('href', '/')
    })
  })

  describe('form validation', () => {
    it('should have required email field', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have required password field', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/mot de passe/i)
      expect(passwordInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('form submission', () => {
    it('should submit form with correct credentials', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValue({} as any)

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(authClient.signIn.email).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should redirect to dashboard on successful login', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValue({} as any)

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should show loading state during submission', async () => {
      vi.mocked(authClient.signIn.email).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/connexion\.\.\./i)).toBeInTheDocument()
      })
    })

    it('should disable form fields during submission', async () => {
      vi.mocked(authClient.signIn.email).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('error handling', () => {
    it('should display error message on failed login', async () => {
      vi.mocked(authClient.signIn.email).mockRejectedValue(new Error('Invalid credentials'))

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument()
      })
    })

    it('should clear error message on new submission', async () => {
      vi.mocked(authClient.signIn.email)
        .mockRejectedValueOnce(new Error('Invalid credentials'))
        .mockResolvedValueOnce({} as any)

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // First submission - should fail
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Second submission - should clear error
      fireEvent.change(emailInput, { target: { value: 'correct@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'correctpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })

    it('should have accessible error message', async () => {
      vi.mocked(authClient.signIn.email).mockRejectedValue(new Error('Invalid credentials'))

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})
