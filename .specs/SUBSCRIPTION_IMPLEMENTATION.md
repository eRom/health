# Système d'Abonnement - Documentation Technique

## Vue d'Ensemble

Système d'abonnement complet intégrant Stripe pour la gestion des paiements, avec essai gratuit de 14 jours, notifications automatiques par email, et conformité RGPD.

**Implémenté:** Janvier 2025
**Version:** 1.0.0
**Statut:** ✅ Prêt pour production

---

## Architecture

### Stack Technique

- **Paiements:** Stripe Checkout + Customer Portal
- **Base de données:** PostgreSQL (Neon) via Prisma
- **Emails:** Resend + React Email
- **Cron Jobs:** Vercel Cron
- **Testing:** Playwright (E2E) + Vitest (Unit)
- **Frontend:** Next.js 15 (App Router) + shadcn/ui

### Flow Utilisateur

```
1. Utilisateur crée un compte → Essai gratuit 14 jours actif
2. Après 11 jours → Email de rappel (3 jours restants)
3. Fin de l'essai → Stripe facture automatiquement (19€/mois ou 180€/an)
4. 7 jours avant renouvellement → Email de rappel
5. Paiement réussi → Email de confirmation + accès maintenu
6. Paiement échoué → Email d'alerte + période de grâce 7 jours
```

---

## Structure du Code

### Base de Données

**Modèle Prisma:** `prisma/schema.prisma`

```prisma
model User {
  stripeCustomerId String?       @unique
  subscription     Subscription?
}

model Subscription {
  id                    String             @id @default(cuid())
  userId                String             @unique
  user                  User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  stripeSubscriptionId  String             @unique
  stripeCustomerId      String
  stripePriceId         String
  stripeProductId       String

  status                SubscriptionStatus
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  trialStart            DateTime?
  trialEnd              DateTime?
  cancelAtPeriodEnd     Boolean            @default(false)
  canceledAt            DateTime?

  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  @@index([userId])
  @@index([stripeCustomerId])
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  CANCELED
  INCOMPLETE
  INCOMPLETE_EXPIRED
  PAST_DUE
  UNPAID
}
```

**Migrations:**
- `20250115000000_add_subscription_model` - Création du modèle

### API Routes

#### 1. Checkout Session
**Fichier:** `app/api/subscription/create-checkout/route.ts`

```typescript
POST /api/subscription/create-checkout
Body: { priceId: 'price_...' }
Response: { url: 'https://checkout.stripe.com/...' }
```

**Fonctionnalité:**
- Crée une session Stripe Checkout
- Ajoute `userId` dans les métadonnées
- Configure l'essai gratuit (14 jours)
- URLs de succès/annulation

#### 2. Customer Portal
**Fichier:** `app/api/subscription/create-portal/route.ts`

```typescript
POST /api/subscription/create-portal
Response: { url: 'https://billing.stripe.com/...' }
```

**Fonctionnalité:**
- Crée une session du portail client Stripe
- Permet à l'utilisateur de gérer son abonnement
- Annulation, changement de plan, mise à jour paiement

#### 3. Subscription Status
**Fichier:** `app/api/subscription/status/route.ts`

```typescript
GET /api/subscription/status
Response: {
  status: 'ACTIVE',
  stripePriceId: 'price_...',
  currentPeriodEnd: '2025-02-15',
  cancelAtPeriodEnd: false
}
```

**Fonctionnalité:**
- Récupère le statut de l'abonnement de l'utilisateur
- Utilisé par le frontend pour l'affichage

#### 4. Webhooks Stripe
**Fichier:** `app/api/webhooks/stripe/route.ts`

```typescript
POST /api/webhooks/stripe
Headers: { stripe-signature: '...' }
Body: Stripe Event
```

**Événements gérés:**
- `checkout.session.completed` → Crée l'abonnement initial
- `customer.subscription.created/updated` → Synchronise les changements
- `customer.subscription.deleted` → Marque comme annulé
- `invoice.payment_succeeded` → Restaure l'accès si PAST_DUE
- `invoice.payment_failed` → Envoie email + période de grâce

