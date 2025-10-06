# Technical Setup & Architecture — Health In Cloud

**Document type**: Technical specification, setup tracker & architecture notes  
**Status**: Draft  
**Last updated**: October 2025

Use this document to bootstrap or audit the Health In Cloud Next.js stack. Checklists capture installation/config tasks, while the supplemental sections document architecture patterns and implementation details that engineers should follow.

---

## 1. Core Framework (Next.js App Router)
- [ ] Initialise project with `create-next-app` (App Router, TypeScript, ESLint enabled).
- [ ] Confirm project uses Next.js ≥ 15 with Turbopack in dev.
- [ ] Configure `tsconfig.json` (strict mode, path aliases `@/*`).
- [ ] Enable SWC minification and experimental React 19 features if required.
- [ ] Set base linting (`next lint`) and formatting (Prettier) rules.

## 2. Styling & UI Foundation
- [ ] Install Tailwind CSS + PostCSS + Autoprefixer.
- [ ] Configure `tailwind.config.ts` with app-specific theme tokens (colors, fonts) and dark mode class strategy.
- [ ] Add global styles (`src/app/globals.css`) with Tailwind base/components/utilities.
- [ ] Integrate `cn()` helper for class merging (`src/lib/utils.ts`).
- [ ] Import Tailwind styles in `src/app/layout.tsx`.

## 3. Component Library (shadcn/ui)
- [ ] Install shadcn CLI (`npx shadcn@latest init`).
- [ ] Configure components directory (`src/components/ui`).
- [ ] Generate base components (Button, Card, Input, Dialog, etc.).
- [ ] Ensure Tailwind typography/theme matches shadcn tokens.
- [ ] Document shadcn usage guidelines (composition patterns, variants).

## 4. Type Safety & Validation
- [ ] Install Zod for schema validation (`npm i zod`).
- [ ] Add utility for form validation (`src/lib/validators`).
- [ ] Document mapping between Zod schemas and Prisma models.
- [ ] Ensure `zodResolver` is used where forms exist (React Hook Form or equivalent).

## 5. Authentication (Better Auth)
- [ ] Install Better Auth packages (`better-auth`, adapters if needed).
- [ ] Configure auth handler under `src/app/api/auth/[...betterAuth]/route.ts`.
- [ ] Implement credential provider (email/password) with secure password hashing.
- [ ] Configure optional OAuth providers (Google, Apple) and document required env vars.
- [ ] Add client helpers (`src/lib/auth-client.ts`) with session handling.
- [ ] Protect server components/layouts using Better Auth session checks.

## 6. State & Data Fetching
- [ ] Install Zustand for lightweight client state (`npm i zustand`).
- [ ] Create store(s) for UI-only state (e.g., language selector, modals).
- [ ] Document when to prefer server components vs client state.
- [ ] Ensure Zustand usage avoids hydration mismatch (use `"use client"`).

## 7. Internationalisation (next-intl)
- [ ] Install `next-intl` and configure middleware.
- [ ] Set up locale route segments (`src/app/[locale]/`).
- [ ] Store translations under `src/locales/{locale}.json` with type-safe helpers.
- [ ] Implement language switcher and `Link` helpers preserving locale.
- [ ] Add metadata translations (title/description per locale).

## 8. Database Layer (Prisma + Neon)
- [ ] Install Prisma (`npm i prisma @prisma/client`).
- [ ] Run `npx prisma init` and point `DATABASE_URL` to Neon.
- [ ] Define schema in `prisma/schema.prisma` (models for users, exercises, progress, etc.).
- [ ] Configure Prisma client helper (`src/lib/prisma.ts`) with edge/runtime guards.
- [ ] Add migration workflow (`npx prisma migrate dev`, `migrate deploy`).
- [ ] Document branching strategy with Neon (dev/test/preview).

## 9. Tooling & Developer Experience
- [ ] Install ESLint plugins (`eslint-config-next`, `@typescript-eslint`, `eslint-plugin-import` as needed).
- [ ] Configure Prettier (`.prettierrc`) + format scripts.
- [ ] Install Husky / lint-staged (optional) for pre-commit checks.
- [ ] Add testing dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`.
- [ ] Set up Playwright (`@playwright/test`) with config under `playwright.config.ts`.
- [ ] Add accessibility/performance tooling (`lighthouse`, `axe-playwright`, Chrome DevTools MCP usage doc).

## 10. Environment & Secrets
- [ ] Create `.env.example` with all required env vars (Better Auth secrets, database URLs, OAuth credentials, Sentry DSN, etc.).
- [ ] Configure environment loading in Vercel (development, preview, production) and document process.
- [ ] Add safeguard to prevent Prisma client from running in edge runtime when not supported.

## 11. Deployment & Monitoring Hooks
- [ ] Ensure `npm run build` and `npm run start` succeed locally.
- [ ] Configure Sentry (`@sentry/nextjs`) for client/server/edge.
- [ ] Verify Vercel project integrates with Git main branch, preview URLs, custom domain.
- [ ] Document rollback process (revert deployment, Prisma migration rollback).

---

## 12. SEO & Metadata Practices
- [ ] Implement `generateMetadata` in route segments with locale-aware titles/descriptions.
- [ ] Configure canonical URLs and `alternates.languages` for FR/EN.
- [ ] Generate dynamic `sitemap.ts` and `robots.ts` in `src/app`.
- [ ] Populate Open Graph/Twitter card metadata (title, description, preview image).
- [ ] Ensure content pages expose structured data (JSON-LD) where relevant (e.g., FAQs) or document N/A.
- [ ] Verify lighthouse SEO score ≥ 100 in production builds.
- [ ] Add link rels (`preload`, `prefetch`) for critical assets (fonts, hero images) when beneficial.
- [ ] Document process for updating metadata when routes or locales change.

---

## 13. Architecture Snapshot
```
Users → Cloudflare (CDN, DNS, WAF, TLS) → Vercel (Next.js App Router) → Prisma → Neon PostgreSQL
                                               └─ Services: Sentry, OAuth providers
