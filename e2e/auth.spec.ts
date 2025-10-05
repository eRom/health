import { test, expect } from '@playwright/test'

const testUser = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

test.describe('Authentication', () => {
  test.describe('Signup Flow', () => {
    test('should successfully create a new account', async ({ page }) => {
      await page.goto('/fr/auth/signup')

      // Fill signup form
      await page.fill('input[name="name"]', testUser.name)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/)
      await expect(page.getByText('Bienvenue')).toBeVisible()
    })

    test('should show validation for invalid email', async ({ page }) => {
      await page.goto('/fr/auth/signup')

      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="password"]', 'password123')

      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toHaveAttribute('type', 'email')
    })

    test('should show validation for short password', async ({ page }) => {
      await page.goto('/fr/auth/signup')

      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'short')

      const passwordInput = page.locator('input[name="password"]')
      await expect(passwordInput).toHaveAttribute('minlength', '8')
    })
  })

  test.describe('Login Flow', () => {
    test.beforeAll(async ({ browser }) => {
      // Create a test user first
      const page = await browser.newPage()
      await page.goto('/fr/auth/signup')
      await page.fill('input[name="name"]', testUser.name)
      await page.fill('input[name="email"]', `login-${Date.now()}@example.com`)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')
      await page.close()
    })

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('/fr/auth/login')

      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)

      await page.click('button[type="submit"]')

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/fr/auth/login')

      await page.fill('input[name="email"]', 'wrong@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')

      await page.click('button[type="submit"]')

      // Should show error message
      await expect(page.getByText(/incorrect/i)).toBeVisible()
    })

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/fr/auth/login')

      const signupLink = page.getByRole('link', { name: /s'inscrire/i })
      await expect(signupLink).toBeVisible()

      await signupLink.click()
      await expect(page).toHaveURL(/\/fr\/auth\/signup/)
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/fr/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/fr\/auth\/login/)
    })

    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      await page.goto('/fr/profile')

      // Should redirect to login
      await expect(page).toHaveURL(/\/fr\/auth\/login/)
    })

    test('should allow access to protected routes after login', async ({ page }) => {
      // Login first
      await page.goto('/fr/auth/login')
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')

      // Now try to access protected route
      await page.goto('/fr/dashboard')
      await expect(page).toHaveURL(/\/fr\/dashboard/)
      await expect(page.getByText('Bienvenue')).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page }) => {
      // Login first
      await page.goto('/fr/auth/login')
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')

      // Wait for dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/)

      // Click logout button
      await page.getByRole('button', { name: /se déconnecter/i }).click()

      // Confirm logout in dialog
      await page.getByRole('button', { name: /se déconnecter/i }).last().click()

      // Should redirect to home
      await expect(page).toHaveURL(/\/fr$/)
    })
  })
})