#### 5. Cron Job
**Fichier:** `app/api/cron/subscription-notifications/route.ts`

```typescript
GET /api/cron/subscription-notifications
Headers: { authorization: 'Bearer cron_secret' }
Response: {
  trialEndingReminders: 5,
  trialEndedNotifications: 2,
  renewalReminders: 15,
  errors: []
}
```

**Schedule:** Tous les jours à 9h00 UTC (via `vercel.json`)

**Notifications envoyées:**
1. Rappel fin d'essai (3 jours avant)
2. Notification essai terminé (jour J)
3. Rappel renouvellement (7 jours avant)

### Server Actions

**Fichier:** `app/actions/get-subscription-status.ts`

```typescript
export async function getSubscriptionStatus()
```

Récupère le statut d'abonnement de l'utilisateur connecté.

### Helpers & Utils

**Fichier:** `lib/subscription.ts`

```typescript
// Vérifie si l'utilisateur a un accès actif
export async function hasActiveSubscription(userId: string): Promise<boolean>

// Retourne les jours restants dans l'essai
export async function getDaysUntilTrialEnd(userId: string): Promise<number | null>

// Vérifie si en période de grâce après échec paiement
export async function isInGracePeriod(userId: string): Promise<boolean>
```

**Logique d'accès actif:**
- ✅ Statut `TRIALING` (essai en cours)
- ✅ Statut `ACTIVE` (abonnement payant)
- ✅ Statut `PAST_DUE` ET < 7 jours après `currentPeriodEnd`
- ❌ Tous les autres statuts

### Middleware de Protection

**Fichier:** `middleware.ts`

```typescript
// Routes protégées nécessitant un abonnement actif
const protectedRoutes = [
  '/dashboard',
  '/neuro',
  '/ortho',
  '/ergo',
  '/kine',
  '/analyse',
]

// Vérifie l'abonnement et redirige si nécessaire
if (!hasSubscription) {
  return NextResponse.redirect('/subscription?blocked=true')
}
```

---

## Composants UI

### 1. PricingTable
**Fichier:** `components/subscription/pricing-table.tsx`

Affiche les deux plans tarifaires (mensuel/annuel) avec:
- Prix et période de facturation
- Liste des fonctionnalités incluses
- Badge "14 jours d'essai gratuit"
- Bouton CTA pour démarrer l'essai

**Props:**
```typescript
interface PricingTableProps {
  isAuthenticated: boolean // Adapte le CTA selon l'état de connexion
}
```

### 2. SubscriptionCard
**Fichier:** `components/subscription/subscription-card.tsx`

