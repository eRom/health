# Data & Compliance Guidelines — Health In Cloud

**Document type**: Personal data handling policy  
**Status**: Draft  
**Last updated**: October 2025

This guide documents how Health In Cloud collects, stores, and protects user data today. Update it whenever the data model or regulatory obligations evolve.

---

## 1. Data Inventory
| Data element | Collected? | Purpose | Notes |
|--------------|------------|---------|-------|
| Email address | Yes | Account creation, notifications | Google/Apple OAuth IDs stored if social login is used. |
| Surname (last name) | Yes | Identification in dashboard | No other profile fields captured. |
| Exercise statistics | Yes | Track progress (timestamp, exercise ID, score/success flag, attempt count) | Individual responses/content are **not** stored. |
| Clinical/therapist notes | No | — | Keep it this way unless a new consent flow is introduced. |

> These datasets are considered personal data under GDPR but **not** medical/health data. HDS hosting is therefore not required at this stage.

---

## 2. Hosting & Infrastructure
- **Application**: Vercel (EU region).
- **Database**: Neon PostgreSQL (eu-central-1 / Frankfurt) connected via Prisma.
- **TLS**: Mandatory (HTTPS enforced by Vercel + Cloudflare). No plaintext traffic.
- **Database encryption**: Rely on Neon’s at-rest encryption; no application-level encryption currently in place.

- [x] Document the exact Neon region and ensure it remains within the EU.
- [ ] Review Vercel/Neon Data Processing Agreements (DPAs) once multiple team members are involved.

---

## 3. Access Control
- Every authenticated user can access only their own dashboard and progression; no shared or clinician-level views.
- No internal back-office or admin dashboard today. Database access limited to maintainers through secure credentials.
- [ ] When support tooling is added, enforce least-privilege roles and audit logging.

---

## 4. Retention & Deletion
- Data is retained indefinitely until the user requests deletion.
- In-app account deletion (profile page button) prompts a confirmation modal, calls a server action that purges the account and related exercise metrics, logs the user out, and redirects to the homepage.
- [ ] Add UX copy clarifying that deletion is irreversible and processed immediately.
- [ ] Log deletion requests for traceability (user ID, timestamp).

---

## 5. Backups & Continuity
- Neon offers automated point-in-time recovery (PITR) via the Neon dashboard (select branch → Restore to timestamp).
- No dedicated backup tooling beyond Neon today; revisit before production scale-up.
- [ ] Document a runbook for initiating PITR (steps, expected downtime).
- [ ] Define RPO/RTO objectives prior to onboarding additional clinics.

---

## 6. Consent & Legal Basis
- **Status**: To be confirmed. Recommended approaches:
  - Explicit consent collected during signup (checkbox referencing privacy policy).
  - Alternatively, legitimate interest aligned with rehabilitation programme (requires validation with legal advisor).
- [ ] Define the chosen legal basis and update privacy policy + signup UI accordingly.
- [ ] Store timestamp/version of consent once the mechanism is in place.

---

## 7. Audit Logging & Monitoring
- No user-level audit trail currently required (no cross-user data access).
- Error/performance monitoring handled via Sentry; ensure PII masking in logs.
- [ ] If support tooling is added, revisit the need for access logs.

---

## 8. Incident Response
- Security incidents should be reported immediately via email to `romain.ecarnot@gmail.com`.
- [ ] Draft an incident response checklist (containment, assessment, notification) once the team grows.
- [ ] Document timelines for GDPR breach notification (≤72h) if applicable.

---

## 9. Third Parties & Subprocessors
- No external processors beyond Vercel and Neon at this time.
- Romain Ecarnot acts as the primary data controller.
- [ ] Maintain a list of subprocessors in the privacy policy. Update this document if new services are added (email providers, analytics, etc.).

---

## 10. Open Questions / Next Actions
- [ ] Confirm legal basis for processing (consent vs legitimate interest).
- [ ] Produce a public-facing Privacy Policy referencing this data handling approach.
- [ ] Decide on notification method for account deletion confirmation.
- [ ] Reassess backup and audit requirements before onboarding additional institutions.
