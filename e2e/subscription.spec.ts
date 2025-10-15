import { expect, test } from '@playwright/test'

const testUser = {
  name: 'Subscription Test User',
  email: `sub-test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

test.describe('Subscription Flow', () => {
  test.describe('Unauthenticated User', () => {
    test('should display pricing plans on subscription page', async ({
      page,
    }) => {
      await page.goto('/fr/subscription')

      // Should show pricing plans
      await expect(
        page.getByRole('heading', { name: /choisissez votre formule/i })
      ).toBeVisible()

      // Should show monthly and yearly plans
      await expect(page.getByText(/mensuel/i)).toBeVisible()
      await expect(page.getByText(/annuel/i)).toBeVisible()

      // Should show trial information
      await expect(page.getByText(/14 jours d'essai gratuit/i)).toBeVisible()
    })

    test('should require login when clicking subscribe', async ({ page }) => {
      await page.goto('/fr/subscription')

      // Click on a subscription button
      const subscribeButton = page.getByRole('button', {
        name: /commencer l'essai/i,
      })
      await subscribeButton.first().click()

      // Should redirect to login page
      await expect(page).toHaveURL(/\/fr\/auth\/login/)
    })
  })

  test.describe('Authenticated User Without Subscription', () => {
    test.beforeEach(async ({ page }) => {
      // Create and login user
      await page.goto('/fr/auth/signup')
      await page.fill('input[name="name"]', testUser.name)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')

      // Wait for redirect to dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/)
    })

    test('should show subscription required alert when accessing protected content', async ({
      page,
    }) => {
      // Try to access dashboard (should be blocked)
      await page.goto('/fr/dashboard')

      // Should redirect to subscription page with blocked param
      await expect(page).toHaveURL(/\/fr\/subscription\?blocked=true/)

      // Should show alert about access being blocked
      await expect(
        page.getByText(/accès aux exercices nécessite un abonnement/i)
      ).toBeVisible()
    })

    test('should display current subscription status', async ({ page }) => {
      await page.goto('/fr/subscription')

      // Should show subscription card
      await expect(
        page.getByRole('heading', { name: /votre abonnement/i })
      ).toBeVisible()

      // Should show that user has no active subscription
      await expect(page.getByText(/aucun abonnement actif/i)).toBeVisible()
    })

    test('should redirect to Stripe checkout when subscribing', async ({
      page,
    }) => {
      await page.goto('/fr/subscription')

      // Mock the checkout session creation
      await page.route('**/api/subscription/create-checkout', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'https://checkout.stripe.com/test-session',
          }),
        })
      })

      // Click subscribe button
      const subscribeButton = page
        .getByRole('button', {
          name: /commencer l'essai/i,
        })
        .first()

      // Wait for navigation to Stripe
      const navigationPromise = page.waitForURL(
        /checkout\.stripe\.com/,
        { timeout: 10000 }
      )

      await subscribeButton.click()

      // Should navigate to Stripe checkout
      await navigationPromise
    })
  })

  test.describe('Authenticated User With Active Subscription', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authenticated user with active subscription
      await page.addInitScript(() => {
        window.fetch = (async (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

          // Mock session with subscription
          if (url.includes('/api/auth/get-session')) {
            return new Response(
              JSON.stringify({
                session: {
                  user: {
                    id: 'test-user-active',
                    email: 'active@example.com',
                    name: 'Active User',
                    emailVerified: true,
                    healthDataConsentGrantedAt: new Date().toISOString(),
                  },
                },
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Mock subscription status
          if (url.includes('/api/subscription/status')) {
            return new Response(
              JSON.stringify({
                status: 'ACTIVE',
                stripePriceId: 'price_monthly',
                currentPeriodEnd: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                cancelAtPeriodEnd: false,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          return fetch(input, init)
        }) as typeof fetch
      })
    })

    test('should allow access to dashboard with active subscription', async ({
      page,
    }) => {
      await page.goto('/fr/dashboard')

      // Should not redirect
      await expect(page).toHaveURL(/\/fr\/dashboard/)
      await expect(page.getByText(/bienvenue/i)).toBeVisible()
    })

    test('should display active subscription details', async ({ page }) => {
      await page.goto('/fr/subscription')

      // Should show active subscription status
      await expect(page.getByText(/actif/i)).toBeVisible()

      // Should show manage subscription button
      await expect(
        page.getByRole('button', { name: /gérer l'abonnement/i })
      ).toBeVisible()
    })

    test('should allow subscription cancellation', async ({ page }) => {
      await page.goto('/fr/subscription')

      // Mock portal session creation
      await page.route('**/api/subscription/create-portal', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'https://billing.stripe.com/test-portal',
          }),
        })
      })

      // Click manage subscription button
      const manageButton = page.getByRole('button', {
        name: /gérer l'abonnement/i,
      })

      await manageButton.click()

      // Should redirect to Stripe portal
      await expect(page).toHaveURL(/billing\.stripe\.com/)
    })
  })

  test.describe('Trial Period', () => {
    test('should show trial status and days remaining', async ({ page }) => {
      // Mock user in trial period
      await page.addInitScript(() => {
        window.fetch = (async (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

          if (url.includes('/api/subscription/status')) {
            return new Response(
              JSON.stringify({
                status: 'TRIALING',
                trialEnd: new Date(
                  Date.now() + 10 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          return fetch(input, init)
        }) as typeof fetch
      })

      await page.goto('/fr/subscription')

      // Should show trial status
      await expect(page.getByText(/essai/i)).toBeVisible()

      // Should show days remaining
      await expect(page.getByText(/10 jours/i)).toBeVisible()
    })

    test('should allow access to dashboard during trial', async ({ page }) => {
      // Mock user in trial period
      await page.addInitScript(() => {
        window.fetch = (async (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

          if (url.includes('/api/auth/get-session')) {
            return new Response(
              JSON.stringify({
                session: {
                  user: {
                    id: 'trial-user',
                    email: 'trial@example.com',
                    emailVerified: true,
                    healthDataConsentGrantedAt: new Date().toISOString(),
                  },
                },
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          if (url.includes('/api/subscription/status')) {
            return new Response(
              JSON.stringify({
                status: 'TRIALING',
                trialEnd: new Date(
                  Date.now() + 10 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          return fetch(input, init)
        }) as typeof fetch
      })

      await page.goto('/fr/dashboard')

      // Should allow access
      await expect(page).toHaveURL(/\/fr\/dashboard/)
    })
  })

  test.describe('Expired Subscription', () => {
    test('should block dashboard access with expired subscription', async ({
      page,
    }) => {
      // Mock user with expired subscription
      await page.addInitScript(() => {
        window.fetch = (async (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

          if (url.includes('/api/auth/get-session')) {
            return new Response(
              JSON.stringify({
                session: {
                  user: {
                    id: 'expired-user',
                    email: 'expired@example.com',
                    emailVerified: true,
                    healthDataConsentGrantedAt: new Date().toISOString(),
                  },
                },
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          if (url.includes('/api/subscription/status')) {
            return new Response(
              JSON.stringify({
                status: 'CANCELED',
                currentPeriodEnd: new Date(
                  Date.now() - 10 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          return fetch(input, init)
        }) as typeof fetch
      })

      await page.goto('/fr/dashboard')

      // Should redirect to subscription page
      await expect(page).toHaveURL(/\/fr\/subscription\?blocked=true/)
    })

    test('should show renewal options on subscription page', async ({
      page,
    }) => {
      // Mock user with expired subscription
      await page.addInitScript(() => {
        window.fetch = (async (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

          if (url.includes('/api/subscription/status')) {
            return new Response(
              JSON.stringify({
                status: 'CANCELED',
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          return fetch(input, init)
        }) as typeof fetch
      })

      await page.goto('/fr/subscription')

      // Should show pricing plans for renewal
      await expect(
        page.getByRole('heading', { name: /choisissez votre formule/i })
      ).toBeVisible()

      // Should show subscription buttons
      await expect(
        page.getByRole('button', { name: /s'abonner/i })
      ).toBeVisible()
    })
  })

  test.describe('Checkout Success', () => {
    test('should display success message after checkout', async ({ page }) => {
      await page.goto('/fr/subscription/success?session_id=test_session_123')

      // Should show success message
      await expect(
        page.getByRole('heading', { name: /abonnement confirmé/i })
      ).toBeVisible()

      // Should have link to dashboard
      const dashboardLink = page.getByRole('link', {
        name: /accéder au tableau de bord/i,
      })
      await expect(dashboardLink).toBeVisible()
      await expect(dashboardLink).toHaveAttribute('href', /\/fr\/dashboard/)
    })

    test('should display trial information on success page', async ({
      page,
    }) => {
      await page.goto('/fr/subscription/success?session_id=test_session_123')

      // Should mention trial period
      await expect(page.getByText(/14 jours d'essai/i)).toBeVisible()
    })
  })

  test.describe('Payment Failed', () => {
    test('should show payment failed status', async ({ page }) => {
      // Mock user with payment failed
      await page.addInitScript(() => {
        window.fetch = (async (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

          if (url.includes('/api/subscription/status')) {
            return new Response(
              JSON.stringify({
                status: 'PAST_DUE',
                currentPeriodEnd: new Date(
                  Date.now() + 5 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          return fetch(input, init)
        }) as typeof fetch
      })

      await page.goto('/fr/subscription')

      // Should show payment issue alert
      await expect(page.getByText(/problème de paiement/i)).toBeVisible()

      // Should show update payment method button
      await expect(
        page.getByRole('button', { name: /mettre à jour/i })
      ).toBeVisible()
    })
  })

  test.describe('Localization', () => {
    test('should display subscription page in English', async ({ page }) => {
      await page.goto('/en/subscription')

      // Should show English text
      await expect(
        page.getByRole('heading', { name: /choose your plan/i })
      ).toBeVisible()
      await expect(page.getByText(/14-day free trial/i)).toBeVisible()
    })

    test('should maintain locale when navigating subscription flow', async ({
      page,
    }) => {
      await page.goto('/en/subscription')

      // Click subscribe button
      const subscribeButton = page.getByRole('button', {
        name: /start trial/i,
      })
      await subscribeButton.first().click()

      // Should redirect to English login page
      await expect(page).toHaveURL(/\/en\/auth\/login/)
    })
  })

  test.describe('Profile Integration', () => {
    test('should show subscription management in profile', async ({ page }) => {
      // Login user
      await page.goto('/fr/auth/login')
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')

      // Navigate to profile
      await page.goto('/fr/profile')

      // Should show subscription section
      await expect(page.getByText(/abonnement/i)).toBeVisible()

      // Should have link to subscription page
      const subscriptionLink = page.getByRole('link', {
        name: /gérer l'abonnement/i,
      })
      await expect(subscriptionLink).toHaveAttribute(
        'href',
        /\/fr\/subscription/
      )
    })
  })
})
