# MCP Guide — Health In Cloud

**Document type**: Model Context Protocol (MCP) inventory and usage guide  
**Status**: Draft  
**Last updated**: October 2025

---

## 1. Overview
Model Context Protocols connect the assistant to external services so it can query documentation, run diagnostics, and act on infrastructure without leaving the chat. This guide summarises the MCP connectors currently configured for Health In Cloud and how to use them effectively.

### Why MCP matters
- **Faster execution**: Trigger deployments, tests, and DB operations directly from the assistant.
- **Better decisions**: Pull live telemetry (errors, analytics) before proposing fixes.
- **Documentation on demand**: Fetch up-to-date framework references without context switching.
- **Consistent workflows**: Standard commands for repetitive tasks across the team.

---

## 2. Active Connectors
| # | Connector | Primary purpose | Key commands |
|---|-----------|-----------------|--------------|
| 1 | **Context7** | Documentation lookups for React, Next.js, Prisma, etc. | `resolve-library-id`, `get-library-docs` |
| 2 | **Sentry** | Production error monitoring and triage | `search_issues`, `get_issue_details`, `update_issue`, `search_docs` |
| 3 | **Playwright** | Browser automation and E2E regression checks | `browser_navigate`, `browser_click`, `browser_type`, `browser_take_screenshot`, `browser_snapshot` |
| 4 | **Shadcn** | UI component catalogue and install commands | `search_items_in_registries`, `view_items_in_registries`, `get_add_command_for_items`, `get_item_examples_from_registries` |
| 5 | **Prisma** | Database schema exploration and migration support | Schema explorer, migration helpers, query optimisation tips |
| 6 | **Vercel** | Deployments, logs, environment variables, analytics | Deployment list, real-time logs, env var management |
| 7 | **Neon** | PostgreSQL branch management and performance metrics | Branch creation, connection strings, usage metrics |
| 8 | **Chrome DevTools** | Performance, accessibility, and CSS debugging | DOM inspection, Lighthouse audits, performance traces, screenshots |

> ℹ️ The Cloudflare connector has been removed from the workspace; use Vercel logs or manual DNS tooling when needed.

---

## 3. Usage Highlights
### Context7 — Documentation helper
```
resolve-library-id("next-intl")
get-library-docs({ id: "next-intl@2.x", section: "routing" })
```
Use when you need accurate, version-specific snippets or API references during implementation.

### Sentry — Incident triage
```
search_issues({ query: "is:unresolved environment:production" })
get_issue_details({ issue_id: "PROJECT-123" })
update_issue({ issue_id: "PROJECT-123", status: "resolved" })
```
Run these before proposing bug fixes to confirm the latest stack traces and ensure the issue is actually resolved.

### Playwright — Browser automation
```
browser_navigate({ url: "https://preview.healthincloud.app" })
browser_click({ selector: "text=Sign in" })
browser_take_screenshot({ path: "artifacts/login.png" })
```
Helpful for smoke-testing critical flows (auth, exercise launch) or capturing repro screenshots.

### Shadcn — UI accelerators
```
search_items_in_registries({ query: "select" })
get_item_examples_from_registries({ id: "ui/select" })
get_add_command_for_items({ ids: ["ui/select"] })
```
Quickly pull component code and installation steps that match the design system.

### Prisma & Neon — Database workflow
```
# Inspect schema
prisma.list_models()

# Create temporary branch (Neon)
neon.create_branch({ name: "feature-progress-tracking" })
```
Coordinate schema changes by exploring current models, generating migrations, and spinning isolated branches for testing.

### Vercel — Deploy & observe
```
vercel.list_deployments({ project: "health-ortho" })
vercel.stream_logs({ deployment_id: "dpl_123" })
vercel.get_env({ target: "production" })
```
Confirm deployment status, check logs, or fetch environment variables without leaving the assistant.

### Chrome DevTools — Debug & optimise
```
# Lighthouse audit
chrome_lighthouse({ url: "https://healthincloud.app", categories: ["performance", "accessibility"] })

# Capture responsive layout
chrome_screenshot({ url: "https://healthincloud.app", device: "Pixel 7" })
```
Use for CSS/JS debugging, performance traces, accessibility checks, and responsive screenshots.

---

## 4. Example Flows
### Fix a production error
1. `search_issues` in Sentry for the reported stack trace.
2. `get_issue_details` to inspect context and user impact.
3. Reproduce locally or via `browser_navigate` (Playwright) if needed.
4. Implement and test the fix.
5. `update_issue` to close or assign follow-up.

### Ship a feature safely
1. Check docs with Context7 and grab UI snippets via Shadcn.
2. Adjust schema using Prisma helpers; create a Neon branch if isolation is required.
3. Run Playwright smoke tests.
4. Deploy via Git; monitor using Vercel logs.
5. Validate performance and accessibility through Chrome DevTools audits.

### Audit performance regression
1. `chrome_lighthouse` on affected routes to confirm Core Web Vitals.
2. Use Playwright to capture reproduction steps if necessary.
3. Inspect Sentry performance issues for related traces.
4. Ship optimisations, redeploy, re-run the Lighthouse audit.

---

## 5. Workflow Integration
| SDLC Phase | MCP touchpoints |
|------------|-----------------|
| **Build** | Context7, Shadcn, Prisma |
| **Test** | Playwright, Chrome DevTools |
| **Deploy** | Vercel |
| **Operate** | Sentry, Neon, Vercel |
| **Optimise** | Chrome DevTools, Playwright |

---

## 6. Quick Reference Matrix
| Need | Use this MCP | Rationale |
|------|--------------|-----------|
| Framework/API question | Context7 | Accurate, version-aware documentation |
| Add or tweak UI component | Shadcn | Prebuilt examples aligned with design system |
| Modify DB schema | Prisma | Understand relationships and migrations |
| Spin temporary DB branch | Neon | Safe experimentation without touching production |
| Validate auth/login flow | Playwright | Automate smoke tests and collect screenshots |
| Investigate production error | Sentry | Centralised stack traces and issue context |
| Check deployment status/logs | Vercel | Direct view of recent deploys and runtime logs |
| Audit performance or accessibility | Chrome DevTools | Lighthouse, performance traces, responsive debugging |

---

## 7. Maintenance Notes
- Review connector credentials quarterly; revoke any unused tokens.
- Keep this guide updated when connectors are added/removed or commands change.
- For services without MCP integration (e.g., Cloudflare), document manual steps in the deployment checklist.

