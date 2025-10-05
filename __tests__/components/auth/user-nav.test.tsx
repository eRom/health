import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserNav } from '@/components/auth/user-nav'
import { authClient } from '@/lib/auth-client'

// Mock dependencies
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
  },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.signOut': 'Se déconnecter',
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

describe('UserNav', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render user name', () => {
      render(<UserNav user={mockUser} />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('should render sign out button', () => {
      render(<UserNav user={mockUser} />)

      const signOutButton = screen.getByRole('button', { name: /se déconnecter/i })
      expect(signOutButton).toBeInTheDocument()
    })

    it('should render profile link', () => {
      render(<UserNav user={mockUser} />)

      const profileLink = screen.getByRole('link', { name: /test user/i })
      expect(profileLink).toBeInTheDocument()
      expect(profileLink).toHaveAttribute('href', '/profile')
    })
  })

  describe('sign out dialog', () => {
    it('should open sign out dialog when button clicked', async () => {
      render(<UserNav user={mockUser} />)

      const signOutButton = screen.getByRole('button', { name: /se déconnecter/i })
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/déconnexion/i)).toBeInTheDocument()
        expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument()
      })
    })

    it('should close dialog on cancel', async () => {
      render(<UserNav user={mockUser} />)

      // Open dialog
      const signOutButton = screen.getByRole('button', { name: /se déconnecter/i })
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      // Verify signOut was not called
      expect(authClient.signOut).not.toHaveBeenCalled()
    })
  })

  describe('sign out functionality', () => {
    it('should call authClient.signOut when confirming', async () => {
      vi.mocked(authClient.signOut).mockResolvedValue({} as any)

      render(<UserNav user={mockUser} />)

      // Open dialog
      const signOutButton = screen.getByRole('button', { name: /se déconnecter/i })
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Confirm sign out - find the button inside the dialog
      const dialog = screen.getByRole('dialog')
      const confirmButton = dialog.querySelector('button:last-of-type')
      if (confirmButton) {
        fireEvent.click(confirmButton)
      }

      await waitFor(() => {
        expect(authClient.signOut).toHaveBeenCalledTimes(1)
      })
    })

    it('should redirect to home page after sign out', async () => {
      vi.mocked(authClient.signOut).mockResolvedValue({} as any)

      render(<UserNav user={mockUser} />)

      const signOutButton = screen.getByRole('button', { name: /se déconnecter/i })
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')
      const confirmButton = dialog.querySelector('button:last-of-type')
      if (confirmButton) {
        fireEvent.click(confirmButton)
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('accessibility', () => {
    it('should have accessible dialog structure', async () => {
      render(<UserNav user={mockUser} />)

      const signOutButton = screen.getByRole('button', { name: /se déconnecter/i })
      fireEvent.click(signOutButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(screen.getByText('Déconnexion')).toBeInTheDocument()
        expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument()
      })
    })
  })
})
