# SPECS — Health In Cloud

## 1. Vue d'ensemble du projet
### Description générale
- Plateforme web et PWA bilingue (FR/EN) dédiée à la rééducation orthophonique et neuropsychologique pour le service MPR de Nantes.
- Expérience partagée patients/soignants : exercices guidés côté patient, supervision et collaboration légère côté clinicien.
- Application responsive, optimisée pour tablettes/smartphones, avec thème sombre par défaut et styles alternatifs configurables.

### Objectifs principaux
- Offrir un entraînement autonome sécurisé : accès permanent aux exercices, feedback immédiat, suivi de progression.
- Outiller les cliniciens : visibilité sur l’adhésion, tendances de performance, association patient-soignant et messagerie ciblée.
- Garantir un lancement MVP fiable : stack Next.js 15, authentification robuste, couverture de tests automatisés, conformité RGPD (consentement explicite).
- Construire un modèle économique durable : essai gratuit 14 jours puis abonnement Stripe (19 €/mois ou 180 €/an) avec emails transactionnels et portail client.

### Contexte et enjeux
- Patients à faible littératie numérique, besoin d’UX simple, accessible WCAG 2.1 AA, messages rassurants.
- Nécessité d’analyser la pratique à domicile entre deux séances présentielles, sans multiplier les interfaces pour les cliniciens.
- Contraintes réglementaires européennes (hébergement UE, consentement santé, traçabilité).
- Roadmap orientée consolidation MVP Q4 2025 puis enrichissement catalogue et personnalisation courant 2026.

## 2. Besoins
### Besoins fonctionnels
- **Auth & onboarding** : inscription email/mot de passe ou Google OAuth, validation email Better Auth, collecte consentement santé (`app/actions/signup-with-consent.ts`, `app/actions/grant-consent.ts`), réinitialisation PW, gestion de sessions multiples.
- **Accès payant** : essai gratuit 14 jours, middleware + guard (`middleware.ts`, `lib/subscription-guard.ts`) bloquant l’app sans abonnement actif, portail Stripe, annulation via Customer Portal, suivi des statuts (`SubscriptionStatus` Prisma).
- **Expérience patient** : catalogue d’exercices neuro/ortho/ergo/kine (`lib/data/exercises/*` + API routes), enregistrement des tentatives (`app/actions/submit-exercise-attempt.ts`), feedback, sélecteur de langue/ thème, mode PWA avec fallback offline.
- **Progression & motivation** : dashboard partagé, badges et streaks (`lib/badges.ts`, `prisma` modèles `UserBadge`, `StreakData`), partage social (phase 1 en place, phase 2 planifiée), export PDF (roadmap).
- **Collaboration clinicien** : invitations patient-soignant, association bidirectionnelle, messagerie (`app/actions/healthcare/*`, `PatientProviderAssociation`, `ProviderPatientMessage`), filtres par statut.
- **Support opérationnel** : emails transactionnels Resend (`lib/email`), Cron Vercel `/api/cron/subscription-notifications` pour relances, logs Sentry, MCP tooling pour exploitation.

