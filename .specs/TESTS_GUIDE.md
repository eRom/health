# Testing Playbook — Health In Cloud

**Document type**: Agent-oriented testing guide  
**Status**: Draft  
**Last updated**: October 2025

This playbook tells any AI coding agent (Codex, Claude, etc.) how to design, implement, run, and report tests for the Health In Cloud project. It covers unit, integration, end-to-end, accessibility/design, and performance checks, plus how to update the quality scorecard after each test campaign.

---

## 1. Testing Principles
- **Ship with evidence**: Every feature or bug fix must include automated tests or a written justification logged in the PR notes.
- **Test the contract**: Prefer behavioural assertions (what the user/API sees) over implementation details.
- **Small -> large**: Start with unit/component tests, then cover the happy path with E2E, and finally measure accessibility/performance.
- **Repeatable automation**: Use project scripts; do not invent ad-hoc commands without updating this guide.
- **Report back**: After running tests, update `.specs/SCORECARD.md` if any quality metric changes.

---

## 2. Unit & Component Tests (Vitest + Testing Library)
### When to add
- New utility functions, React components, hooks, or data transformers.
- Regression bugs found at unit level.
- Edge cases uncovered by QA or monitoring.

### How to create
1. Locate or create the matching test file under `src/__tests__/` mirroring the source path. Example: `src/components/foo.tsx` → `src/__tests__/components/foo.test.tsx`.
2. Use Testing Library helpers for React components; avoid snapshot tests unless verifying HTML structure.
3. Mock external services (auth client, fetch) with `vi.mock`.
4. Cover: success, failure/edge conditions, accessibility props (aria attributes) when relevant.

### Code pattern
```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/my-component';

describe('MyComponent', () => {
  it('shows title', () => {
    render(<MyComponent title="Dashboard" />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
```

### Run commands
```bash
npm test                # watch mode (preferred locally)
npm run test:run        # single pass
npm run test:coverage   # generate coverage report (text + html)
```
Artifacts: coverage report in `coverage/`; attach summary to PR if coverage changes.

### Reporting
- If coverage % moves across a threshold (e.g., +5%), update `.specs/SCORECARD.md` (`Tests` row score/trend + changelog entry).
- Log notable findings (e.g., flaky tests) in PR discussion or issue tracker.

---

## 3. Integration Tests (Server Components / API Helpers)
- Use Vitest with mocked network/database layers.
- For API routes in `src/app/api/*`, create tests under `src/__tests__/api/` using `NextRequest` mocks.
- Validate input validation (zod), status codes, and side effects (DB writes via Prisma mocks).
- Command set is identical to unit tests.

---

## 4. End-to-End Tests (Playwright)
### When to add/update
- New user flows (auth step, exercise creation, language switch).
- Bug fixes that involved UI interactions.
- Regression suite before releases.

### How to create
1. Add spec under `e2e/` using `*.spec.ts` naming.
2. Use page objects/helpers for repeated steps (`e2e/utils.ts`).
3. Cover: login, navigation, exercise run-through, localisation toggle, logout.
4. Use Playwright test fixtures for seeding (if required) or stub network with `page.route` when backend dependency is unstable.

### Run commands
```bash
npm run test:e2e          # headless full suite
npm run test:e2e:ui       # interactive UI (useful while authoring)
npx playwright test file.spec.ts --project=chromium
npx playwright show-report  # open latest html report
```
Artifacts: reports in `playwright-report/`, traces in `test-results/`. Upload relevant screenshots to PR if debugging.

### Reporting
- Record flaky failures and mitigation in PR notes.
- If E2E coverage improves (e.g., new critical path) adjust Scorecard commentary for `Tests`.

---

## 5. Experience Quality Tests
### Accessibility (Chrome DevTools / Playwright Axe)
1. Run Lighthouse via Chrome DevTools MCP or locally:
   ```bash
   npm run lint:a11y  # if configured, otherwise use MCP command chrome_lighthouse
   ```
2. Validate WCAG issues; log remediation tasks.
3. Update Scorecard (`Accessibility` row) if major improvements/regressions occur; add changelog entry specifying metrics.

### Visual/UI regression
- Capture Playwright screenshots for key pages (`browser_take_screenshot`).
- Compare manually or with diff tooling (if set up). Document results in PR.
- For design token changes, verify shadcn component demos via Storybook (once introduced).

### Content/i18n spot-checks
- During E2E runs, assert locale-specific content to ensure translations exist.

---

## 6. Performance Tests
### Lighthouse / Chrome DevTools
1. Run Lighthouse (performance + accessibility categories) against `/`, `/dashboard`, `/neuro`.
2. Track metrics: LCP, FID, CLS, score.
3. If LCP > 2.5s or score < 90, open an optimization task.
4. Report improvements/regressions in Scorecard (`Performance` row) including numbers (e.g., “LCP 2.1s → 1.8s”).

### Web Vitals monitoring
- For production issues flagged by Vercel/Sentry, reproduce locally with DevTools performance panel.
- Document findings and follow-ups.

---

## 7. Updating the Scorecard
Whenever a test cycle affects quality metrics:
1. Open `.specs/SCORECARD.md`.
2. **Snapshot section**: adjust overall score or confidence if warranted.
3. **Scorecard table**: modify the relevant category (score, trend, commentary).
4. **Change Log**: append a row `YYYY-MM-DD | Category | old → new | reason`.
5. **Targets & Actions**: mark completed actions or add new ones that emerged.
6. Commit changes alongside code/tests for traceability.

If no metrics changed, note “No scorecard update required” in the PR description.

---

## 8. Pull Request Checklist for Agents
- [ ] Unit/integration tests added or updated.
- [ ] E2E coverage touched when user flow changes.
- [ ] Accessibility/performance checks run if UI or bundle changed.
- [ ] `npm run lint` / `npm run type-check` / `npm run build` (if relevant) executed.
- [ ] Scorecard considered and updated when metrics moved.
- [ ] Test evidence (coverage %, Lighthouse score, screenshots) linked in PR summary.

---

## 9. Reference Commands
| Purpose | Command |
|---------|---------|
| Unit tests (watch) | `npm test` |
| Unit tests (CI) | `npm run test:run` |
| Coverage report | `npm run test:coverage` |
| E2E suite | `npm run test:e2e` |
| E2E UI authoring | `npm run test:e2e:ui` |
| Playwright report | `npx playwright show-report` |
| Lighthouse via MCP | `chrome_lighthouse({ url, categories })` |

---

## 10. Future Enhancements
- Automate accessibility testing via Playwright Axe integration.
- Introduce visual regression (Playwright snapshot diff or Chromatic) once Storybook is available.
- Add performance budget checks to CI (e.g., Lighthouse CI).

Keep this document updated whenever tooling or workflow changes. Agents should flag stale instructions immediately.

