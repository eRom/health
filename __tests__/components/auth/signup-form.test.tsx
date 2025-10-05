import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignupForm } from '@/components/auth/signup-form'
import { authClient } from '@/lib/auth-client'

// Mock dependencies
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.name': 'Nom',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.signUp': "S'inscrire",
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

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render name, email and password fields', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<SignupForm />)

      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render cancel link', () => {
      render(<SignupForm />)

      const cancelLink = screen.getByRole('link', { name: /annuler/i })
      expect(cancelLink).toBeInTheDocument()
      expect(cancelLink).toHaveAttribute('href', '/')
    })
  })

  describe('form validation', () => {
    it('should have required name field', () => {
      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      expect(nameInput).toHaveAttribute('required')
      expect(nameInput).toHaveAttribute('type', 'text')
    })

    it('should have required email field with email type', () => {
      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have required password field with minimum length', () => {
      render(<SignupForm />)

      const passwordInput = screen.getByLabelText(/mot de passe/i)
      expect(passwordInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('minlength', '8')
    })
  })

  describe('form submission', () => {
    it('should submit form with correct data', async () => {
      vi.mocked(authClient.signUp.email).mockResolvedValue({} as any)

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(authClient.signUp.email).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should redirect to dashboard on successful signup', async () => {
      vi.mocked(authClient.signUp.email).mockResolvedValue({} as any)

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should show loading state during submission', async () => {
      vi.mocked(authClient.signUp.email).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/création\.\.\./i)).toBeInTheDocument()
      })
    })

    it('should disable form fields during submission', async () => {
      vi.mocked(authClient.signUp.email).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(nameInput).toBeDisabled()
        expect(emailInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('error handling', () => {
    it('should display error message on failed signup', async () => {
      vi.mocked(authClient.signUp.email).mockRejectedValue(new Error('Email already exists'))

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/erreur lors de la création du compte/i)).toBeInTheDocument()
      })
    })

    it('should clear error message on new submission', async () => {
      vi.mocked(authClient.signUp.email)
        .mockRejectedValueOnce(new Error('Email already exists'))
        .mockResolvedValueOnce({} as any)

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      // First submission - should fail
      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Second submission - should clear error
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })

    it('should have accessible error message', async () => {
      vi.mocked(authClient.signUp.email).mockRejectedValue(new Error('Signup failed'))

      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/nom/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})
