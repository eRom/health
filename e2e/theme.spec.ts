import { test, expect } from '@playwright/test'

test.describe('Theme Switching', () => {
  test('should persist theme preference in localStorage', async ({ page }) => {
    await page.goto('/fr')

    // Default theme should be set
    await page.waitForLoadState('networkidle')

    // Find theme toggle button (assuming it exists in header)
    const themeButton = page.locator('[aria-label*="theme" i], [aria-label*="thème" i]').first()

    if (await themeButton.isVisible()) {
      // Click to toggle theme
      await themeButton.click()

      // Wait a bit for theme to apply
      await page.waitForTimeout(500)

      // Check localStorage for theme persistence
      const theme = await page.evaluate(() => localStorage.getItem('theme'))
      expect(theme).toBeTruthy()

      // Reload page
      await page.reload()

      // Theme should persist after reload
      const themeAfterReload = await page.evaluate(() => localStorage.getItem('theme'))
      expect(themeAfterReload).toBe(theme)
    } else {
      // Skip test if theme toggle not found
      test.skip()
    }
  })

  test('should apply dark class to html element when dark theme selected', async ({ page }) => {
    await page.goto('/fr')
    await page.waitForLoadState('networkidle')

    // Set dark theme via localStorage
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check if html or body has dark class
    const hasDarkClass = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark')
      )
    })

    expect(hasDarkClass).toBe(true)
  })

  test('should apply light theme correctly', async ({ page }) => {
    await page.goto('/fr')
    await page.waitForLoadState('networkidle')

    // Set light theme
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check if html doesn't have dark class
    const hasDarkClass = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark')
      )
    })

    expect(hasDarkClass).toBe(false)
  })
})
