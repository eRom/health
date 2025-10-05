# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Health In Cloud** is a web platform delivering orthophonic and neuropsychological rehabilitation exercises for the Nantes MPR department. It serves patients in recovery and their clinicians through a shared dashboard experience.

**Stack**: Next.js 15 (App Router) + TypeScript + Better Auth + Prisma + Neon PostgreSQL + shadcn/ui + Tailwind + next-intl (FR/EN)

**Status**: MVP in development (Q4 2025 target)

---

## Essential Commands

### Development
```bash
# Project not yet initialized - will use:
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript validation (when configured)
```

### Testing
```bash
npm test             # Vitest watch mode
npm run test:run     # Vitest single pass (CI)
npm run test:coverage # Generate coverage report
npm run test:e2e     # Playwright E2E suite (headless)
npm run test:e2e:ui  # Playwright interactive UI
npx playwright show-report  # View latest E2E results
```

### Database
```bash
npx prisma migrate dev      # Create and apply migration
npx prisma migrate deploy   # Production migration
npx prisma studio           # Visual DB explorer
npm run db:seed             # Provision demo user (romain.ecarnot@gmail.com / mprnantes)
```

---

## Architecture

### High-Level Flow
```
Users → Cloudflare (CDN, DNS, WAF) → Vercel (Next.js) → Prisma → Neon PostgreSQL
                                       └─ Sentry, OAuth providers
```

### Directory Structure
```
src/
├─ app/[locale]/(site)         # Public landing, thank-you pages
├─ app/[locale]/(auth)         # Better Auth flows
├─ app/[locale]/(app)          # Protected routes: dashboard, neuro, ortho, profile
├─ app/api/                    # API handlers (auth, sentry)
├─ components/ui               # shadcn primitives
├─ components/navigation       # SiteHeader, SiteFooter, UserMenu, SignOutButton
├─ lib/                        # Auth, i18n, Prisma singleton, Sentry helpers, utils (cn)
├─ locales/{fr,en}/common.json # Translations
├─ __tests__/                  # Vitest specs
└─ middleware.ts               # Locale + auth guards
```

### Key Patterns

**Route Groups**:
- `(site)` = Public pages
- `(auth)` = Authentication flows
- `(app)` = Authenticated dashboards/exercises

**Component Philosophy**:
- Prefer React Server Components (RSC) by default
- Use `"use client"` only for interactivity and Zustand stores
- Place shared service helpers in `src/lib/`

**Authentication**:
- Better Auth core: `src/lib/auth.ts`
- API route: `src/app/api/auth/[...betterAuth]/route.ts`
- Protect server layouts via `auth().session?.user` check
- Middleware enforces redirects to `/auth/login` for protected routes

**Internationalisation**:
- Locale directories (`/fr`, `/en`) wrap App Router
- Server components: `getTranslations(namespace)`
- Client components: `useTranslations` + `"use client"`
- Language switcher preserves pathname/query via `<Link href={pathname} locale="en">`

**Styling**:
- Tailwind theme tokens in `globals.css`
- `cn()` utility merges `clsx` + `tailwind-merge`
- shadcn/ui components in `src/components/ui`
- Dark mode class strategy

---

## Database Schema Essentials

**Key models**: User, Account, Session, Verification

**Environment variables**:
- `DATABASE_URL` = Neon pooled connection (for app)
- `DIRECT_URL` = Direct connection (for migrations)

**Neon workflow**:
- Use branches for preview/feature work
- Point different environments to different Neon branches

---

## Critical Environment Variables

Required in `.env` (see `.env.example` for full list):
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- Optional: `GOOGLE_CLIENT_ID/SECRET`, `APPLE_CLIENT_ID/SECRET`

---

## Quality Standards

**Core Web Vitals targets**: LCP < 2.5s, FID < 100ms, CLS < 0.1, FCP < 1.8s, TTI < 3.8s

