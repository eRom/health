# Delivery Workflow — Health In Cloud

**Document type**: Contribution & release guide  
**Status**: Draft  
**Last updated**: October 2025

This workflow describes how to take a change from idea to production while keeping quality and documentation in sync. Each pull request should follow the steps below.

---

## 1. Branching Strategy
- [ ] Create a branch from `main` using the pattern `feature/<topic>` or `fix/<topic>` (lowercase, hyphenated).
- [ ] Keep branches focused on a single feature/fix; avoid long-lived branches. Rebase on `main` frequently to resolve conflicts early.
- [ ] For hotfixes, use `hotfix/<issue>` and merge back into `main` + create a release tag if needed.

## 2. Commit Conventions
- [ ] Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, etc.).
- [ ] Keep commits small and meaningful; include context in the body if not obvious.
- [ ] Run `npm run lint`, `npm run test:run`, and relevant scripts before committing (or configure pre-commit hooks via Husky).

## 3. Implementation Checklist
- [ ] Update or add tests per `.specs/TESTS_GUIDE.md` (unit, integration, E2E).
- [ ] Run accessibility/performance checks when UI or bundles change (Lighthouse/Chrome DevTools).
- [ ] Update specs in `.specs/` if behaviour, architecture, or quality metrics change.
- [ ] Sync environment variables or secrets if the change introduces new configuration.

## 4. Pull Request Preparation
- [ ] Title follows Conventional Commits (e.g., `feat: add rehab progress chart`).
- [ ] PR description covers: context, summary of changes, tests run (with commands/output), scorecard updates (if any), follow-up tasks.
- [ ] Link related issues or tasks (GitHub Issues, Jira, etc.).
- [ ] Attach screenshots or Lighthouse reports when relevant.
- [ ] Ensure TODOs or debug code are removed.

## 5. Review Process
- [ ] Request at least one reviewer; mention domain experts when needed.
- [ ] Address review comments promptly; prefer follow-up commits over force pushes when discussion is ongoing.
- [ ] Once approvals and green CI are in place, rebase to a clean history if required.

## 6. CI/CD Expectations
- [ ] Verify CI jobs (lint, unit tests, E2E, type-check, build) succeed; CI must be green before merging.
- [ ] For Playwright tests, ensure preview URLs or local services are accessible as per pipeline configuration.
- [ ] If CI exposes new failures, fix them in-branch or coordinate with maintainers before merging.

## 7. Deployment & Release
- [ ] Merging to `main` triggers Vercel production deployment; monitor build logs.
- [ ] For schema changes, apply Prisma migrations to Neon (`prisma migrate deploy`) immediately after merge; confirm success.
- [ ] For hotfixes, monitor Vercel deployment and record release notes if required.

## 8. Post-Merge Actions
- [ ] Verify Sentry and Vercel analytics for new errors or performance regressions.
- [ ] Update `.specs/SCORECARD.md` if quality metrics changed during the PR.
- [ ] Close associated issues/tickets and document learnings in the appropriate spec.
- [ ] Share deployment summary in the team channel if applicable.

---

## References
- Product specification: `.specs/PRODUCT_SPEC.md`
- Roadmap: `.specs/ROADMAP.md`
- Technical specification: `.specs/TECHNICAL_SPEC.md`
- Testing guide: `.specs/TESTS_GUIDE.md`
- Quality scorecard: `.specs/SCORECARD.md`
- MCP guide: `.specs/MCP_GUIDE.md`
