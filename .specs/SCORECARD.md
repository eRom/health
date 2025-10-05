# Quality Scorecard — Health In Cloud

**Document type**: Product & engineering quality scorecard  
**Status**: Draft  
**Last reviewed**: October 2025

---

## 1. Snapshot
- **Overall score**: 9/10  
- **Confidence**: Medium (manual audit)  
- **Next review window**: Q1 2026 or after any major release

---

## 2. Scorecard (current)
| Category | Score /10 | Trend vs last review | Commentary |
|----------|-----------|----------------------|------------|
| Architecture | 10 | ↗️ +1 | App Router structure, RSC usage, clear separation of concerns. |
| TypeScript | 10 | → | Strict mode enabled, strong typing across surface. |
| Accessibility | 9 | → | WCAG AA baseline met; improvements pending for contrast audits. |
| Security | 10 | ↗️ +1 | Hardened auth, secure headers, secrets management. |
| Performance | 9 | → | Core Web Vitals within targets, room for LCP refinement. |
| Internationalisation | 10 | → | FR/EN parity delivered with next-intl. |
| SEO | 10 | → | Metadata, sitemap, robots, Open Graph configured. |
| Tests | 7 | ↗️ +7 | Vitest + Playwright in place; coverage still low (~20%). |
| Monitoring | 10 | ↗️ +10 | Sentry configured, analytics hooks ready. |
| Documentation | 10 | ↗️ +4 | Comprehensive specs, guides, deployment docs. |
| Error handling | 10 | ↗️ +5 | Error boundaries, fallback flows implemented. |
| Infrastructure | 10 | ↗️ +10 | Vercel, Neon, Cloudflare (infra) configured; IaC pending. |

> **How to update**: adjust the score (0–10), update the trend arrow (`↗️`, `↘️`, `→`) with delta (e.g., `+1`, `-2`), and refresh the commentary with the rationale.

---

## 3. Change Log
| Date | Category | Old → New | Driver |
|------|----------|-----------|--------|
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
| Tests | 7 | 8 | Raise coverage to 50%+, add auth/navigation regression specs. |
| PWA readiness | 6 | 8 | Implement service worker, offline shell. |
| Analytics | 5 | 8 | Enable Vercel/Plausible analytics and track core events. |

### Mid term (next quarter)
| Category | Current | Target | Key actions |
|----------|---------|--------|-------------|
| Tests | 7 | 9 | Expand unit + E2E coverage to 80%, add CI gating. |
| CI/CD | 5 | 9 | Introduce GitHub Actions pipeline (lint, test, build). |
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
- Deployment checklist & monitoring playbooks: `specs/DEPLOYMENT_CHECKLIST.md`, `.specs/MCP_GUIDE.md`
