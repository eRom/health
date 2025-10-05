# Product Roadmap — Health In Cloud

**Document type**: Roadmap overview (product scope)
**Status**: Draft
**Last updated**: October 2025

---

## 1. Roadmap Snapshot
| Horizon | Timeframe | Strategic Theme | Headline Outcomes |
|---------|-----------|-----------------|-------------------|
| **Now** | Q4 2025 | Foundation & launch | Ship a reliable bilingual MVP with secure auth, core pages, and first rehab exercises. |
| **Next** | Q1–Q2 2026 | Exercise depth & insights | Expand the exercise catalogue, enrich progress tracking, and instrument analytics. |
| **Later** | H2 2026+ | Personalised guidance | Personalise recommendations, enhance motivation loops, and deepen patient-clinician collaboration without targeting new customer segments. |

---

## 2. Current Focus (Now — Q4 2025)
**Goal**: Deliver a production-ready MVP for Nantes MPR patients and clinicians sharing the same dashboard.

**Key workstreams**
1. **Platform foundations**
   - Stable Next.js 15.x stack, type-safe APIs, production Neon DB, Vercel deployment, Cloudflare DNS/SSL.
   - Authentication via Better Auth (email/password + optional Google/Apple SSO), protected routes, session handling.
2. **Experience baseline**
   - Public landing and thank-you pages, responsive navigation (header/footer), FR/EN localisation, dark theme default.
   - Shared dashboard shell with welcome state, starter exercise recommendations, profile editing basics.
3. **Exercise MVP**
   - Neuro: Letter span module with audio playback, configurable cadence, scoring, history stub.
   - Ortho: Diadochokinesia drills and tongue twisters with guided prompts.
4. **Quality & compliance**
   - Automated tests (unit, critical E2E), error monitoring (Sentry), analytics hooks ready, GDPR-compliant data handling outline.

**Immediate backlog (next two sprints)**
- Finalise footer + mobile navigation, polish landing page copy and CTAs.
- Harden auth flows (session persistence, redirects, smoke E2E).
- Wire first exercise data model and persistence pipeline.
- Enable basic progress view (latest scores, streak counter placeholder).
- Configure production observability (Sentry DSN, Vercel/Cloudflare analytics) and incident alerts.

---

## 3. Next Horizon (Q1–Q2 2026)
**Goal**: Broaden exercise coverage and make progress tracking meaningful.

**Planned initiatives**
1. **Exercise catalogue expansion**
   - Add neuro modules: visual memory, sustained attention, executive functions, working memory variants.
   - Add orthophony modules: reading comprehension, verbal expression, vocabulary enrichment, optional audio guidance.
   - Standardise exercise templates (instructions, difficulty levels, scoring rubrics).
2. **Progress intelligence**
   - Persist detailed attempt history, compute per-exercise and aggregate scores, streaks, time-on-task.
   - Deliver dashboard widgets: trend charts (7/30/90 days), category breakdown, top improvements.
   - Export progress summary as PDF for patients/clinicians.
3. **Analytics & instrumentation**
   - Activate privacy-compliant product analytics (e.g., Vercel Analytics + Plausible).
   - Track core funnels (signup, login, exercise completion) and engagement metrics aligned with Product Spec KPIs.
4. **Mobile readiness**
   - Service worker + manifest for PWA installability.
   - Lightweight offline cache for recent exercises and results.

**Dependencies**
- Final exercise list (names, learning objectives) — pending product input.
- Validation from clinicians on scoring models and feedback messages.

---

## 4. Later Horizon (H2 2026 and beyond)
**Goal**: Deliver smarter guidance while keeping a unified user experience.

**North-star initiatives**
1. **Personalised recommendations**
   - Suggest exercises based on performance trends, fatigue signals, and clinician goals.
   - Introduce adaptive difficulty within modules.
2. **Motivation loops**
   - Richer feedback (achievements, milestones, streak celebrations).
   - Optional reminders (email/push) respecting patient consent.
3. **Clinician collaboration**
   - Shared notes on patient dashboard, visit preparation summaries, secure export for in-person sessions.
   - No separate clinician interface; enhancements remain within the shared dashboard context.
4. **Regulatory readiness**
   - Extend data-handling policies beyond GDPR (hosting location requirements, retention windows, data processing agreements).
   - Audit trail and access logging for sensitive actions.

**Evaluation checkpoints**
- KPI attainment from earlier horizons (activation, retention, outcome improvement).
- Feedback from Nantes MPR on exercise coverage and motivation impact.

---

## 5. Out-of-Scope / Deferred Items
- Multi-tenant support, external departmental roll-out, or public API exposure.
- Advanced professional dashboards distinct from the shared experience.
- Third-party integrations (EMR, calendar) until core outcomes are validated.

---

## 6. Tracking & Next Steps
- Maintain execution detail (tasks, owners, dates) in the delivery tracker and engineering workboard — this document stays high level.
- Update this roadmap at the end of each quarter or when strategic priorities shift.
- Feed confirmed roadmap dates/milestones back into the Product Specification (Section 8) to replace remaining TBD targets.

