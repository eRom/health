import { test, expect } from '@playwright/test'

test.describe('Language Switching', () => {
  test('should switch from French to English', async ({ page }) => {
    await page.goto('/fr')

    // Should be in French
    await expect(page.getByRole('heading', { name: 'Health In Cloud' })).toBeVisible()
    await expect(page.getByText(/Plateforme de rééducation/i)).toBeVisible()

    // Click language switcher
    await page.getByRole('button', { name: /🇫🇷/i }).click()

    // Select English
    await page.getByRole('button', { name: /English/i }).click()

    // Should be in English
    await expect(page).toHaveURL(/\/en/)
    await expect(page.getByText(/rehabilitation platform/i)).toBeVisible()
  })

  test('should preserve URL when switching language', async ({ page }) => {
    await page.goto('/fr/auth/login')

    // Switch to English
    await page.getByRole('button', { name: /🇫🇷/i }).click()
    await page.getByRole('button', { name: /English/i }).click()

    // Should stay on login page but in English
    await expect(page).toHaveURL(/\/en\/auth\/login/)
    await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible()
  })

  test('should show current language as selected', async ({ page }) => {
    await page.goto('/fr')

    await page.getByRole('button', { name: /🇫🇷/i }).click()

    // French should be marked as selected
    const frenchButton = page.getByRole('button', { name: /Français/i })
    await expect(frenchButton).toContainText('✓')
  })

  test('should work on protected routes', async ({ page }) => {
    // First, create and login with a test user
    const testEmail = `lang-test-${Date.now()}@example.com`

    await page.goto('/fr/auth/signup')
    await page.fill('input[name="name"]', 'Lang Test')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Should be on dashboard in French
    await expect(page).toHaveURL(/\/fr\/dashboard/)

    // Switch to English
    await page.getByRole('button', { name: /🇫🇷/i }).click()
    await page.getByRole('button', { name: /English/i }).click()

    // Should be on dashboard in English
    await expect(page).toHaveURL(/\/en\/dashboard/)
    await expect(page.getByText(/Welcome/i)).toBeVisible()
  })
})
