import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.getByRole('heading', { name: 'Health In Cloud' })).toBeVisible()
})
