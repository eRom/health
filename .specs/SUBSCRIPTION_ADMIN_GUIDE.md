# Guide d'Administration des Abonnements

Guide complet pour la gestion, le monitoring et le débogage du système d'abonnements de Health In Cloud.

## Table des matières

1. [Configuration Stripe](#configuration-stripe)
2. [Gestion des Webhooks](#gestion-des-webhooks)
3. [Monitoring des Cron Jobs](#monitoring-des-cron-jobs)
4. [Gestion des Abonnements](#gestion-des-abonnements)
5. [Tests et Débogage](#tests-et-débogage)
6. [Résolution des Problèmes](#résolution-des-problèmes)

---

## Configuration Stripe

### Variables d'Environnement Requises

```bash
# Clés API Stripe
STRIPE_SECRET_KEY=sk_test_...        # Clé secrète Stripe (test ou production)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...  # Clé publique Stripe

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_...       # Secret du webhook Stripe

# IDs des produits et prix
STRIPE_PRICE_MONTHLY=price_...        # ID du prix mensuel (19€)
STRIPE_PRICE_YEARLY=price_...         # ID du prix annuel (180€)

# Sécurité cron
CRON_SECRET=random_secure_string      # Secret pour protéger les endpoints cron

# Email
RESEND_API_KEY=re_...                 # Clé API Resend pour l'envoi d'emails
RESEND_FROM_EMAIL=noreply@healthincloud.app

# URL de l'application
NEXT_PUBLIC_APP_URL=https://healthincloud.app
```

### Configuration dans le Dashboard Stripe

#### 1. Créer les Produits et Prix

```bash
# Produit
Nom: Health In Cloud Premium
Description: Accès complet aux exercices de rééducation
```

**Prix Mensuel:**
- Montant: 19€
- Récurrence: Mensuelle
- Essai gratuit: 14 jours
- ID: Copier dans `STRIPE_PRICE_MONTHLY`

**Prix Annuel:**
- Montant: 180€
- Récurrence: Annuelle
- Essai gratuit: 14 jours
- ID: Copier dans `STRIPE_PRICE_YEARLY`

#### 2. Configurer les Webhooks

Dans le Dashboard Stripe, aller dans **Développeurs → Webhooks** et créer un endpoint:

**URL de production:**
```
https://healthincloud.app/api/webhooks/stripe
```

**URL de développement (avec Stripe CLI):**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Événements à écouter:**
- `checkout.session.completed` - Quand un utilisateur finalise le checkout
- `customer.subscription.created` - Création d'un nouvel abonnement
- `customer.subscription.updated` - Modification d'un abonnement
- `customer.subscription.deleted` - Annulation d'un abonnement
- `invoice.payment_succeeded` - Paiement réussi
- `invoice.payment_failed` - Échec de paiement

**Récupérer le secret du webhook:**
Une fois l'endpoint créé, copier le `Signing secret` dans `STRIPE_WEBHOOK_SECRET`.

---

## Gestion des Webhooks

### Architecture des Webhooks

Fichier: `app/api/webhooks/stripe/route.ts`

Les webhooks Stripe sont le mécanisme principal pour synchroniser les statuts d'abonnement entre Stripe et notre base de données.

### Flow des Webhooks

```
Stripe Event → Vérification Signature → Handler Spécifique → Update DB → Email Notification
```

### Handlers Implémentés

#### 1. `checkout.session.completed`

**Quand:** L'utilisateur finalise le checkout Stripe

**Actions:**
- Récupère le `userId` depuis les métadonnées de la session
- Enregistre le `stripeCustomerId` dans le profil utilisateur
- Récupère les détails complets de l'abonnement
- Appelle `handleSubscriptionUpdate` pour créer l'abonnement en DB

**Code clé:**
```typescript
const userId = session.metadata?.userId
const subscriptionId = session.subscription as string
const customerId = session.customer as string

await prisma.user.update({
  where: { id: userId },
  data: { stripeCustomerId: customerId },
})
```

#### 2. `customer.subscription.created` & `customer.subscription.updated`

**Quand:** Un abonnement est créé ou modifié

**Actions:**
- Trouve l'utilisateur via `stripeCustomerId`
- Upsert de l'abonnement dans la DB
- Synchronise tous les champs: status, dates, trial, cancellation

**États possibles:**
- `TRIALING` - Période d'essai active
- `ACTIVE` - Abonnement payant actif
- `PAST_DUE` - Paiement échoué, période de grâce (7 jours)
- `CANCELED` - Abonnement annulé
- `INCOMPLETE` - Checkout commencé mais non finalisé
- `INCOMPLETE_EXPIRED` - Checkout expiré (après 23h)
- `UNPAID` - Impayé après période de grâce

#### 3. `customer.subscription.deleted`

**Quand:** L'abonnement est définitivement supprimé

**Actions:**
- Met à jour le statut à `CANCELED`
- Enregistre `canceledAt` timestamp

#### 4. `invoice.payment_succeeded`

**Quand:** Un paiement de renouvellement réussit

**Actions:**
- Met à jour les abonnements `PAST_DUE` ou `UNPAID` vers `ACTIVE`
- Restaure l'accès complet

#### 5. `invoice.payment_failed`

**Quand:** Un paiement de renouvellement échoue

**Actions:**
- Met à jour le statut vers `PAST_DUE`
- Calcule la date de fin de la période de grâce (+ 7 jours)
- Envoie un email d'alerte avec:
  - Montant dû
  - Raison de l'échec
  - Date limite de la période de grâce
  - Lien pour mettre à jour le moyen de paiement

### Tester les Webhooks en Développement

#### Option 1: Stripe CLI (Recommandé)

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Dans un autre terminal, déclencher des événements de test
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

#### Option 2: Webhook Fixtures

Créer des fixtures pour tester localement:

```typescript
// scripts/test-webhook.ts
const event = {
  type: 'invoice.payment_failed',
  data: {
    object: {
      id: 'in_test_123',
      customer: 'cus_test_123',
      amount_due: 1900,
      currency: 'eur',
      last_finalization_error: {
        message: 'Your card was declined',
      },
    },
  },
}

// Envoyer vers l'endpoint local
fetch('http://localhost:3000/api/webhooks/stripe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': 'test_signature',
  },
  body: JSON.stringify(event),
})
```

### Monitoring des Webhooks

#### Dashboard Stripe

Aller dans **Développeurs → Webhooks → [Votre endpoint]** pour voir:
- Événements reçus
- Statut de réponse (200 = succès)
- Tentatives de retry
- Logs des erreurs

#### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Filtrer par fonction
vercel logs --follow --scope=api/webhooks/stripe
```

#### Logs Sentry

Les erreurs dans les webhooks sont automatiquement capturées par Sentry avec:
- Type d'événement
- Données de l'événement
- Stack trace
- User context

### Débogage des Webhooks

#### Vérifier la Signature

Si vous recevez `Invalid signature`:

1. **Vérifier le secret:** `STRIPE_WEBHOOK_SECRET` doit correspondre au secret du dashboard
2. **Vérifier la version:** Le webhook doit utiliser la même API version que notre code
3. **Tester en local:** Utiliser Stripe CLI qui gère automatiquement les signatures

#### Webhook Non Reçu

1. **Vérifier l'URL:** L'endpoint doit être accessible publiquement
2. **Vérifier les événements:** Dans le dashboard, voir si Stripe a tenté d'envoyer
3. **Vérifier les filtres:** S'assurer que les événements sont cochés dans la config
4. **Retry manuel:** Dans le dashboard, cliquer sur "Resend" pour un événement spécifique

#### Base de Données Non Mise à Jour

1. **Vérifier les logs:** Chercher les erreurs dans Vercel/Sentry
2. **Vérifier le mapping:** Customer ID doit correspondre dans User et Subscription
3. **Vérifier les types:** S'assurer que les types Stripe correspondent aux enums Prisma

---

## Monitoring des Cron Jobs

### Configuration Vercel Cron

Fichier: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule:** Tous les jours à 9h00 UTC (10h00 Paris en hiver, 11h00 en été)

### Notifications Envoyées

Le cron job envoie 3 types de notifications:

#### 1. Rappel de Fin d'Essai (3 jours avant)

**Critères:**
- Statut: `TRIALING`
- `trialEnd` entre aujourd'hui + 3 jours (00:00) et aujourd'hui + 3 jours (23:59)

**Email envoyé:**
- Sujet: "Votre essai gratuit se termine dans 3 jours"
- Contenu: Rappel que l'abonnement sera facturé après l'essai
- CTA: Lien vers la gestion de l'abonnement

#### 2. Notification d'Essai Terminé

**Critères:**
- Statut: `INCOMPLETE_EXPIRED`
- `trialEnd` = aujourd'hui

**Email envoyé:**
- Sujet: "Votre essai gratuit est terminé"
- Contenu: L'essai est terminé, invitation à s'abonner
- CTA: Lien vers la page d'abonnement

#### 3. Rappel de Renouvellement (7 jours avant)

**Critères:**
- Statut: `ACTIVE`
- `cancelAtPeriodEnd` = false
- `currentPeriodEnd` entre aujourd'hui + 7 jours (00:00) et aujourd'hui + 7 jours (23:59)

**Email envoyé:**
- Sujet: "Rappel : Votre abonnement sera renouvelé prochainement"
- Contenu: Détails du montant (19€ ou 180€) et date de prélèvement
- CTA: Lien vers la gestion de l'abonnement

### Code du Cron Job

Fichier: `app/api/cron/subscription-notifications/route.ts`

**Sécurité:**
```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Structure de réponse:**
```json
{
  "success": true,
  "trialEndingReminders": 5,
  "trialEndedNotifications": 2,
  "renewalReminders": 15,
  "errors": []
}
```

### Tester le Cron Job Localement

#### Option 1: Appel Direct

```bash
# Avec curl
curl -X GET http://localhost:3000/api/cron/subscription-notifications \
  -H "Authorization: Bearer your_cron_secret"

# Avec HTTPie
http GET localhost:3000/api/cron/subscription-notifications \
  Authorization:"Bearer your_cron_secret"
```

#### Option 2: Script de Test

```typescript
// scripts/test-cron.ts
async function testCron() {
  const response = await fetch('http://localhost:3000/api/cron/subscription-notifications', {
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  })

  const result = await response.json()
  console.log('Cron job result:', result)
}

testCron()
```

#### Option 3: Données de Test

Créer des abonnements de test avec des dates spécifiques:

```sql
-- Essai se terminant dans 3 jours
UPDATE "Subscription"
SET
  status = 'TRIALING',
  "trialEnd" = NOW() + INTERVAL '3 days'
WHERE "userId" = 'test-user-1';

-- Abonnement se renouvelant dans 7 jours
UPDATE "Subscription"
SET
  status = 'ACTIVE',
  "currentPeriodEnd" = NOW() + INTERVAL '7 days',
  "cancelAtPeriodEnd" = false
WHERE "userId" = 'test-user-2';
```

### Monitoring en Production

#### Vercel Cron Logs

Dashboard Vercel → Projet → Cron Jobs:
- Voir l'historique d'exécution
- Statut (success/failure)
- Durée d'exécution
- Logs de sortie

#### Logs via CLI

```bash
# Voir tous les logs
vercel logs --since 24h

# Filtrer par fonction cron
vercel logs --since 24h | grep subscription-notifications
```

#### Alertes

Configurer des alertes Vercel/Sentry pour:
- Échecs consécutifs du cron (3+)
- Taux d'erreur élevé (> 10%)
- Durée d'exécution anormale (> 30s)

#### Métriques à Surveiller

```typescript
// Ajouter à votre tableau de bord
{
  trialEndingReminders: number,      // Doit être ~0-5 par jour
  trialEndedNotifications: number,   // Doit être ~0-3 par jour
  renewalReminders: number,          // Doit varier selon la base
  errors: string[],                  // Doit être vide
  executionTime: number              // Doit être < 10s
}
```

### Débogage du Cron Job

#### Erreur 401 Unauthorized

- Vérifier que `CRON_SECRET` est défini dans Vercel
- S'assurer que la variable est la même en local et en production

#### Emails Non Envoyés

1. **Vérifier Resend:**
   - Dashboard Resend → Logs
   - Quota d'envoi non dépassé
   - Domaine vérifié

2. **Vérifier les données:**
   ```sql
   -- Abonnements éligibles pour rappel d'essai
   SELECT * FROM "Subscription"
   WHERE status = 'TRIALING'
   AND "trialEnd" BETWEEN NOW() + INTERVAL '3 days' AND NOW() + INTERVAL '4 days';
   ```

3. **Vérifier les logs:**
   - Chercher les erreurs dans les logs du cron
   - Vérifier le tableau `errors` dans la réponse

#### Notifications Dupliquées

- Le cron utilise des plages horaires strictes pour éviter les doublons
- Si un abonnement reçoit 2 notifications, vérifier que le cron ne s'exécute pas 2 fois

---

## Gestion des Abonnements

### Via Dashboard Stripe

#### Voir les Abonnements

Dashboard Stripe → Abonnements:
- Liste tous les abonnements
- Filtre par statut, client, produit
- Recherche par email ou ID

#### Annuler un Abonnement

1. Ouvrir l'abonnement
2. Cliquer "Cancel subscription"
3. Choisir:
   - **Cancel immediately**: Annulation immédiate (accès perdu)
   - **Cancel at period end**: Annulation à la fin de la période (accès maintenu)

**Effet dans notre app:**
- Le webhook `customer.subscription.updated` met à jour `cancelAtPeriodEnd`
- À la fin de période: webhook `customer.subscription.deleted` change le statut à `CANCELED`

#### Modifier un Abonnement

1. Ouvrir l'abonnement
2. Cliquer "Update subscription"
3. Changer le prix (monthly ↔ yearly)
4. Choisir la proration:
   - **Prorate**: Calculer le prorata
   - **No prorate**: Changement à la prochaine période

#### Rembourser un Paiement

1. Dashboard Stripe → Paiements
2. Sélectionner le paiement
3. Cliquer "Refund"
4. Choisir montant (partiel ou total)

**Note:** Le remboursement ne crée PAS de webhook annulant l'abonnement. Il faut l'annuler manuellement si nécessaire.

### Via Prisma Studio

```bash
npx prisma studio
```

#### Consulter un Abonnement

```sql
SELECT * FROM "Subscription"
WHERE "userId" = 'user_id_here';
```

#### Mettre à Jour Manuellement (Déconseillé)

⚠️ **Attention:** Modifier directement la DB peut créer des incohérences avec Stripe.

Si vraiment nécessaire:

```sql
-- Annuler un abonnement
UPDATE "Subscription"
SET
  status = 'CANCELED',
  "canceledAt" = NOW()
WHERE "userId" = 'user_id_here';

-- Activer un abonnement
UPDATE "Subscription"
SET
  status = 'ACTIVE',
  "currentPeriodEnd" = NOW() + INTERVAL '30 days'
WHERE "userId" = 'user_id_here';
```

Après modification manuelle, **toujours** synchroniser avec Stripe via webhook ou API.

### Via MCP Stripe

Utiliser le MCP Stripe avec Claude Code:

```typescript
// Lister les abonnements d'un client
await mcp__stripe__list_subscriptions({
  customer: 'cus_xxx'
})

// Annuler un abonnement
await mcp__stripe__cancel_subscription({
  subscription: 'sub_xxx'
})

// Mettre à jour un abonnement
await mcp__stripe__update_subscription({
  subscription: 'sub_xxx',
  items: [
    { id: 'si_xxx', deleted: true },
    { price: 'price_yearly' }
  ]
})
```

### Cas d'Usage Courants

#### 1. Utilisateur Veut Passer de Mensuel à Annuel

**Via Stripe Portal (Recommandé):**
- L'utilisateur accède au portal via "Gérer l'abonnement"
- Sélectionne "Update plan"
- Choisit l'abonnement annuel
- Stripe calcule automatiquement la proration

**Via Admin:**
```typescript
await stripe.subscriptions.update('sub_xxx', {
  items: [
    { id: 'si_monthly_xxx', deleted: true },
    { price: process.env.STRIPE_PRICE_YEARLY }
  ],
  proration_behavior: 'create_prorations',
})
```

#### 2. Utilisateur Oublie d'Annuler Après l'Essai

**Solution:**
1. Annuler l'abonnement dans Stripe (cancel immediately)
2. Rembourser le premier paiement
3. Le webhook met à jour notre DB automatiquement

#### 3. Paiement Échoue Pendant la Période de Grâce

**Actions automatiques:**
1. Webhook `invoice.payment_failed` → statut `PAST_DUE`
2. Email envoyé avec date limite (7 jours)
3. Utilisateur garde l'accès pendant 7 jours
4. Après 7 jours, statut → `UNPAID`, accès bloqué

**Intervention manuelle:**
- Demander à l'utilisateur de mettre à jour son moyen de paiement
- Stripe tentera automatiquement de re-facturer (Smart Retries)

#### 4. Utilisateur Veut Prolonger son Essai

**Via Stripe:**
```typescript
await stripe.subscriptions.update('sub_xxx', {
  trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // +7 jours
})
```

Le webhook `customer.subscription.updated` synchronisera automatiquement.

---

## Tests et Débogage

### Tests Automatisés

#### Tests E2E (Playwright)

```bash
# Exécuter les tests E2E
npm run test:e2e

# Mode interactif
npm run test:e2e:ui

# Test spécifique
npx playwright test e2e/subscription.spec.ts
```

**Tests couverts:**
- Flow de checkout complet
- Accès protégé avec/sans abonnement
- Affichage des statuts (trial, active, canceled)
- Gestion de l'abonnement (portal)
- Traduction FR/EN

#### Tests Unitaires (Vitest)

```bash
# Exécuter les tests unitaires
npm test

# Tests de subscription
npm test -- subscription

# Coverage
npm run test:coverage
```

**Tests couverts:**
- `hasActiveSubscription()` pour tous les statuts
- `getDaysUntilTrialEnd()` edge cases
- `isInGracePeriod()` calculs de dates
- Scenarios d'intégration

### Tester les Emails

#### En Développement (Resend Test Mode)

1. Utiliser un vrai email dans Resend
2. Les emails arrivent dans votre boîte avec `[TEST]` dans le sujet
3. Vérifier le rendu dans le dashboard Resend

#### Test Unitaire des Templates

```typescript
import { render } from '@react-email/render'
import PaymentFailedEmail from '@/emails/payment-failed'

test('payment failed email renders correctly', () => {
  const html = render(
    PaymentFailedEmail({
      userName: 'Jean Dupont',
      amount: '19€',
      reason: 'Carte refusée',
      updatePaymentUrl: 'https://...',
      gracePeriodEnd: '15 janvier 2025',
      locale: 'fr',
    })
  )

  expect(html).toContain('Jean Dupont')
  expect(html).toContain('19€')
  expect(html).toContain('Carte refusée')
})
```

### Déboguer en Production

#### Utilisateur Bloqué Sans Raison

1. **Vérifier le statut d'abonnement:**
   ```sql
   SELECT
     s.*,
     u.email
   FROM "Subscription" s
   JOIN "User" u ON u.id = s."userId"
   WHERE u.email = 'user@example.com';
   ```

2. **Vérifier dans Stripe:**
   - Dashboard → Chercher le client par email
   - Comparer le statut Stripe vs notre DB

3. **Vérifier les logs de webhooks:**
   - Stripe Dashboard → Webhooks → Événements récents
   - Chercher les erreurs de delivery

4. **Forcer la synchronisation:**
   ```bash
   # Via Stripe CLI
   stripe trigger customer.subscription.updated --override subscription:id=sub_xxx
   ```

#### Emails Non Reçus

1. **Vérifier le log du cron:**
   ```bash
   vercel logs --since 24h | grep subscription-notifications
   ```

2. **Vérifier Resend:**
   - Dashboard Resend → Logs
   - Chercher l'email de l'utilisateur
   - Vérifier le statut (delivered, bounced, etc.)

3. **Tester l'envoi manuellement:**
   ```typescript
   import { sendPaymentFailedEmail } from '@/lib/email'

   await sendPaymentFailedEmail({
     to: 'user@example.com',
     userName: 'Test User',
     amount: '19€',
     gracePeriodEnd: '15 janvier 2025',
     locale: 'fr',
   })
   ```

#### Double Facturation

1. **Vérifier l'historique de facturation dans Stripe:**
   - Dashboard → Client → Invoices

2. **Vérifier s'il y a eu un changement de plan:**
   - Stripe facture la proration + nouvelle période

3. **Vérifier les webhooks:**
   - Chercher les événements `invoice.created` et `invoice.payment_succeeded`

4. **Si erreur confirmée:**
   - Rembourser via Stripe Dashboard
   - Documenter l'incident

---

## Résolution des Problèmes

### Problèmes Courants

#### "Invalid signature" dans les Webhooks

**Cause:** Secret webhook incorrect ou changé

**Solution:**
1. Vérifier `STRIPE_WEBHOOK_SECRET` dans Vercel
2. Récupérer le nouveau secret dans Stripe Dashboard
3. Mettre à jour la variable d'environnement
4. Redéployer si nécessaire

#### Utilisateur Ne Reçoit Pas l'Email de Rappel

**Causes possibles:**
1. Cron job n'a pas tourné → Vérifier Vercel Cron logs
2. Email bloqué par Resend → Vérifier Resend logs
3. Dates incorrectes en DB → Vérifier les dates dans Prisma Studio
4. Erreur dans le code d'envoi → Vérifier Sentry

**Debug:**
```bash
# 1. Vérifier que l'utilisateur est éligible
psql $DATABASE_URL -c "
SELECT * FROM \"Subscription\"
WHERE status = 'TRIALING'
AND \"trialEnd\" BETWEEN NOW() + INTERVAL '3 days'
                     AND NOW() + INTERVAL '4 days';
"

# 2. Tester le cron manuellement
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://healthincloud.app/api/cron/subscription-notifications
```

#### Abonnement Actif Mais Accès Bloqué

**Causes possibles:**
1. Décalage entre Stripe et DB → Webhook non traité
2. Middleware de protection bug → Vérifier la logique
3. Session invalide → Demander à l'utilisateur de se reconnecter

**Debug:**
```typescript
// Dans la console du navigateur (dev tools)
fetch('/api/subscription/status')
  .then(r => r.json())
  .then(console.log)

// Devrait retourner
{
  status: 'ACTIVE',
  currentPeriodEnd: '2025-02-15T00:00:00.000Z',
  ...
}
```

#### Webhook Reçu Mais DB Non Mise à Jour

**Causes possibles:**
1. Erreur dans le handler → Vérifier Sentry
2. Customer ID ne match pas → Vérifier le mapping
3. Transaction DB échouée → Vérifier Prisma logs

**Debug:**
1. Vérifier les logs Vercel pour l'endpoint webhook
2. Vérifier le `stripeCustomerId` de l'utilisateur:
   ```sql
   SELECT id, email, "stripeCustomerId"
   FROM "User"
   WHERE email = 'user@example.com';
   ```
3. Comparer avec le `customer` ID dans Stripe

#### Tests E2E Échouent de Façon Aléatoire

**Causes possibles:**
1. Race conditions → Ajouter des `waitFor`
2. Base de données non nettoyée → Ajouter des `afterEach`
3. Mocks non réinitialisés → Utiliser `beforeEach`

**Solution:**
```typescript
test.beforeEach(async ({ page }) => {
  // Nettoyer les cookies
  await page.context().clearCookies()

  // Réinitialiser les mocks
  await page.route('**/api/**', route => route.continue())
})
```

### Commandes Utiles

```bash
# Vérifier les variables d'environnement
vercel env ls

# Voir les logs en temps réel
vercel logs --follow

# Déclencher un déploiement
git push origin main

# Tester un webhook en local
stripe trigger customer.subscription.updated

# Voir les abonnements actifs
stripe subscriptions list --limit 10

# Voir les paiements échoués
stripe invoices list --status=uncollectible --limit 10

# Exécuter les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio
npx prisma studio
```

### Contacts Utiles

- **Stripe Support:** https://support.stripe.com
- **Resend Support:** support@resend.com
- **Vercel Support:** https://vercel.com/support
- **Documentation Stripe:** https://stripe.com/docs
- **Documentation Better Auth:** https://better-auth.com/docs

---

## Checklist de Maintenance Mensuelle

- [ ] Vérifier le taux de réussite des webhooks (> 99%)
- [ ] Vérifier le taux d'envoi des emails (> 95%)
- [ ] Vérifier les logs d'erreur dans Sentry
- [ ] Vérifier les abonnements `PAST_DUE` depuis > 7 jours
- [ ] Vérifier les abonnements `INCOMPLETE` depuis > 24h
- [ ] Comparer le nombre d'abonnements Stripe vs DB
- [ ] Vérifier que le cron job tourne tous les jours
- [ ] Tester manuellement un flow de checkout
- [ ] Vérifier les métriques de performance (Vercel Analytics)
- [ ] Revoir les taux de conversion (trial → paid)

---

## Changelog

| Date       | Modification                                    |
|------------|-------------------------------------------------|
| 2025-01-15 | Création du guide d'administration              |
| 2025-01-15 | Ajout sections webhooks et cron monitoring      |
| 2025-01-15 | Ajout guide de débogage et troubleshooting      |

---

**Pour toute question ou problème non couvert par ce guide, contacter l'équipe technique.**
