# Product Specification — Health In Cloud

**Document type**: Product specification (non-technical)
**Status**: Draft
**Last updated**: October 2025 (translated & reformatted)

---

## 1. Product Overview
- **Purpose**: Web platform delivering orthophonic and neuropsychological rehabilitation exercises for the Nantes MPR department.
- **Customers**: Patients in recovery (primary) and speech therapists/clinicians (secondary).
- **Value**: Patients practice autonomously with guided feedback; clinicians monitor adherence and outcomes between in-person sessions.
- **Vision**:
  - *6–12 months*: Deliver a reliable, accessible MVP covering the critical rehabilitation journeys for Nantes MPR patients.
  - *12–24 months*: Expand the catalogue of neuropsychology and orthophony exercises; deepen guidance and feedback without targeting additional departments or external customers.
  - *24–36 months*: Personalise exercise recommendations and analytics while consolidating the single shared experience used by both patients and clinicians.

## 2. Problem & Value Proposition
- **Patients**
  - *Pain points*: Hard to remember prescribed exercises, no feedback between sessions, limited motivation.
  - *How we help*: Always-on access to guided exercises, instant performance feedback, motivational nudges.
- **Clinicians**
  - *Pain points*: No visibility into at-home practice, difficult to quantify progress.
  - *How we help*: Dashboard summarising adherence, performance trends, and actionable insights for upcoming appointments.

## 3. Differentiators & Guardrails
- Mobile-first responsive experience optimised for tablets and phones.
- Dark theme by default to reduce eye strain during long sessions.
- WCAG 2.1 AA accessibility baseline.
- Installable Progressive Web App for offline-friendly usage (roadmapped).
- Bilingual experience (FR/EN) with instant language switching.
- GDPR compliance for health data (mandatory).

## 4. Personas
### 4.1 Marie — Patient in Rehabilitation
- **Age**: 48 · **Condition**: Post-ischemic stroke with cognitive and speech impairments.
- **Context**: Receives care at Nantes MPR; low digital fluency.
- **Goals**: Regain cognitive/speech abilities, rebuild confidence.
- **Needs**: Short exercises, reminders, clear progress tracking, reassurance on correctness.
- **Quote**: “I want to keep practicing at home the way I do with my therapist and see if I’m improving.”

### 4.2 Dr. Typhaine — Speech Therapist
- **Age**: 43 · **Patients**: 20-30 active cases.
- **Context**: Clinician at Nantes MPR; intermediate-to-advanced digital skills.
- **Goals**: Improve patient outcomes and engagement between sessions.
- **Needs**: Prescribe tailored exercises, track adherence & progress, adapt treatment plans quickly.
- **Quote**: “I need visibility into my patients’ at-home practice so I can adjust recommendations proactively.”

## 5. Feature Outline
| Area | Scope | Status |
|------|-------|--------|
| **Authentication & Profile** | Email/password sign-in, Google/Apple SSO, session security, profile editing, language switcher. | Critical, MVP |
| **Public Experience** | Landing page, “Thanks” page for partners, marketing copy. | Critical, MVP |
| **Core App Shell** | Shared dashboard for every authenticated user, profile page, header, responsive navigation, footer, locale-aware routing. | Critical, MVP |
| **Neuropsychology Exercises** | Letter span (audio playback, configurable timing, scoring, history). Additional modules TBD. | In progress |
| **Orthophony Exercises** | Diadochokinesia drills, tongue twisters, further modules TBD. | In progress |
| **Progress Tracking** | Dashboard summary, streaks, per-exercise history, PDF export. | Planned |
| **Mobile Enhancements** | Offline mode, push notifications, automatic sync. | Nice-to-have |

> **TBD**: Final list of neuro and orthophony exercises; scoring models for each module; clinician-facing dashboard scope.

## 6. Primary User Journeys
1. **First-time patient onboarding**
   1. Discover landing page → review value proposition.
   2. Sign up via email/password or SSO.
   3. Land on dashboard with welcome message and starter exercise recommendations.
   4. Complete first exercise and receive immediate feedback.
2. **Daily training session**
   1. Launch PWA/web app (persistent session when possible).
   2. Review dashboard streaks, suggested exercises, last performance.
   3. Complete 2–3 exercises (mix of neuro + ortho).
   4. Receive feedback, encouragement, updated progress indicators.
3. **Progress review**
   1. From dashboard, open detailed progress view.
   2. Inspect global trends (7/30/90 days), category breakdown, streaks, time spent.
   3. Drill into specific exercises for score history and tailored recommendations.
   4. Export PDF summary if needed.
4. **Language switch**
   1. Trigger selector in header.
   2. Choose target locale (FR ↔ EN).
   3. Interface reloads with translated copy and locale-specific URLs.

## 7. Success Metrics (Proposed)
| Dimension | Metric | Target (TBD unless noted) | Notes |
|-----------|--------|---------------------------|-------|
| Engagement | Activation rate | 70% of new patients complete ≥1 exercise in first 7 days | Requires instrumentation |
| Engagement | Weekly active users | 60% of patients during MVP pilots | Needs cohort definition |
| Retention | Day 7 retention | 60% active again at day 7 | TBD measurement plan |
| Retention | Day 30 retention | 40% active again at day 30 | TBD measurement plan |
| Usage depth | Exercises per session | 2–3 | Validate via analytics |
| Outcomes | Average score improvement | +20% after 3 months | Requires baseline measurement |
| Satisfaction | NPS / qualitative feedback | ≥4.5/5 satisfaction | Collect via in-app survey |
| Technical quality | Lighthouse performance | ≥90/100 | Already tracked in engineering specs |

## 8. Open Questions & Next Inputs
- Detail the expanded catalogue of neuropsychological and orthophony exercises (names, learning goals, difficulty levels) beyond the current MVP scope.
- Finalise targets for all success metrics so analytics instrumentation can be configured.
- Keep delivery timelines for features such as offline mode, push notifications, and PDF export up to date in `.specs/ROADMAP.md`.
- Determine regulatory and data-handling requirements beyond GDPR (e.g., health data hosting, retention policies, data processing agreements).

---

## 9. Related Documents
- Technical implementation details: `specs/TECHNICAL_SPECIFICATIONS.md`
- Deployment and monitoring: `specs/VERCEL_DEPLOYMENT_GUIDE.md`, `specs/DEPLOYMENT_CHECKLIST.md`
- Quality benchmarks & scores: `specs/BEST_PRACTICES_AUDIT.md`, `specs/SCORES.md`