**Accessibility**: WCAG 2.1 AA baseline (AAA for key journeys long-term)

**Testing targets**:
- Current coverage: ~20% (unit/integration)
- Short-term goal: 50%+
- Long-term goal: 90%

**Lighthouse**: Performance ≥90, SEO = 100

---

## Testing Workflow

### Unit/Component Tests
- Location: `src/__tests__/` mirroring source paths
- Use Testing Library for React components
- Mock external services with `vi.mock`
- Cover: success, failure/edge cases, accessibility props

### E2E Tests
- Location: `e2e/*.spec.ts`
- Use page objects/helpers for repeated steps
- Cover: auth, navigation, exercise flows, i18n toggle

### When to Update Scorecard
After tests that move quality metrics:
1. Update `.specs/SCORECARD.md` Scorecard table (score, trend, commentary)
2. Append Change Log entry: `YYYY-MM-DD | Category | old → new | reason`
3. Review Targets & Actions section

---

## Delivery Process

### Branch Naming
- `feature/<topic>` or `fix/<topic>` (lowercase, hyphenated)
- `hotfix/<issue>` for urgent production fixes

### Commit Convention
Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`

### Pre-Merge Checklist
- [ ] Tests added/updated per `.specs/TESTS_GUIDE.md`
- [ ] Accessibility/performance checks when UI changes
- [ ] Update `.specs/` if behaviour/architecture changes
- [ ] Sync env vars if new configuration added
- [ ] CI green (lint, tests, type-check, build)

### Deployment
- Merge to `main` → Vercel auto-deploys
- Apply Prisma migrations immediately after merge: `npx prisma migrate deploy`
- Monitor Sentry + Vercel analytics post-deploy

---

## MCP Integrations

Active connectors for context-aware operations:

| Connector | Purpose |
|-----------|---------|
| **Context7** | Documentation lookups (React, Next.js, Prisma) |
| **Sentry** | Error monitoring and triage |
| **Playwright** | Browser automation and E2E tests |
| **Shadcn** | UI component catalogue |
| **Prisma** | Schema exploration |
| **Vercel** | Deployments, logs, env vars |
| **Neon** | PostgreSQL branch management |
| **Chrome DevTools** | Performance, accessibility, Lighthouse |

See [.specs/MCP_GUIDE.md](.specs/MCP_GUIDE.md) for detailed usage examples.

---

## Slash Commands

- `/specs` – Read core specifications and confirm readiness
- `/audit` – Audit quality metrics and update scorecard

---

## Key References

- **Product overview**: [.specs/PRODUCT_SPEC.md](.specs/PRODUCT_SPEC.md)
- **Technical setup**: [.specs/TECHNICAL_SPEC.md](.specs/TECHNICAL_SPEC.md)
- **Roadmap**: [.specs/ROADMAP.md](.specs/ROADMAP.md)
- **Testing playbook**: [.specs/TESTS_GUIDE.md](.specs/TESTS_GUIDE.md)
- **Delivery workflow**: [.specs/DELIVERY_WORKFLOW.md](.specs/DELIVERY_WORKFLOW.md)
- **Quality scorecard**: [.specs/SCORECARD.md](.specs/SCORECARD.md)
- **MCP guide**: [.specs/MCP_GUIDE.md](.specs/MCP_GUIDE.md)
- **Data compliance**: [.specs/DATA_COMPLIANCE.md](.specs/DATA_COMPLIANCE.md)

---

## Important Notes

**Data Privacy**: EU-hosted (Vercel + Neon Frankfurt), GDPR-compliant, no medical/health data stored currently

**Personas**:
- Marie (48, post-stroke patient, low digital fluency)
- Dr. Typhaine (43, speech therapist, intermediate-advanced digital skills)

**Locales**: FR (primary), EN (secondary) with instant language switching

**Mobile-first**: Responsive design, dark theme default, PWA planned for offline support
