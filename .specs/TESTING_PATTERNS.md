# Testing Patterns — Health In Cloud

**Status**: Living document
**Last updated**: January 2025

This document provides concrete patterns and examples for writing tests in the Health In Cloud project.

---

## Table of Contents

1. [Unit Tests with Vitest](#unit-tests-with-vitest)
2. [Component Tests with Testing Library](#component-tests-with-testing-library)
3. [Server Actions Tests](#server-actions-tests)
4. [E2E Tests with Playwright](#e2e-tests-with-playwright)
5. [Mocking Strategies](#mocking-strategies)
6. [Common Patterns](#common-patterns)

---

## Unit Tests with Vitest

### Basic Utility Function Test

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    expect(cn('text-base', false && 'hidden', 'font-bold')).toBe('text-base font-bold')
  })
})
```

**Key points**:
- Test both happy path and edge cases
- Keep tests focused on one behavior per test
- Use descriptive test names

---

## Component Tests with Testing Library

### Form Component Pattern

```typescript
// __tests__/components/auth/login-form.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

// Mock external dependencies
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.email': 'Email',
      'auth.password': 'Password',
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should submit form with correct credentials', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({})
    vi.mocked(authClient.signIn.email).mockImplementation(mockSignIn)

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should display error message on failed login', async () => {
    vi.mocked(authClient.signIn.email).mockRejectedValue(new Error('Invalid'))

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
```

**Key points**:
- Mock all external dependencies (routing, i18n, API calls)
- Define mocks inline in the factory function to avoid hoisting issues
- Test user interactions, not implementation details
- Test accessibility (aria labels, roles)
- Test loading and error states

---

## Server Actions Tests

### Pattern for Testing Next.js Server Actions

```typescript
// __tests__/actions/update-preferences.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updatePreferences } from '@/app/actions/update-preferences'

// Mock all external dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('updatePreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  it('should return error when user is not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const result = await updatePreferences({ locale: 'fr' })

    expect(result).toEqual({
      success: false,
      error: 'Non authentifié',
    })
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('should update locale preference', async () => {
    const mockSession = {
      user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
      session: { id: 'session-123' },
    }
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const result = await updatePreferences({ locale: 'en' })

    expect(result).toEqual({ success: true })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { locale: 'en' },
    })
  })

  it('should handle database errors gracefully', async () => {
    const mockSession = {
      user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
      session: { id: 'session-123' },
    }
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB error'))

    const result = await updatePreferences({ locale: 'fr' })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
```

**Key points**:
- Mock auth, Prisma, and headers
- Test authentication checks first
- Test successful operations
- Test error handling
- Verify side effects (DB calls, logging)

---

## E2E Tests with Playwright

### Authentication Flow Pattern

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should successfully create account and login', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`

    // Signup
    await page.goto('/fr/auth/signup')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'Password123')
    await page.click('button[type="submit"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/fr\/dashboard/)
    await expect(page.getByText(/bienvenue/i)).toBeVisible()
  })

  test('should redirect unauthenticated users', async ({ page }) => {
    await page.goto('/fr/dashboard')
    await expect(page).toHaveURL(/\/fr\/auth\/login/)
  })
})
```

### Mobile Testing Pattern

```typescript
// e2e/mobile-navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should show hamburger menu', async ({ page }) => {
    await page.goto('/fr')
    const menuButton = page.getByRole('button', { name: /menu/i })
    await expect(menuButton).toBeVisible()
  })
})
```

**Key points**:
- Use page object pattern for complex flows
- Test user journeys, not just individual actions
- Use unique test data (timestamps) to avoid conflicts
- Test responsive behavior with viewport config
- Use semantic selectors (roles, labels) over CSS selectors

---

## Mocking Strategies

### Mocking Prisma

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
```

### Mocking Better Auth

```typescript
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

// Usage in test
vi.mocked(auth.api.getSession).mockResolvedValue({
  user: { id: '123', name: 'Test', email: 'test@test.com' },
  session: { id: 'session-123' },
})
```

### Mocking Next.js Routing

```typescript
const mockPush = vi.fn()

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
```

### Mocking next-intl

```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.email': 'Email',
      'auth.password': 'Password',
    }
    return translations[key] || key
  },
}))
```

---

## Common Patterns

### Testing Async Operations

```typescript
it('should handle async operation', async () => {
  const mockFn = vi.fn().mockResolvedValue({ success: true })

  const result = await mockFn()

  await waitFor(() => {
    expect(result).toEqual({ success: true })
  })
})
```

### Testing Error States

```typescript
it('should display error on failure', async () => {
  vi.mocked(apiCall).mockRejectedValue(new Error('Failed'))

  render(<Component />)
  fireEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/failed/i)
  })
})
```

### Testing Loading States

```typescript
it('should show loading state', async () => {
  vi.mocked(apiCall).mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 100))
  )

  render(<Component />)
  fireEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

### Testing Accessibility

```typescript
it('should have accessible form elements', () => {
  render(<Form />)

  const emailInput = screen.getByLabelText(/email/i)
  expect(emailInput).toHaveAttribute('type', 'email')
  expect(emailInput).toHaveAttribute('required')

  const submitButton = screen.getByRole('button', { name: /submit/i })
  expect(submitButton).toBeInTheDocument()
})
```

---

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
   - Arrange: Set up test data and mocks
   - Act: Perform the action
   - Assert: Verify the outcome

2. **One Assertion Per Test** (when practical)
   - Makes failures easier to diagnose
   - Tests are more maintainable

3. **Clear Test Names**
   - Use "should + behavior" format
   - Be specific about what you're testing

4. **Mock External Dependencies**
   - Always mock API calls, database, routing
   - Keep tests isolated and fast

5. **Test User Behavior, Not Implementation**
   - Use semantic selectors (roles, labels)
   - Avoid testing internal state

6. **Clean Up After Tests**
   - Use `beforeEach` to reset mocks
   - Clear timers and event listeners

---

## Running Tests

```bash
# Unit tests (watch mode)
npm test

# Unit tests (single run)
npm run test:run

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E interactive mode
npm run test:e2e:ui
```

---

## Troubleshooting

### Common Issues

**Mock hoisting errors**:
- Define mock values inline in the factory function
- Don't reference external variables in `vi.mock()`

**Async timeout**:
- Use `await waitFor()` for async assertions
- Increase timeout if needed: `waitFor(() => {}, { timeout: 5000 })`

**Component not rendering**:
- Check if all required mocks are in place
- Verify import paths match

**E2E flaky tests**:
- Add explicit `waitForLoadState('networkidle')`
- Use `waitFor` instead of fixed timeouts
- Check for race conditions

---

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Kent C. Dodds - Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
