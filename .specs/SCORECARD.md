# Quality Scorecard — Health In Cloud

**Document type**: Product & engineering quality scorecard
**Status**: Draft
**Last reviewed**: January 2025

---

## 1. Snapshot
- **Overall score**: 9.2/10
- **Confidence**: High (automated tests + CI/CD)
- **Next review window**: February 2025

---

## 2. Scorecard (current)
| Category | Score /10 | Trend vs last review | Commentary |
|----------|-----------|----------------------|------------|
| Architecture | 10 | → | App Router + route groups (site/auth/app), clean RSC/client boundary. 4 exercise types (neuro, ortho, ergo, kine). |
| TypeScript | 10 | → | Strict mode enabled, strong typing across codebase. |
| Accessibility | 9 | → | WCAG AA baseline, semantic HTML in legal pages & landing. |
| Security | 10 | → | Better Auth credential provider, secure session handling, bulk session revoke. |
| Performance | 9 | ↗️ +1 | Static pages optimized (force-static, revalidation), QR code image optimized (51% size reduction), lazy loading configured. |
| Internationalisation | 10 | → | FR/EN parity with next-intl, legal pages fully translated, new exercise types localized. |
| SEO | 10 | ↗️ +1 | All internal links use Next.js `<Link />`, external links properly use `<a>` with rel attributes. Sitemap/robots configured. |
| Tests | 9 | → | 100 tests total (14 files), coverage maintained despite feature growth. ResizeObserver mock for Recharts. |
| Monitoring | 10 | → | Sentry configured; analytics hooks ready, enhanced debugging components. |
| Documentation | 10 | → | Complete specs + legal pages (about, privacy, GDPR, legal notice). |
| Error handling | 10 | → | Error boundaries implemented, fault-tolerant flows, improved analysis error handling. |
| Infrastructure | 10 | → | Vercel + Neon + domain healthincloud.app configured. |

> **How to update**: adjust the score (0–10), update the trend arrow (`↗️`, `↘️`, `→`) with delta (e.g., `+1`, `-2`), and refresh the commentary with the rationale.

---

## 3. Change Log
| Date | Category | Old → New | Driver |
|------|----------|-----------|--------|
| 2025-10-08 | SEO | 9 → 10 | Audit confirmed: all internal links already use Next.js `<Link />`. Previous issue was misidentified - ESLint errors are in Storybook files (not production). |
| 2025-10-08 | Tests | 9 → 9 | Added 5 test files: get-analysis-data action, ergo/kine API routes, 2 Analysis components (100 tests total). ResizeObserver mock for Recharts. Coverage maintained. |
| 2025-10-08 | Features | N/A | New exercise types: ergothérapie (ergo), kinésithérapie (kine) with API routes, JSON catalogues, pages. Enhanced analysis with type distribution chart, difficulty breakdown. Bulk revoke sessions. |
| 2025-10-05 | Performance | 8 → 9 | Phase 4 optimizations: static page generation (force-static + revalidation), QR code optimization (2.09KB→1.02KB, 51% reduction), lazy loading, proper image sizing. |
| 2025-01-05 | Tests | 7 → 9 | Added 54 unit tests (auth-client, server actions, forms), 3 new E2E specs (theme, mobile, complete-journey), GitHub Actions CI/CD workflow with coverage gates. |
| 2025-01-05 | Performance | 9 → 8 | Build fails with 60+ ESLint errors (unescaped quotes in legal/landing pages). |
| 2025-01-05 | SEO | 10 → 9 | Legal pages use `<a>` instead of Next `<Link />`, ESLint violation. |
| 2025-10 | Tests | 0 → 7 | Added Vitest + Playwright suites, baseline coverage. |
| 2025-10 | Monitoring | 0 → 10 | Sentry rollout + analytics instrumentation. |
| 2025-10 | Documentation | 6 → 10 | Completed product, technical, deployment guides. |
| 2025-10 | Error handling | 5 → 10 | Implemented error boundaries and fault-tolerant flows. |
| 2025-10 | Infrastructure | N/A → 10 | Production stack on Vercel + Neon configured. |

> Append a new row whenever a category score changes. For multiple categories in one audit, use one row per category.

---

## 4. Targets & Actions
### Short term (next 4–6 weeks)
| Category | Current | Target | Key actions |
|----------|---------|--------|-------------|
| Performance | 9 | 10 | ✅ Static optimization done. Next: Further image optimization if needed. |
| SEO | 10 | 10 | ✅ **DONE**: All internal links use `<Link />`, sitemap/robots configured. ESLint errors are in Storybook only (non-production). |
| Tests | 9 | 9 | ✅ **DONE**: 100 tests (14 files), 6 E2E specs, CI/CD configured. Next: maintain coverage as codebase grows. |
| PWA readiness | 6 | 8 | Service worker implemented. Next: test offline functionality, add background sync. |
| Analytics | 5 | 8 | Enable Vercel/Plausible analytics and track core events. |

### Mid term (next quarter)
| Category | Current | Target | Key actions |
|----------|---------|--------|-------------|
| Tests | 9 | 10 | Add component visual regression tests, increase E2E coverage for exercise flows. |
| CI/CD | 9 | 10 | ✅ GitHub Actions configured. Next: Add deployment previews, E2E on PR. |
| State management | 7 | 8 | Introduce shared client state solution if complexity rises. |

### Long term (6+ months)
| Category | Current | Target | Key actions |
|----------|---------|--------|-------------|
| Tests | 7 | 10 | Sustain 90% coverage and regression suite. |
| Performance | 9 | 10 | Optimise LCP to <2.0s across target devices. |
| Accessibility | 9 | 10 | Achieve WCAG 2.1 AAA for key journeys. |

---

## 5. Update Checklist
1. Run the latest audits (automated or manual) and gather evidence.
2. Update the **Snapshot** date and overall score if the aggregate changed.
3. Adjust the **Scorecard** table with new scores, trends, and commentary.
4. Append entries to the **Change Log** for any category whose score moved.
5. Review **Targets & Actions**; mark actions done or revise targets if strategy changed.
6. Link supporting evidence (dashboards, PRs) in commit messages or related tracker items.

> Recommendation: review quarterly, or after major releases impacting quality.

---

## 6. References
- Product Specification: `.specs/PRODUCT_SPEC.md`
- Roadmap: `.specs/ROADMAP.md`
- Testing Guide: `.specs/TESTS_GUIDE.md`
- Testing Patterns: `.specs/TESTING_PATTERNS.md`
- Deployment checklist & monitoring playbooks: `specs/DEPLOYMENT_CHECKLIST.md`, `.specs/MCP_GUIDE.md`