### Besoins non-fonctionnels
- Performance : LCP < 2.5 s, FID < 100 ms, CLS < 0.1, scores Lighthouse ≥ 90 (desktop) et ≥ 80 (PWA).
- Qualité : TypeScript strict, tests Vitest + Playwright, coverage cible ≥ 50 % à court terme, CI GitHub Actions bloquante.
- Fiabilité : gestion des erreurs centralisée (`lib/logger.ts`, Sentry), reprise après échec (grace period abonnement), cache PWA via Serwist.
- Accessibilité : composants shadcn/UI adaptés, palette branding (bleu médical #4A90E2, bleu clair #5BA7F7, vert régénération #7ED321) testée pour le contraste, navigation clavier, messages localisés.
- Sécurité & conformité : hébergement EU (Vercel + Neon Frankfurt), secrets isolés, chiffrement TLS end-to-end, consentement explicite et traçable, absence de données médicales fines.

### Contraintes métier
- Rester sur un parcours unique patients/cliniciens : pas de back-office séparé, les rôles admin/soignant lèvent les restrictions d’abonnement.
- Priorité à la population Nantes MPR, pas d’ouverture multi-tenant à court terme.
- Maintenir consistence FR/EN (internationalisation, juridique, emails).
- Préserver l’expérience sombre pour limiter la fatigue, offrir ajustements de style depuis profil.

### Cas d'usage principaux
- **Onboarding patient** : visite landing → inscription/consentement → essai gratuit → sélection exercices conseillés → feedback immédiat.
- **Session quotidienne** : lancement PWA (session persistée) → consultation dashboard → 2–3 exercices (multi modalité) → mise à jour progression, badges potentiels.
- **Revue de progression** : consultation analytics (tendances 7/30/90 jours, détails par exercice, export planifié), partage avec clinicien.
- **Gestion d’abonnement** : redirection automatique si blocage, choix plan, Checkout Stripe, emails de rappel, annulation via portail.
- **Collaboration clinique** : clinicien invite patient, suit l’adhésion, échange des messages ciblés, signale pauses médicales (phase 2 badges).

## 3. Architecture technique
### Stack technologique
- **Frontend** : Next.js 15.5 (App Router) avec React 19 RSC, Tailwind CSS v4 design tokens (`app/globals.css`), shadcn/ui, next-themes + styles `data-style`, Zustand pour états clients isolés, Recharts pour visuels.
- **Backend** : Server Components + server actions pour logique métier (`app/actions/*`), API routes Next pour webhooks et Cron, Stripe SDK 19, Prisma ORM (`lib/prisma.ts`) avec PostgreSQL Neon.
- **Internationalisation & UX** : next-intl (`i18n/routing.ts`, `i18n/request.ts`), scripts anti-FOUC (`app/theme-style-script.tsx`), PWA Serwist (`app/sw.ts`, `next.config.ts`).
- **Tooling & DX** : Vitest (`vitest.config.ts`), Playwright (`playwright.config.ts`), ESLint 9, Storybook 9, Lighthouse CI, MCP connectors (Context7, Sentry, Playwright, Prisma, Vercel, Neon, Chrome DevTools).

### Infrastructure et hébergement
- Flux : Utilisateur → Cloudflare (DNS/WAF) → Vercel (app Next) → Prisma → Neon PostgreSQL (eu-central-1). Sentry instrumenté côté client/server. Serwist gère SW via `/sw.js`.
- Environnements : local (`npm run dev --turbopack`), Vercel preview, Vercel production `healthincloud.app`. Neon branches pour dev/test. Cron Vercel (daily 09:00 UTC) protégé par `CRON_SECRET`.
- Static assets & PWA : manifest `app/manifest.json`, service worker precache locales FR/EN, offline route `app/[locale]/offline`.

### Services et APIs utilisés
- Stripe Checkout + Billing Portal (abonnements, webhooks `app/api/webhooks/stripe/route.ts`).
- Resend + React Email pour notifications (essai, renouvellement, paiement échoué, vérification email).
- Better Auth (email/password + Google OAuth) avec Prisma adapter `lib/auth.ts`.
- Google OAuth (clients multi-domaines), Sentry (monitoring), Serwist (PWA), MCP connectors (automation), Sonner (toasts), UA Parser (détection device).

### Bases de données et stockage
- PostgreSQL (Neon) piloté via Prisma migrations (`prisma/schema.prisma`).
- **Modèles clés** : `User` (role, locale, thème, consentement, Stripe IDs), `Account`/`Session`/`Verification` (Better Auth), `ConsentHistory` (trace RGPD), `Subscription` (statut & périodes), `ExerciseAttempt`, `StreakData`, `UserBadge`, `BadgeShare`, `PatientProviderAssociation` & `ProviderPatientMessage` (lien soignant-patient), `BadgeShare` (partages), plus tables de support (invitation tokens, enums).
- Génération Prisma pré-build (`"build": "prisma generate && next build"`), seeds demo (`npm run db:seed`).

### Sécurité et authentification
- Sessions signées via Better Auth (`auth.api.getSession`), cookies sécurisés automatiques sur domaine `*.healthincloud.app`.
- Auth middleware (`middleware.ts`) protège routes `/dashboard`, `/neuro`, `/ortho`, `/profile`, `/admin`, `/healthcare`, redirige vers `/[locale]/auth/login`.
- Subscription guard (`lib/subscription-guard.ts`) assure redirection vers `/subscription?blocked=true`.
- Consentement double (client + serveur) pour données santé, stockage IP/User-Agent (`app/actions/grant-consent.ts`, `ConsentHistory`).
- Stripe webhook signature vérifiée, Cron endpoints protégés par `Authorization: Bearer`.
- Journaux et erreurs via `lib/logger.ts` → Sentry; suppression compte supprime données (User + ExerciseAttempt).

## 4. Workflow et processus
### Workflow de développement
- Branches depuis `main` nommées `feature/<slug>`, `fix/<slug>`, `hotfix/<issue>`.
- Conventional Commits exigés, commits petits et contextualisés.
- Avant PR : exécuter `npm run lint`, `npm run test:run`, Playwright concerné, audits a11y/perf si UI impactée, mettre à jour SPECS et la politique publique si comportement ou conformité changent.
- PR : titre en Conventional Commit, description avec contexte/tests/impacts, captures ou rapports Lighthouse si UI. Au moins un reviewer requis, répondre aux commentaires sans rebase agressif.

### Processus de déploiement (CI/CD)
- GitHub Actions (lint, type-check, tests, build) bloquent la fusion, coverage gate ≥ 50 % planifié.
- Merge vers `main` → déploiement Vercel prod automatisé, prévisualisations pour PR.
- Migrations en production via `npx prisma migrate deploy` (Neon). Rollback possible via `vercel promote <deployment>`.
- Monitoring post-merge : vérifier Sentry, Vercel logs, Cron, Stripe webhooks, emails Resend.

### Gestion des environnements
- `.env.example` centralise variables (Better Auth, Neon, Stripe, Resend, Sentry, Cron, App URL). `.env.local` pour dev, Vercel `env add` pour preview/prod.
- Secrets critiques : `BETTER_AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, OAuth clients Google/Apple.
- Neon branches recommandées pour tests isolés; seeds limités (`prisma/seed.ts`).
- Tests automatisés : `npm test` (Vitest watch), `npm run test:coverage`, `npm run test:e2e` (Playwright, baseURL `http://localhost:3000`).

### Processus de review et validation
- Relecture code + UX, validation des spec updates, vérification i18n.
- Tenir à jour les indicateurs de qualité (score global 9.2/10, couverture tests, perf, accessibilité) dans SPECS ou dans le résumé de PR.
- Après merge : résumer déploiement, fermer tickets, noter apprentissages éventuels.

### Commandes npm essentielles
- `npm run dev` : lance Next.js avec Turbopack en local.
- `npm run build` / `npm run start` : build de production (`prisma generate` + `next build`) puis démarrage.
- `npm run lint` : exécute ESLint.
- `npm test`, `npm run test:run`, `npm run test:coverage` : Vitest en mode watch, run unique, couverture (corriger la config ESM avant d’automatiser la couverture).
- `npm run test:e2e`, `npm run test:e2e:ui` : Playwright headless ou interface graphique.
- `npm run analyze` : build avec analyseur de bundle.
- `npm run storybook`, `npm run build-storybook` : Storybook local et build statique.
- `npm run lighthouse`, `npm run lighthouse:mobile` : audits Lighthouse desktop/mobile via LHCI.
- `npm run db:seed`, `npm run db:generate`, `npm run db:migrate`, `npm run db:deploy` : opérations Prisma (seed démo, génération client, migration locale, déploiement prod).

## 5. Règles de développement
### Conventions de nommage
- Branches `feature/`, `fix/`, `hotfix/`; commits `feat:`, `fix:`, `docs:` etc.
- Routes App Router : `app/[locale]/(site|auth|app)/*`, composants UI PascalCase, hooks `useX`.
- Alias `@/*` (cf. `tsconfig.json`), tests miroir sous `__tests__/` et `e2e/`.
- Traductions : clés `common.*`, `subscription.*` etc. dans `locales/{fr,en}`.

### Standards de code et linting
- TypeScript strict, `moduleResolution: bundler`, `noUnused*` activés.
- ESLint `eslint.config.mjs`, lint script `npm run lint`; Prettier (`npm run format`, `npm run format:check`) pour garder un style cohérent.
- Tailwind CSS v4 : tokens CSS dans `app/globals.css`, classes via `@import "tailwindcss"`, helper `cn()` (`lib/utils.ts`).
- shadcn/ui : composants stockés sous `components/ui`, respecter composition et variants.

### Bonnes pratiques à respecter
- Privilégier RSC pour lecture de données, client components uniquement pour interactivité (forms, charts).
- Centraliser la logique métier dans server actions (`app/actions/*`) ou helpers `lib/*`.
- Valider systématiquement via Zod (`lib/schemas`) avant écriture DB ou appels externes.
- Utiliser `next-intl` helpers (`getTranslations`, `useTranslations`) et conserver locale dans routes/links (`i18n/routing.ts`).
- Pour thèmes : manipuler `ThemeProvider` & scripts `theme-style-script`, stocker préférence (champ `theme`/`themeStyle` sur `User`).
- Lors d’ajout d’exercice : mettre à jour JSON `lib/data/exercises`, API route correspondante et tests.

### Patterns et architectures à utiliser
- **Server Actions** pour mutations (ex. `create-checkout-session`, `update-preferences`, `invite-patient`), retour structuré { success, data }.
- **Domain services** dans `lib/` (`lib/subscription.ts`, `lib/badges.ts`, `lib/stripe.ts`) pour réutilisation via actions/API.
- **Middleware** pour auth + locaux, couplé à endpoints internes (`app/api/internal/session`) afin d’éviter duplication.
- **PWA/Serwist** : configuration dans `next.config.ts` (`withSerwist`), `app/sw.ts` maintenu en TypeScript, `public/sw.js` généré.
- **Tests** : Vitest (unitaires/components) + Playwright (flows critiques auth/i18n/theme/subscription). Couvrir states (loading, error, success).

### Gestion des erreurs et logging
- Utiliser `logger` (`lib/logger.ts`) pour `debug/info/warn/error`, Sentry agrège en production.
- Webhooks Stripe wrapés dans try/catch, log erreurs précises, renvoient HTTP appropriés.
- Error boundaries Next (layout `error.tsx`), pages `not-found.tsx`, fallback offline.
- Emails et Cron : compter succès/erreurs (`results` dans `/api/cron/subscription-notifications`), surveiller via Vercel logs.
- Ne pas exposer messages sensibles côté client, préférer IDs d’incident si nécessaire.

## 6. Dépendances et intégrations
### Services tiers
- **Stripe** : checkout, customer portal, webhooks pour synchroniser `Subscription`, relances paiement.
- **Resend + React Email** : envoi d’emails (vérification, reset, abonnements, notifications), templates localisés.
- **Better Auth** : authentication core (sessions, SSO Google, reset, email verification).
- **Sentry** : monitoring erreurs/perfs (config `instrumentation.ts`, DSN env).
- **Vercel** : hosting, Cron, environment secrets, Analytics.
- **Neon** : PostgreSQL managé, PITR, branches preview.
- **Context7 / MCP** : doc lookup, automation (Stripe CLI virtuel, Vercel logs, Playwright actions).

### APIs externes
- Stripe REST (Checkout Sessions, Subscriptions, Invoices, Webhooks) via SDK `stripe` 19.
- Google OAuth endpoints selon redirect URIs (`/api/auth/callback/google`).
- Resend HTTP API (emails).
- Serwist/Workbox pour SW build.

### Packages et modules critiques
- `better-auth`, `@stripe/stripe-js`, `stripe`, `resend`, `@react-email/*`, `next-intl`, `next-themes`, `zustand`, `recharts`, `sonner`, `zod`, `@hookform/resolvers`, `react-hook-form`.
- Tooling : `vitest`, `@playwright/test`, `@sentry/nextjs`, `@serwist/next`, `lighthouse`, `storybook`, `@tailwindcss/postcss`.
- Librairies internes : `lib/subscription.ts` (statuts), `lib/badges.ts` (streaks & volumes), `lib/locale-utils.ts` (routing), `lib/security/*` (protections).

## 7. Points d'attention et contraintes
### Limitations techniques
- PWA offline limité aux pages préalablement visitées, contenus dynamiques nécessitent réseau; background sync et push non encore déployés.
- Stripe API version `2025-09-30.clover` : surveiller breaking changes, rotation de clés obligatoire avant prod.
- Cron unique (notifications abonnement) : prévoir surveillance; absence d’alerting natif.
- Storybook présent mais non intégré au pipeline; rester vigilant sur dérive visuelle non testée.

### Dettes techniques identifiées
- Politique RGPD incomplète : définir base légale (consentement vs intérêt légitime), consigner DPAs (Stripe, Resend, Sentry) et runbook PITR.
- Export PDF progression et analytics avancées encore à planifier (roadmap Next horizon).
- Badges Phase 2 (notifications avancées, partages sociaux enrichis, pauses médicales, limite anti-gaming, A/B testing) : garder la synthèse et prioriser leur planification détaillée.
- Theme manager : formaliser un plan d’implémentation complet pour la gestion multi-styles (jour/nuit + styles `data-style`), aligné avec `app/globals.css`.
- Analytics produit (Plausible/Vercel) prévus mais non actifs : viser un score ≥ 8/10 sur le scoreboard qualité.

### Points de vigilance
- Synchroniser `Subscription` Prisma et Stripe : surveiller webhooks (codes 200) et statut `INCOMPLETE_EXPIRED`.
- Mise à jour de `.env.example` et Vercel env à chaque ajout de secret (CRON, OAuth, Sentry, Stripe).
- Respecter translittération FR/EN pour toutes nouvelles chaînes (pages, emails, badges).
- Maintenir scoreboard qualité (score 9.2/10) avec preuves lors de PR impactant tests/perf.
- Vérifier que les rôles `ADMIN` / `HEALTHCARE_PROVIDER` sont correctement attribués lors d’onboarding (exemptions d’abonnement).

## Points à clarifier
- **Couverture de tests** : `CLAUDE.md` évoque une couverture ~20 % alors que les rapports récents listent 100 tests et un score 9/10. Confirmer la métrique actuelle et l’indiquer dans SPECS.
- **Données et sous-traitants** : s’assurer que la politique de confidentialité et la section 6 reflètent bien Stripe, Resend, Sentry, Vercel et Neon (plus toute évolution).
- **Références croisées** : vérifier qu’aucun lien historique (ex : `specs/TECHNICAL_SPECIFICATIONS.md`) ne subsiste dans la base de code ou la documentation générée.
- **Roadmap PWA** : `PWA_GUIDE.md` annonce background sync et push notifications Q1 2026. Vérifier priorisation vs backlog actuel pour éviter divergence de communication.
