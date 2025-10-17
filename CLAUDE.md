# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Health In Cloud** is a Next.js 15-based web platform delivering orthophonic and neuropsychological rehabilitation exercises. It serves patients in recovery and healthcare providers with guided exercises, progress tracking, and adherence monitoring.

**Key Technologies:**
- Next.js 15 (App Router, Turbopack, React Server Components)
- TypeScript (strict mode)
- Tailwind CSS 4 + shadcn/ui
- Better Auth (email/password + Google OAuth)
- Prisma + Neon PostgreSQL
- next-intl (FR/EN localization)
- Stripe (subscription management)
- Sentry (error monitoring)
- PostHog (product analytics)
- Vitest + Playwright (testing)

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                 # Start dev server with Turbopack on :3000

# Building & Production
npm run build              # Prisma generate + production build
npm start                  # Start production server
npm run analyze            # Build with bundle analyzer

# Linting & Formatting
npm run lint               # ESLint check
npm run format             # Prettier format all files
npm run format:check       # Prettier check without writing

# Testing
npm test                   # Vitest in watch mode
npm run test:run           # Vitest single pass
npm run test:coverage      # Coverage report
npm run test:e2e           # Playwright E2E tests
npm run test:e2e:ui        # Playwright UI mode

# Database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations (dev)
npm run db:deploy          # Deploy migrations (production)
npm run db:seed            # Seed database with demo data

# Quality Checks
npm run lighthouse         # Lighthouse audit
npm run lighthouse:mobile  # Mobile Lighthouse audit
npm run storybook          # Storybook dev server
npm run build-storybook    # Build Storybook
```

### Testing Individual Files
```bash
# Run specific Vitest test file
npx vitest run __tests__/path/to/test.test.ts

# Run specific Playwright test
npx playwright test e2e/path/to/test.spec.ts