```
- Route groups: `(site)` public pages, `(auth)` auth flows, `(app)` authenticated dashboards/exercises.
- Prefer React Server Components; limit `"use client"` surfaces to interactivity and Zustand stores.
- Shared service helpers (`auth`, `i18n`, `prisma`, `sentry`) live under `src/lib` for separation of concerns.

## 14. Project Structure Blueprint
```
src/
├─ app/[locale]/(site)         # Landing, thank-you pages
├─ app/[locale]/(auth)         # Auth routes (Better Auth)
├─ app/[locale]/(app)          # Protected routes: dashboard, neuro, ortho, profile
├─ app/api/                    # Route handlers (auth, sentry)
├─ components/ui               # shadcn primitives
├─ components/navigation       # SiteHeader, SiteFooter, UserMenu, SignOutButton
├─ lib/                        # Auth, i18n, prisma singleton, sentry helpers, utils (cn)
├─ locales/{fr,en}/common.json # Translations
├─ __tests__/                  # Vitest specs (components, utils)
└─ middleware.ts               # Locale + auth guard
```
Keep this structure when adding files—avoid mixing server logic with client components.

## 15. Prisma Schema Essentials
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                    String    @id @default(cuid())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  providerId            String
  accountId             String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@unique([providerId, accountId])
}

model Session {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Verification {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  value      String
  expiresAt  DateTime
  identifier String

  @@unique([identifier, value])
  @@index([identifier])
}
```
Use `DIRECT_URL` for CLI migrations to bypass pooled connections. Create Neon branches for previews/feature work.

## 16. Authentication Flow Notes
- Better Auth core lives in `src/lib/auth.ts` and is exposed via `src/app/api/auth/[...betterAuth]/route.ts`.
- Client integration uses `createAuthClient` with `NEXT_PUBLIC_APP_URL`; protect server layouts by checking `auth().session?.user`.
- Required secrets: `BETTER_AUTH_SECRET`, optional `GOOGLE_CLIENT_ID/SECRET`, `APPLE_CLIENT_ID/SECRET`.
- Seeder command (`npm run db:seed`) provisions demo user `romain.ecarnot@gmail.com / mprnantes`.
- Middleware enforces redirects to `/auth/login` for protected routes—update matchers when exposing new public paths.

## 17. Internationalisation Patterns
- Locale directories (`/fr`, `/en`) wrap the App Router; fetch translations with `getTranslations(namespace)` in server components.
- Client components rely on `useTranslations` and must include `"use client"` pragma.
- Language switcher should preserve pathname/query parameters: `<Link href={pathname} locale="en">English</Link>`.
- Generate translated metadata via `generateMetadata` with `alternates.languages` to keep SEO parity.

## 18. Design System & Styling Notes
- Tailwind theme tokens defined in `globals.css` provide consistent light/dark palettes—add new tokens there before usage.
- Utility helper `cn(...classes)` merges `clsx` + `tailwind-merge` to avoid conflicting utilities.
- shadcn/ui components live in `src/components/ui`; prefer composition. Example:
  ```tsx
  <Card>
    <CardHeader><CardTitle>{t('dashboard.title')}</CardTitle></CardHeader>
    <CardContent>...</CardContent>
  </Card>
  ```
- Memoise pure components (`React.memo`) for large lists (e.g., exercise cards) to reduce re-renders.

## 19. Performance & Security Practices
- `next.config.ts`: enable `compress`, disable `poweredByHeader`, add `optimizePackageImports` for `lucide-react`, `@radix-ui/react-slot`, etc.
- Configure Next Image for AVIF/WebP formats and device sizes suited to mobile-first UX.
- Fonts via `next/font` with `display: 'swap'`, `preload: true`, and fallback stack to prevent FOIT.
- Cache-control headers for static assets plus security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Core Web Vitals targets: LCP < 2.5s, FID < 100 ms, CLS < 0.1, FCP < 1.8s, TTI < 3.8s.

## 20. Monitoring & Observability
- Sentry initialised in `instrumentation.ts` (server) and `instrumentation-client.ts` (client) with sampling (`tracesSampleRate`, `profilesSampleRate`, replay settings).
- Helper wrappers in `src/lib/sentry.ts` expose `captureException`, `captureMessage`, `setUserContext`; use them instead of raw Sentry calls.
- Environment variables: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (with `project:releases` scope for source maps).
- Ensure CI uploads source maps on deploy and filters sensitive data with `beforeSend` hooks.

## 21. Progress Notes
Use this section to capture audit results or blockers.
- _Example_: “2025-10-12 — OAuth keys pending from IT; auth checklist paused at Google provider setup.”

---

## 22. References
- Product overview: `.specs/PRODUCT_SPEC.md`
- Roadmap: `.specs/ROADMAP.md`
- Testing playbook: `.specs/TESTS_GUIDE.md`
- Quality scorecard: `.specs/SCORECARD.md`
- MCP integration: `.specs/MCP_GUIDE.md`
- Data & compliance: `.specs/DATA_COMPLIANCE.md`