Affiche le statut actuel de l'abonnement:
- Badge de statut (Actif, Essai, Annulé, etc.)
- Dates importantes (fin de période, fin d'essai)
- Bouton "Gérer l'abonnement" (ouvre Stripe Portal)
- Alertes pour paiements échoués

**Props:**
```typescript
interface SubscriptionCardProps {
  subscription: {
    status: SubscriptionStatus
    stripePriceId: string
    currentPeriodEnd: Date
    trialEnd?: Date
    cancelAtPeriodEnd: boolean
  } | null
}
```

### 3. Success Page
**Fichier:** `app/[locale]/(app)/subscription/success/page.tsx`

Page de confirmation après checkout réussi:
- Message de félicitations
- Rappel de l'essai gratuit
- Lien vers le dashboard
- CTA pour commencer à utiliser l'app

---

## Système d'Emails

### Templates React Email

**Dossier:** `emails/`

Tous les templates utilisent:
- `@react-email/components` pour le rendu
- Support bilingue (FR/EN)
- Design responsive
- Boutons CTA clairs

#### 1. Trial Ending Email
**Fichier:** `emails/trial-ending.tsx`

```typescript
interface TrialEndingEmailProps {
  userName: string
  daysLeft: number
  manageSubscriptionUrl: string
  locale: 'fr' | 'en'
}
```

**Envoyé:** 3 jours avant la fin de l'essai
**Sujet:** "Votre essai gratuit se termine dans 3 jours"

#### 2. Trial Ended Email
**Fichier:** `emails/trial-ended.tsx`

```typescript
interface TrialEndedEmailProps {
  userName: string
  subscriptionUrl: string
  locale: 'fr' | 'en'
}
```

**Envoyé:** Quand l'essai se termine sans abonnement
**Sujet:** "Votre essai gratuit est terminé"

#### 3. Renewal Reminder Email
**Fichier:** `emails/renewal-reminder.tsx`

```typescript
interface RenewalReminderEmailProps {
  userName: string
  renewalDate: string
  amount: string
  plan: 'monthly' | 'yearly'
  manageSubscriptionUrl: string
  locale: 'fr' | 'en'
}
```

**Envoyé:** 7 jours avant le renouvellement
**Sujet:** "Rappel : Votre abonnement sera renouvelé prochainement"

#### 4. Payment Failed Email
**Fichier:** `emails/payment-failed.tsx`

```typescript
interface PaymentFailedEmailProps {
  userName: string
  amount: string
  reason?: string
  updatePaymentUrl: string
  gracePeriodEnd: string
  locale: 'fr' | 'en'
}
```

**Envoyé:** Immédiatement après échec de paiement
**Sujet:** "Action requise : Échec du paiement"

### Email Service

**Fichier:** `lib/email.ts`

```typescript
// Service d'envoi utilisant Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Fonctions d'envoi pour chaque type
export async function sendTrialEndingEmail(params)
export async function sendTrialEndedEmail(params)
export async function sendRenewalReminderEmail(params)
export async function sendPaymentFailedEmail(params)
```

---

## Tests

### Tests E2E (Playwright)

**Fichier:** `e2e/subscription.spec.ts`

**Couverture:**
- ✅ Affichage des plans tarifaires (utilisateur non connecté)
- ✅ Redirection vers login lors du clic sur "S'abonner"
- ✅ Affichage de l'alerte "abonnement requis"
- ✅ Statut d'abonnement dans le profil
- ✅ Redirection vers Stripe Checkout
- ✅ Accès dashboard avec abonnement actif
- ✅ Gestion de l'abonnement (portal)
- ✅ Statut pendant la période d'essai
- ✅ Blocage avec abonnement expiré
- ✅ Alerte paiement échoué
- ✅ Support bilingue FR/EN
- ✅ Page de succès après checkout

**Exécution:**
```bash
npm run test:e2e -- subscription.spec.ts
```

### Tests Unitaires (Vitest)

**Fichier:** `__tests__/lib/subscription.test.ts`

**Couverture:**
- ✅ `hasActiveSubscription()` pour tous les statuts
  - TRIALING → true
  - ACTIVE → true
  - PAST_DUE (< 7j) → true
  - PAST_DUE (> 7j) → false
  - CANCELED → false
  - INCOMPLETE → false
  - UNPAID → false

- ✅ `getDaysUntilTrialEnd()` edge cases
  - Pas d'abonnement → null
  - Pas en essai → null
  - Essai actif → nombre de jours
  - Essai terminé → 0

- ✅ `isInGracePeriod()` calculs de dates
  - PAST_DUE < 7j → true
  - PAST_DUE > 7j → false
  - Autres statuts → false

- ✅ Scénarios d'intégration
  - Transition essai → actif
  - Échec de paiement → période de grâce
  - Checkout incomplet → expiration

**Exécution:**
```bash
npm test -- subscription
```

**Coverage actuel:** 100% sur `lib/subscription.ts`

---

## Traductions (i18n)

### Structure

**Fichiers:**
- `locales/fr/common.json` - Français
- `locales/en/common.json` - Anglais

### Namespaces

#### `subscription`
- `meta.title`, `meta.description` - SEO
- `page.*` - Page principale d'abonnement
- `pricing.*` - Table de prix
- `card.*` - Carte de statut
- `status.*` - Labels de statuts
- `trial.*` - Informations essai gratuit
- `success.*` - Page de succès

#### `pagePrivacy` (RGPD)
- `paymentProcessing.*` - Section Stripe (Article 28)
- `subscriptionTerms.*` - Conditions d'abonnement

### Exemple
```json
{
  "subscription": {
    "pricing": {
      "monthly": {
        "name": "Mensuel",
        "price": "19€",
        "period": "par mois"
      }
    }
  }
}
```

---

## Conformité RGPD

### Documentation Stripe

**Fichier:** `locales/{fr,en}/common.json` → `pagePrivacy.paymentProcessing`

**Contenu:**
- ✅ Stripe Inc. identifié comme sous-traitant (Article 28 RGPD)
- ✅ Certification PCI DSS Level 1 mentionnée
- ✅ Données traitées par Stripe listées
- ✅ Localisation des données (UE - Irlande)
- ✅ Lien vers politique de confidentialité Stripe
- ✅ DPA (Data Processing Agreement) mentionné

### Conditions d'Abonnement

**Fichier:** `locales/{fr,en}/common.json` → `pagePrivacy.subscriptionTerms`

**Contenu:**
- ✅ Essai gratuit (14 jours)
- ✅ Facturation automatique après essai
- ✅ Montants (19€/mois, 180€/an)
- ✅ Notification 7 jours avant renouvellement
- ✅ Politique d'annulation
- ✅ Droit de rétractation français (14 jours)
- ✅ Conservation des données (10 ans - obligations comptables)

### Pages Légales

Les pages suivantes ont été mises à jour:
- `/[locale]/privacy` - Politique de confidentialité
- `/[locale]/legal` - Mentions légales
- `/[locale]/gdpr` - Page RGPD

---

## Variables d'Environnement

### Requises

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...                    # Clé API secrète
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...        # Clé API publique
STRIPE_WEBHOOK_SECRET=whsec_...                  # Secret webhook
STRIPE_PRICE_MONTHLY=price_...                   # ID prix mensuel
STRIPE_PRICE_YEARLY=price_...                    # ID prix annuel

# Cron Job
CRON_SECRET=random_secure_string                 # Secret pour sécuriser le cron

# Email (Resend)
RESEND_API_KEY=re_...                            # Clé API Resend
RESEND_FROM_EMAIL=noreply@healthincloud.app      # Email expéditeur

# Application
NEXT_PUBLIC_APP_URL=https://healthincloud.app    # URL de l'app
```

### Développement vs Production

**Développement:**
- Utiliser les clés de test Stripe (`sk_test_`, `pk_test_`)
- Tester avec Stripe CLI pour les webhooks
- Emails envoyés en mode test Resend

**Production:**
- Utiliser les clés live Stripe (`sk_live_`, `pk_live_`)
- Configurer le webhook dans Stripe Dashboard
- Emails envoyés en mode production Resend

---

## Monitoring et Observabilité

### Métriques Stripe

- Nombre d'abonnements actifs
- Taux de conversion (trial → paid)
- MRR (Monthly Recurring Revenue)
- Churn rate
- Paiements échoués

### Métriques Techniques

- Taux de succès des webhooks (objectif: > 99%)
- Temps de réponse API (objectif: < 2s)
- Taux d'envoi des emails (objectif: > 95%)
- Succès du cron job quotidien (objectif: 100%)

### Logs

**Vercel:**
```bash
vercel logs --follow
vercel logs --follow --scope=api/webhooks/stripe
```

**Sentry:**
- Erreurs webhooks
- Erreurs cron job
- Erreurs de paiement
- Erreurs d'envoi d'email

### Alertes

Configurer des alertes pour:
- ❌ Webhook échoue 3+ fois consécutives
- ❌ Cron job échoue
- ❌ Taux d'erreur email > 5%
- ❌ Spike de paiements échoués

---

## Sécurité

### Protection des Endpoints

1. **Webhooks:** Vérification de signature Stripe
   ```typescript
   stripe.webhooks.constructEvent(body, signature, webhookSecret)
   ```

2. **Cron Job:** Authentification Bearer token
   ```typescript
   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     return 401
   }
   ```

3. **API Routes:** Vérification de session utilisateur
   ```typescript
   const session = await auth.api.getSession()
   if (!session?.user) return 401
   ```

### Données Sensibles

- ❌ **Jamais stocké:** Numéros de carte bancaire (tokenisés par Stripe)
- ✅ **Stocké chiffré:** Stripe Customer ID, Subscription ID
- ✅ **Accès restreint:** Seul l'utilisateur peut voir son abonnement

### Conformité PCI DSS

- Utilisation de Stripe Checkout (SAQ A - simplification PCI)
- Aucune donnée de carte ne transite par nos serveurs
- Stripe est certifié PCI DSS Level 1

---

## Performances

### Optimisations

1. **Lazy Loading:** Composants Stripe chargés à la demande
2. **Server Components:** Pricing table rendue côté serveur
3. **Caching:** Statuts d'abonnement cachés (revalidation 60s)
4. **Indexes DB:** Sur `userId` et `stripeCustomerId`

### Métriques Cibles

- **LCP:** < 2.5s (chargement page subscription)
- **FID:** < 100ms (interactivité boutons)
- **CLS:** < 0.1 (stabilité layout)
- **API Response Time:** < 500ms (endpoints subscription)

---

## Maintenance

### Tâches Quotidiennes

- ✅ Vérifier le succès du cron job (logs Vercel)
- ✅ Vérifier les erreurs Sentry
- ✅ Surveiller les webhooks échoués (Stripe Dashboard)

### Tâches Hebdomadaires

- ✅ Analyser les métriques de conversion
- ✅ Vérifier les paiements échoués non résolus
- ✅ Revoir les retours utilisateurs

### Tâches Mensuelles

- ✅ Vérifier la cohérence DB ↔ Stripe
- ✅ Analyser le churn et identifier les causes
- ✅ Optimiser les emails selon les taux d'ouverture
- ✅ Revoir les prix et les conversions

---

## Roadmap Future

### Court Terme (Q1 2025)

- [ ] Ajouter support pour les coupons/codes promo
- [ ] Implémenter un essai étendu (30 jours) pour certains utilisateurs
- [ ] Ajouter des webhooks pour les disputes (chargebacks)
- [ ] Dashboard analytics abonnements (admin)

### Moyen Terme (Q2 2025)

- [ ] Support multi-devises (EUR, USD, GBP)
- [ ] Abonnement familial (5 utilisateurs)
- [ ] Programme de parrainage
- [ ] Intégration avec outil de facturation (factures PDF)

### Long Terme (Q3+ 2025)

- [ ] Abonnement à vie (one-time payment)
- [ ] Abonnement entreprise avec facturation manuelle
- [ ] API pour les partenaires
- [ ] Analytics avancées pour les cliniciens

---

## Ressources

### Documentation Externe

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [React Email](https://react.email/docs)
- [Resend](https://resend.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

### Documentation Interne

- [Guide d'Administration](./.specs/SUBSCRIPTION_ADMIN_GUIDE.md)
- [Checklist de Déploiement](./.specs/DEPLOYMENT_CHECKLIST.md)
- [Plan d'Implémentation](./.specs/BUSINESS_MODEL_PLAN.md)
- [Scorecard Qualité](./.specs/SCORECARD.md)

---

## Changelog

| Date       | Version | Changements                                     |
|------------|---------|------------------------------------------------|
| 2025-01-15 | 1.0.0   | Implémentation complète (Phases 1-8)           |
| 2025-01-15 | 1.0.0   | Tests E2E et unitaires ajoutés                 |
| 2025-01-15 | 1.0.0   | Documentation complète                         |

---

**Maintenu par:** Équipe technique Health In Cloud
**Dernière mise à jour:** 15 janvier 2025
**Statut:** ✅ Prêt pour production
