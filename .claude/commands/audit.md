---
description: Audit quality metrics and update the scorecard
---

Review the current state of the Health In Cloud project and update `.specs/SCORECARD.md` accordingly. Follow the steps below and commit all edits when finished.

## 1. Evaluate Categories

Re-assess each scorecard category:
- Architecture
- TypeScript
- Accessibility
- Security
- Performance
- Internationalisation (i18n)
- SEO
- Tests (unit, integration, E2E)
- Monitoring & Observability
- Documentation
- Error Handling & Resilience
- Infrastructure & Deployment

For each category, gather evidence (code changes, tooling outputs, dashboards) to support any score adjustments.

## 2. Update Scorecard Snapshot

- Recalculate the overall score (0–10) and update the **Snapshot** section.
- Refresh the confidence level and next review window if needed.

## 3. Score Table & Commentary

- Modify the **Scorecard (current)** table with the new score, trend arrow (`↗️`, `↘️`, `→`) and concise commentary (why it changed or stayed the same).
- Reference concrete artefacts (e.g., “Playwright suite covers auth/login”, “Lighthouse score 94”).

## 4. Change Log

- Append one row per category whose score changed using the format: `YYYY-MM-DD | Category | old → new | Driver`.
- If multiple categories changed in the same audit, add individual rows.

## 5. Targets & Actions

- Update the **Short term**, **Mid term**, and **Long term** tables:
  - Mark completed actions with a note or remove them.
  - Add new actions that emerged from the audit.
  - Adjust targets if strategy shifted.

## 6. Recommendations Summary

Provide a short written recap (can be placed in commit message or accompanying audit note) covering:
- Immediate high-priority fixes/tests/config changes.
- Short-term (≤ 1 month) improvements.
- Medium-term (1–3 months) roadmap-impacting work.

## 7. Evidence Checklist

During the audit, verify or capture:
- Latest unit/E2E test runs (`npm run test:run`, `npm run test:e2e`).
- Lighthouse or Chrome DevTools audits for key routes.
- Sentry/monitoring status (error rate, alerts).
- Deployment health on Vercel/Neon (build success, migrations).
- Documentation updates (README/specs) covering new features.

## 8. Finalise

- Update the “Last reviewed” date in `.specs/SCORECARD.md`.
- Ensure all edits are consistent with `.specs/TECHNICAL_SPEC.md`, `.specs/ROADMAP.md`, and `.specs/TESTS_GUIDE.md`.
- Stage and commit the modified files with a message such as `chore: audit quality metrics`.

## Notes

If no scores change, document the reasons (e.g., “No material changes since last audit”) and still update the review date to maintain traceability.
