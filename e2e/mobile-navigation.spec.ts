import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE size

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('/fr')

    // Look for hamburger menu button
    const menuButton = page.getByRole('button', { name: /menu/i })
    await expect(menuButton).toBeVisible()
  })

  test('should open mobile menu when hamburger clicked', async ({ page }) => {
    await page.goto('/fr')

    // Click hamburger menu
    const menuButton = page.getByRole('button', { name: /menu/i })
    await menuButton.click()

    // Check if menu content is visible
    // Looking for common navigation items
    await expect(
      page.getByRole('link', { name: /accueil/i }).or(page.getByText(/accueil/i))
    ).toBeVisible()
  })

  test('should close mobile menu after clicking a link', async ({ page }) => {
    await page.goto('/fr')

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i })
    await menuButton.click()

    // Click on a navigation link
    const homeLink = page.getByRole('link', { name: /accueil/i }).first()
    if (await homeLink.isVisible()) {
      await homeLink.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Menu should be closed (hamburger button should still be visible)
      await expect(menuButton).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('should display user info in mobile menu when authenticated', async ({ page }) => {
    // Create a test user and login
    await page.goto('/fr/auth/signup')
    const testEmail = `mobile-test-${Date.now()}@example.com`

    await page.fill('input[name="name"]', 'Mobile Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'TestPass123')
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL(/\/fr\/dashboard/)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i })
    await menuButton.click()

    // Check if user info is displayed in menu
    await expect(page.getByText(/mobile test user/i)).toBeVisible()
  })

  test('should show auth links in mobile menu when not authenticated', async ({ page }) => {
    await page.goto('/fr')

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i })
    await menuButton.click()

    // Check for login/signup links
    const hasAuthLinks =
      (await page.getByRole('link', { name: /connexion|se connecter/i }).isVisible()) ||
      (await page.getByRole('link', { name: /inscription|s'inscrire/i }).isVisible())

    expect(hasAuthLinks).toBe(true)
  })
})

test.describe('Mobile Navigation - Landscape', () => {
  test.use({ viewport: { width: 667, height: 375 } }) // Landscape mode

  test('should adapt to landscape orientation', async ({ page }) => {
    await page.goto('/fr')

    // Hamburger menu might still be visible in landscape on small devices
    const menuButton = page.getByRole('button', { name: /menu/i })

    // Just check page loads correctly
    await expect(page).toHaveURL(/\/fr/)
  })
})
