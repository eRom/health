import { expect, test } from "@playwright/test";

const testUser = {
  name: "Test User",
  email: `test-${Date.now()}@example.com`,
  password: "TestPassword123!",
};

test.describe("Authentication", () => {
  test.describe("Signup Flow", () => {
    test("should successfully create a new account", async ({ page }) => {
      await page.goto("/fr/auth/signup");

      // Fill signup form
      await page.fill('input[name="name"]', testUser.name);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/);
      await expect(page.getByText("Bienvenue")).toBeVisible();
    });

    test("should show validation for invalid email", async ({ page }) => {
      await page.goto("/fr/auth/signup");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "invalid-email");
      await page.fill('input[name="password"]', "password123");

      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveAttribute("type", "email");
    });

    test("should show validation for short password", async ({ page }) => {
      await page.goto("/fr/auth/signup");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "short");

      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toHaveAttribute("minlength", "8");
    });
  });

  test.describe("Login Flow", () => {
    test.beforeAll(async ({ browser }) => {
      // Create a test user first
      const page = await browser.newPage();
      await page.goto("/fr/auth/signup");
      await page.fill('input[name="name"]', testUser.name);
      await page.fill('input[name="email"]', `login-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.close();
    });

    test("should successfully login with valid credentials", async ({
      page,
    }) => {
      await page.goto("/fr/auth/login");

      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);

      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/);
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/fr/auth/login");

      await page.fill('input[name="email"]', "wrong@example.com");
      await page.fill('input[name="password"]', "wrongpassword");

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.getByText(/incorrect/i)).toBeVisible();
    });

    test("should have link to signup page", async ({ page }) => {
      await page.goto("/fr/auth/login");

      const signupLink = page.getByRole("link", { name: /s'inscrire/i });
      await expect(signupLink).toBeVisible();

      await signupLink.click();
      await expect(page).toHaveURL(/\/fr\/auth\/signup/);
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login when accessing dashboard without auth", async ({
      page,
    }) => {
      await page.goto("/fr/dashboard");

      // Should redirect to login
      await expect(page).toHaveURL(/\/fr\/auth\/login/);
    });

    test("should redirect to login when accessing profile without auth", async ({
      page,
    }) => {
      await page.goto("/fr/profile");

      // Should redirect to login
      await expect(page).toHaveURL(/\/fr\/auth\/login/);
    });

    test("should allow access to protected routes after login", async ({
      page,
    }) => {
      // Login first
      await page.goto("/fr/auth/login");
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');

      // Now try to access protected route
      await page.goto("/fr/dashboard");
      await expect(page).toHaveURL(/\/fr\/dashboard/);
      await expect(page.getByText("Bienvenue")).toBeVisible();
    });
  });

  test.describe("Google Auth", () => {
    test("should show Google button on login page", async ({ page }) => {
      await page.goto("/fr/auth/login");

      const googleButton = page.getByRole("button", {
        name: /continuer avec google/i,
      });
      await expect(googleButton).toBeVisible();
    });

    test("should show Google button on signup page", async ({ page }) => {
      await page.goto("/fr/auth/signup");

      const googleButton = page.getByRole("button", {
        name: /continuer avec google/i,
      });
      await expect(googleButton).toBeVisible();
    });

    test("should show separator between Google and email/password forms", async ({
      page,
    }) => {
      await page.goto("/fr/auth/login");

      const separator = page.getByText("ou");
      await expect(separator).toBeVisible();
    });
  });

  test.describe("Consent Flow", () => {
    test("should redirect to consent page for new Google users", async ({
      page,
    }) => {
      // Mock a user session without consent
      await page.addInitScript(() => {
        // Mock the session API to return user without consent
        window.fetch = async (url: string) => {
          if (url.includes("/api/internal/session")) {
            return new Response(
              JSON.stringify({
                session: {
                  user: {
                    id: "test-user",
                    emailVerified: true,
                    healthDataConsentGrantedAt: null,
                  },
                },
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          }
          return fetch(url);
        };
      });

      await page.goto("/fr/dashboard");

      // Should redirect to consent page
      await expect(page).toHaveURL(/\/fr\/consent/);
      await expect(page.getByText(/consentement requis/i)).toBeVisible();
    });

    test("should allow access to dashboard after granting consent", async ({
      page,
    }) => {
      // Mock successful consent grant
      await page.addInitScript(() => {
        window.fetch = async (url: string) => {
          if (url.includes("/api/internal/session")) {
            return new Response(
              JSON.stringify({
                session: {
                  user: {
                    id: "test-user",
                    emailVerified: true,
                    healthDataConsentGrantedAt: "2025-01-01T00:00:00Z",
                  },
                },
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          }
          return fetch(url);
        };
      });

      await page.goto("/fr/consent");

      // Check consent checkbox
      await page.check('input[name="consent"]');

      // Mock the grant consent action
      await page.route("**/api/actions/grant-consent", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      // Click accept button
      await page.getByRole("button", { name: /j'accepte/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/);
    });

    test("should prevent submission without consent", async ({ page }) => {
      await page.goto("/fr/consent");

      const acceptButton = page.getByRole("button", { name: /j'accepte/i });
      await expect(acceptButton).toBeDisabled();

      // Check consent checkbox
      await page.check('input[name="consent"]');

      // Button should now be enabled
      await expect(acceptButton).toBeEnabled();
    });
  });

  test.describe("Logout", () => {
    test("should successfully logout", async ({ page }) => {
      // Login first
      await page.goto("/fr/auth/login");
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');

      // Wait for dashboard
      await expect(page).toHaveURL(/\/fr\/dashboard/);

      // Click logout button
      await page.getByRole("button", { name: /se déconnecter/i }).click();

      // Confirm logout in dialog
      await page
        .getByRole("button", { name: /se déconnecter/i })
        .last()
        .click();

      // Should redirect to home
      await expect(page).toHaveURL(/\/fr$/);
    });
  });
});