# Run Playwright with UI for debugging
npx playwright test --ui
```

## Architecture Overview

### Multi-tenant Route Structure

The app uses Next.js App Router with locale-based routing (`[locale]`) and three main route groups:

```
app/
├── [locale]/                   # Locale wrapper (FR/EN)
│   ├── (site)/                # Public marketing pages
│   │   ├── page.tsx           # Landing page
│   │   ├── privacy/           # Privacy policy
│   │   ├── legal/             # Legal notices
│   │   └── gdpr/              # GDPR information
│   ├── (auth)/                # Authentication flows
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── reset-password/
│   └── (app)/                 # Protected application routes
│       ├── dashboard/         # Main user dashboard
│       ├── profile/           # User profile management
│       ├── neuro/             # Neuropsychology exercises
│       ├── ortho/             # Orthophony exercises
│       ├── ergo/              # Ergotherapy exercises (planned)
│       ├── kine/              # Physiotherapy exercises (planned)
│       ├── badges/            # Achievement badges
│       ├── healthcare/        # Healthcare provider interface
│       ├── admin/             # Admin interface
│       └── subscription/      # Stripe subscription management
├── api/                       # API routes
│   ├── auth/[...betterAuth]/  # Better Auth handler
│   ├── webhooks/stripe/       # Stripe webhook handler
│   └── internal/              # Internal APIs (session, consent)
└── actions/                   # Server actions
```

### Authentication & Authorization

**Better Auth Integration:**
- Configuration: [lib/auth.ts](lib/auth.ts)
- Client helpers: [lib/auth-client.ts](lib/auth-client.ts)
- Server utilities: [lib/auth-utils.ts](lib/auth-utils.ts)
- Edge-safe utilities: [lib/auth-utils-edge.ts](lib/auth-utils-edge.ts)

**Session Management:**
- Sessions stored in PostgreSQL via Prisma adapter
- Cookie-based sessions with 7-day expiry
- Cross-subdomain cookies enabled for `*.healthincloud.app`
- Middleware checks session tokens and redirects unauthenticated users

**User Roles:**
- `USER`: Regular patients (default)
- `HEALTHCARE_PROVIDER`: Clinicians with access to patient data
- `ADMIN`: Full system access

**Protected Routes:**
- Middleware: [middleware.ts](middleware.ts) handles auth checks
- Routes under `(app)/` require authentication
- Email verification required for exercises (`/neuro`, `/ortho`)
- Health data consent required (except `/consent` page)
- Subscription checks performed at page level (not in middleware due to Edge Runtime limitations)

### Internationalization (i18n)

**Implementation:**
- Uses `next-intl` with locale routing (`/fr/*`, `/en/*`)
- Translation files: [locales/fr/common.json](locales/fr/common.json), [locales/en/common.json](locales/en/common.json)
- Server components: `getTranslations(namespace)`
- Client components: `useTranslations(namespace)` with `"use client"`
- Middleware: [middleware.ts](middleware.ts) handles locale detection and routing
- Locale utilities: [lib/locale-utils.ts](lib/locale-utils.ts)

**Important Pattern:**
- Always preserve locale in redirects and links
- Use `pathname` with `locale` parameter: `<Link href={pathname} locale="en">`
- Generate translated metadata via `generateMetadata` with `alternates.languages`

### Database & Data Model

**Prisma Schema:** [prisma/schema.prisma](prisma/schema.prisma)

**Key Models:**
- `User`: Core user entity with role-based access
- `Account`: OAuth/credential accounts (Better Auth)
- `Session`: Active user sessions
- `Verification`: Email verification tokens
- `ExerciseAttempt`: Exercise completion records
- `ConsentHistory`: Health data consent tracking
- `PatientProviderAssociation`: Patient-provider relationships
- `UserBadge`: Achievement system
- `StreakData`: Daily streak tracking
- `Subscription`: Stripe subscription data

**Connection Management:**
- Singleton pattern: [lib/prisma.ts](lib/prisma.ts)
- Use `DATABASE_URL` for connection pooling (Neon)
- Use `DIRECT_URL` for migrations (bypasses pooler)
- Edge Runtime: Cannot use Prisma; use API routes for data access

**Migrations:**
```bash
# Development: create and apply migration
npm run db:migrate

# Production/Preview: apply migrations only
npm run db:deploy

# After schema changes: regenerate client
npm run db:generate
```

### Subscription Management (Stripe)

**Integration:**
- Server-side: [lib/stripe.ts](lib/stripe.ts)
- Client-side: [lib/stripe-client.ts](lib/stripe-client.ts)
- Subscription utilities: [lib/subscription.ts](lib/subscription.ts), [lib/subscription-check.ts](lib/subscription-check.ts)
- Guards: [lib/subscription-guard.ts](lib/subscription-guard.ts)
- Webhook handler: [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts)

**Subscription Flow:**
1. User subscribes via `/subscription` page
2. Stripe creates subscription (starts with `TRIALING` status)
3. Webhook updates local `Subscription` model
4. Protected pages check subscription status via `checkSubscription()`

**Status Enum:** `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `UNPAID`

**Environment Variables Required:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRODUCT_ID`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`

### Styling & UI Components

**Design System:**
- Tailwind CSS 4 with custom theme tokens in [app/globals.css](app/globals.css)
- shadcn/ui components in [components/ui/](components/ui/)
- Utility helper: [lib/utils.ts](lib/utils.ts) exports `cn()` for class merging
- Dark theme by default; theme switcher uses `next-themes`
- Custom theme styles: 5 built-in themes (default, ruby, amber, emerald, blue)
- Theme configuration: [lib/theme-config.ts](lib/theme-config.ts)

**Component Patterns:**
- Prefer React Server Components; use `"use client"` only when needed
- Use shadcn composition patterns (Card, CardHeader, CardContent, etc.)
- Memoize pure components with `React.memo` for performance
- Import icons from `lucide-react`

**Adding shadcn Components:**
```bash
npx shadcn@latest add <component-name>
```

### Monitoring & Observability

**Sentry Configuration:**
- Client: [sentry.client.config.ts](sentry.client.config.ts)
- Server: [sentry.server.config.ts](sentry.server.config.ts)
- Instrumentation: [instrumentation.ts](instrumentation.ts)
- Custom helpers: Use wrappers from [lib/sentry.ts](lib/sentry.ts) if available

**Environment Variables:**
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`

**Logger:**
- Use structured logger: [lib/logger.ts](lib/logger.ts)
- Middleware logger: [lib/middleware-logger.ts](lib/middleware-logger.ts)

**PostHog Configuration (Product Analytics):**
- Client-side config: [lib/posthog-client.ts](lib/posthog-client.ts)
- Server-side config: [lib/posthog.ts](lib/posthog.ts)
- Provider: [components/providers/posthog-provider.tsx](components/providers/posthog-provider.tsx)
- Event definitions: [lib/analytics/events.ts](lib/analytics/events.ts)
- Property builders: [lib/analytics/properties.ts](lib/analytics/properties.ts)
- Tracking helpers: [lib/analytics/track.ts](lib/analytics/track.ts)

**Environment Variables:**
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` (default: https://eu.i.posthog.com)
- `NEXT_PUBLIC_POSTHOG_DEV_MODE` (optional: set to `true` to enable in development)

**Development Mode:**
- PostHog is **disabled by default** in development to avoid polluting analytics
- To enable for local testing: add `NEXT_PUBLIC_POSTHOG_DEV_MODE=true` to `.env.local`
- Console will show: `📊 PostHog: ✅ Enabled in development mode` when active
- See [POSTHOG_SETUP.md](POSTHOG_SETUP.md) for detailed setup instructions

**Usage Patterns:**

*Server Actions (Recommended):*
```typescript
'use server'

import { trackExerciseCompletion, trackSignup } from '@/lib/analytics/track'

// Track exercise completion
await trackExerciseCompletion('neuro', 'memory-game', {
  durationSeconds: 120,
  score: 8,
  maxScore: 10,
})

// Track user signup
await trackSignup('email', user.email)
```

*Client Components:*
```typescript
'use client'

import { captureEvent } from '@/lib/posthog-client'

// Track custom event
captureEvent('button_clicked', {
  button_name: 'Start Exercise',
  exercise_type: 'neuro',
})
```

**Key Features:**
- Automatic pageview tracking via PostHogProvider
- User identification synced with Better Auth sessions
- Session recording (disabled by default, requires GDPR consent)
- Type-safe event tracking with TypeScript definitions
- Coexists with Sentry (PostHog for analytics, Sentry for errors)
- Automatic property enrichment (locale, environment, user context)

**Event Categories:**
- `AUTH`: signup, login, logout, email verification
- `EXERCISE`: started, completed, abandoned, failed
- `BADGE`: unlocked, viewed, shared
- `SUBSCRIPTION`: pricing viewed, started, completed, cancelled
- `NAVIGATION`: page views, link clicks, CTA interactions
- `CONSENT`: health data consent, session recording opt-in/out

**GDPR Compliance:**
- Session recording disabled by default
- Only enabled after explicit health data consent
- All form inputs masked automatically
- Health data never captured in session recordings

### Progressive Web App (PWA)

**Implementation:**
- Uses `@serwist/next` for service worker
- Configuration: [next.config.ts](next.config.ts)
- Service worker source: [app/sw.ts](app/sw.ts)
- Disabled in development, enabled in production
- Offline page: [app/[locale]/offline/page.tsx](app/[locale]/offline/page.tsx)

## Important Implementation Patterns

### Server Actions

**Location:** [app/actions/](app/actions/)

**Pattern:**
```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function myAction() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  // Perform action
  return { success: true }
}
```

### Protected Page Pattern

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { checkSubscription } from '@/lib/subscription-check'

export default async function ProtectedPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Check subscription if needed
  const subscriptionStatus = await checkSubscription(session.user.id)
  if (!subscriptionStatus.hasActiveSubscription) {
    redirect('/subscription')
  }

  return <div>Protected Content</div>
}
```

### Locale-Aware Metadata

```typescript
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: {
        fr: '/fr/path',
        en: '/en/path',
      },
    },
  }
}
```

### Form Validation

**Pattern:**
- Use Zod schemas from [lib/schemas/](lib/schemas/)
- Use `react-hook-form` with `@hookform/resolvers/zod`
- Server-side validation in actions

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email(),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

## Key Configuration Files

### Environment Variables

**File:** [.env.example](.env.example)

**Critical Variables:**
- `DATABASE_URL` & `DIRECT_URL`: Neon PostgreSQL connection strings
- `BETTER_AUTH_SECRET`: Auth encryption key
- `NEXT_PUBLIC_APP_URL`: Base URL for auth callbacks
- `RESEND_API_KEY`: Email service
- `GOOGLE_CLIENT_ID/SECRET`: OAuth (optional)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe integration
- `STRIPE_WEBHOOK_SECRET`: Webhook verification
- `CRON_SECRET`: Cron job authentication

### TypeScript Configuration

**File:** [tsconfig.json](tsconfig.json)

- Strict mode enabled
- Path alias: `@/*` maps to root
- Unused locals/parameters flagged
- `noImplicitReturns` enforced

### Next.js Configuration

**File:** [next.config.ts](next.config.ts)

- Compression enabled
- `poweredByHeader` disabled
- Console removal in production
- Optimized imports for `lucide-react`, `@radix-ui/react-slot`
- Cache headers for static assets (1 year)
- Sentry, Serwist, next-intl, and bundle analyzer wrapped

## Testing Strategy

**Locations:**
- Unit tests: [__tests__/](__tests__/)
- E2E tests: [e2e/](e2e/)
- Test setup: [test-setup.ts](test-setup.ts)

**Vitest Config:** [vitest.config.ts](vitest.config.ts)
**Playwright Config:** [playwright.config.ts](playwright.config.ts)

**Testing Guidance:**
- See [.specs/TESTS_GUIDE.md](.specs/TESTS_GUIDE.md) for detailed test patterns
- Write unit tests for utilities and pure functions
- Write integration tests for components with complex logic
- Write E2E tests for critical user journeys (auth, exercises, subscriptions)
- Run tests before committing

## Performance & Quality

**Targets (from specs):**
- Lighthouse Performance: ≥90/100
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Accessibility: WCAG 2.1 AA baseline
- Mobile-first responsive design

**Optimization Techniques:**
- Use `next/image` for images (AVIF/WebP)
- Fonts via `next/font` with `display: 'swap'`
- React Server Components by default
- Dynamic imports for heavy client components
- Bundle analysis via `npm run analyze`

## Data Compliance

**GDPR Requirements:**
- See [.specs/DATA_COMPLIANCE.md](.specs/DATA_COMPLIANCE.md)
- Health data consent tracking via `ConsentHistory` model
- User must grant consent before accessing exercises
- Consent check in middleware redirects to `/consent` if not granted

## Common Workflows

### Adding a New Exercise

1. Create exercise component in `components/` (e.g., `components/neuro/new-exercise.tsx`)
2. Add route in `app/[locale]/(app)/neuro/new-exercise/page.tsx`
3. Update exercise registry in `lib/exercises.ts` if needed
4. Add translations to `locales/{fr,en}/common.json`
5. Create `ExerciseAttempt` records in server action
6. Write tests in `__tests__/components/neuro/new-exercise.test.tsx`
7. Add E2E test in `e2e/neuro/new-exercise.spec.ts`

### Adding a New Translation

1. Add keys to `locales/fr/common.json` (French - default)
2. Add corresponding keys to `locales/en/common.json`
3. Use in components:
   - Server: `const t = await getTranslations('namespace')`
   - Client: `const t = useTranslations('namespace')`
4. Test both locales in browser (`/fr/path` and `/en/path`)

### Database Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate` to regenerate client
3. Run `npm run db:migrate` to create and apply migration
4. Update seed script `prisma/seed.ts` if needed
5. Test migration locally
6. After merge, run `npm run db:deploy` in production

### Adding a shadcn Component

1. Run `npx shadcn@latest add <component-name>`
2. Component appears in `components/ui/`
3. Import and use in your feature
4. Customize via Tailwind classes or component props

## Slash Commands

The project has custom slash commands in [.claude/commands/](.claude/commands/):

- `/specs`: Read core specifications and confirm readiness
- `/audit`: Audit quality metrics and update scorecard
- `/plan [topic]`: Plan implementation for a topic
- `/style-new`: Add a new theme style to the application

## Project Documentation

**Specifications Directory:** [.specs/](.specs/)

Key docs:
- [PRODUCT_SPEC.md](.specs/PRODUCT_SPEC.md): Product vision, personas, features
- [TECHNICAL_SPEC.md](.specs/TECHNICAL_SPEC.md): Technical architecture, setup checklists
- [TESTS_GUIDE.md](.specs/TESTS_GUIDE.md): Testing patterns and examples
- [DELIVERY_WORKFLOW.md](.specs/DELIVERY_WORKFLOW.md): Branching, PR process, deployment
- [DATA_COMPLIANCE.md](.specs/DATA_COMPLIANCE.md): GDPR and data handling

## Development Philosophy

- **Mobile-first**: Design and test for mobile screens first
- **Accessibility**: WCAG 2.1 AA minimum; use semantic HTML
- **Performance**: Optimize for Core Web Vitals; lazy load when possible
- **Type Safety**: Use TypeScript strictly; prefer Zod for runtime validation
- **Testing**: Write tests for new features; maintain coverage
- **Documentation**: Update specs when behavior changes
- **Security**: Never commit secrets; validate input; sanitize output
- **i18n**: All user-facing text must be translatable

## Deployment

**Platform:** Vercel

**Workflow:**
1. Push to `main` triggers production deployment
2. Preview deployments for all branches
3. Vercel auto-populates `VERCEL_URL` and `VERCEL_ENV`
4. Prisma migrations must be run manually after merge: `npm run db:deploy`
5. Monitor Sentry for errors post-deployment

**Environment Setup:**
- Development: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Preview: `NEXT_PUBLIC_APP_URL=https://dev.healthincloud.app`
- Production: `NEXT_PUBLIC_APP_URL=https://healthincloud.app`

## Troubleshooting

### Prisma Client Issues
```bash
# Regenerate client
npm run db:generate

# Clear cache and rebuild
rm -rf node_modules/.prisma
npm run db:generate
```

### Auth Issues
- Check `BETTER_AUTH_SECRET` is set
- Verify `NEXT_PUBLIC_APP_URL` matches current environment
- Inspect cookies in browser DevTools (look for `better-auth.session_token`)
- Check Sentry for auth-related errors

### Build Failures
- Run `npm run lint` and fix issues
- Run `npm run test:run` and fix failing tests
- Check TypeScript errors with `npx tsc --noEmit`
- Clear `.next` cache: `rm -rf .next`

### Middleware Debugging
- Check logs in Vercel dashboard (Runtime Logs)
- Use `middlewareLogger` from [lib/middleware-logger.ts](lib/middleware-logger.ts)
- Test locally with various paths and cookies

## Demo User

For testing, a demo user is seeded via `npm run db:seed`:

- Email: `romain.ecarnot@gmail.com`
- Password: `mprnantes`

## Additional Resources

- Next.js docs: https://nextjs.org/docs
- Better Auth docs: https://better-auth.com
- Prisma docs: https://www.prisma.io/docs
- shadcn/ui: https://ui.shadcn.com
- Stripe docs: https://stripe.com/docs
