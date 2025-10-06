import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  const testUser = {
    name: 'Journey Test User',
    email: `journey-${Date.now()}@example.com`,
    password: 'SecurePass123!',
  }

  test('should complete full user journey: signup → dashboard → profile → preferences → logout', async ({
    page,
  }) => {
    // Step 1: Signup
    await page.goto('/fr/auth/signup')
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/fr\/dashboard/)
    await expect(page.getByText(/bienvenue/i)).toBeVisible()

    // Step 2: Navigate to Neuro exercises
    const neuroLink = page.getByRole('link', { name: /neuropsychologie|neuro/i }).first()
    if (await neuroLink.isVisible()) {
      await neuroLink.click()
      await expect(page).toHaveURL(/\/fr\/neuro/)
    }

    // Step 3: Navigate to Ortho exercises
    const orthoLink = page.getByRole('link', { name: /orthophonie|ortho/i }).first()
    if (await orthoLink.isVisible()) {
      await orthoLink.click()
      await expect(page).toHaveURL(/\/fr\/ortho/)
    }

    // Step 4: Navigate to Profile
    const profileLink = page.getByRole('link', { name: /profil|profile/i }).first()
    if (await profileLink.isVisible()) {
      await profileLink.click()
      await expect(page).toHaveURL(/\/fr\/profile/)

      // Verify user info is displayed
      await expect(page.getByText(testUser.name)).toBeVisible()
      await expect(page.getByText(testUser.email)).toBeVisible()
    } else {
      // Try user menu
      const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="menu utilisateur" i]').first()
      if (await userMenu.isVisible()) {
        await userMenu.click()
        await page.getByRole('menuitem', { name: /profil|profile/i }).click()
        await expect(page).toHaveURL(/\/fr\/profile/)
      }
    }

    // Step 5: Update preferences (if available)
    const localeSelect = page.locator('select, [role="combobox"]').filter({ hasText: /langue|language/i }).first()
    if (await localeSelect.isVisible()) {
      // Just verify it exists, actual change tested in language.spec.ts
      await expect(localeSelect).toBeVisible()
    }

    // Step 6: Logout
    const logoutButton = page.getByRole('button', { name: /déconnexion|déconnecter/i }).first()
    if (await logoutButton.isVisible()) {
      await logoutButton.click()

      // Confirm logout if dialog appears
      const confirmButton = page.getByRole('button', { name: /déconnexion|déconnecter/i }).last()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      // Should redirect to home
      await expect(page).toHaveURL(/\/fr\/?$/)
    }
  })

  test('should maintain authentication across page refreshes', async ({ page }) => {
    // Login
    await page.goto('/fr/auth/signup')
    const tempEmail = `refresh-test-${Date.now()}@example.com`

    await page.fill('input[name="name"]', 'Refresh Test')
    await page.fill('input[name="email"]', tempEmail)
    await page.fill('input[name="password"]', 'TestPass123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/fr\/dashboard/)

    // Refresh page
    await page.reload()

    // Should still be on dashboard (authenticated)
    await expect(page).toHaveURL(/\/fr\/dashboard/)
    await expect(page.getByText(/bienvenue/i)).toBeVisible()
  })

  test('should protect routes and redirect unauthenticated users', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/fr/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/fr\/auth\/login/)
  })

  test('should allow navigation between protected pages when authenticated', async ({ page }) => {
    // Login
    await page.goto('/fr/auth/signup')
    const navEmail = `nav-test-${Date.now()}@example.com`

    await page.fill('input[name="name"]', 'Nav Test')
    await page.fill('input[name="email"]', navEmail)
    await page.fill('input[name="password"]', 'TestPass123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/fr\/dashboard/)

    // Navigate to different protected pages
    const pages = ['/fr/neuro', '/fr/ortho', '/fr/profile', '/fr/dashboard']

    for (const targetPage of pages) {
      await page.goto(targetPage)
      await expect(page).toHaveURL(targetPage)
      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/auth\/login/)
    }
  })
})
