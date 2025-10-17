# Guide de Test en Développement - Système d'Abonnement

Guide étape par étape pour tester le système d'abonnement en local avant le déploiement en production.

---

## 🎯 Objectif

Valider que tous les composants du système d'abonnement fonctionnent correctement:
- ✅ Checkout Stripe
- ✅ Webhooks
- ✅ Emails
- ✅ Protection d'accès
- ✅ Cron job

**Durée estimée:** 30-45 minutes

---

## Prérequis

- [ ] Compte Stripe (gratuit): https://dashboard.stripe.com/register
- [ ] Compte Resend (gratuit): https://resend.com/signup
- [ ] Stripe CLI installé (nous allons l'installer ensemble)
- [ ] Application Next.js démarrée en local

---

## Étape 1: Configuration Stripe (Mode Test)

### 1.1 Créer un Compte Stripe

1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte (gratuit, aucune carte requise)
3. Activer le mode **Test** (toggle en haut à droite)

### 1.2 Récupérer les Clés API de Test

1. Dans le dashboard Stripe, aller dans **Développeurs → Clés API**
2. Copier:
   - **Clé publiable**: `pk_test_...`
   - **Clé secrète**: `sk_test_...` (cliquer sur "Révéler la clé de test")

### 1.3 Créer les Produits et Prix de Test

#### Option A: Via le Dashboard Stripe (Recommandé pour débutants)

1. Aller dans **Catalogue de produits → Produits**
2. Cliquer sur **+ Ajouter un produit**

**Produit 1: Plan Mensuel**
```
Nom: Health In Cloud - Mensuel
Description: Accès complet aux exercices de rééducation
Prix: 19.00 EUR
Facturation récurrente: Mensuelle
Essai gratuit: 14 jours
```
3. Cliquer sur **Enregistrer le produit**
4. Copier l'ID du prix (commence par `price_...`)

**Produit 2: Plan Annuel**
```
Nom: Health In Cloud - Annuel
Description: Accès complet aux exercices de rééducation
Prix: 180.00 EUR
Facturation récurrente: Annuelle
Essai gratuit: 14 jours
```
5. Cliquer sur **Enregistrer le produit**
6. Copier l'ID du prix (commence par `price_...`)

#### Option B: Via Stripe CLI (Avancé)

Si vous avez déjà Stripe CLI installé:

```bash
# Créer le produit
stripe products create \
  --name="Health In Cloud Premium" \
  --description="Accès complet aux exercices de rééducation"

# Copier le product ID (prod_xxx)

# Créer le prix mensuel avec essai
stripe prices create \
  --product=prod_xxx \
  --unit-amount=1900 \
  --currency=eur \
  --recurring[interval]=month \
  --recurring[trial_period_days]=14

# Copier le price ID → STRIPE_PRICE_MONTHLY

# Créer le prix annuel avec essai
stripe prices create \
  --product=prod_xxx \
  --unit-amount=18000 \
  --currency=eur \
  --recurring[interval]=year \
  --recurring[trial_period_days]=14

# Copier le price ID → STRIPE_PRICE_YEARLY
```

---

## Étape 2: Configuration Resend (Emails)

### 2.1 Créer un Compte Resend

1. Aller sur https://resend.com/signup
2. Créer un compte (gratuit, 100 emails/jour, 3000/mois)
3. Vérifier votre email

### 2.2 Récupérer la Clé API

1. Dans le dashboard Resend, aller dans **API Keys**
2. Cliquer sur **Create API Key**
3. Nom: `Health In Cloud Dev`
4. Permission: **Sending access**
5. Copier la clé (commence par `re_...`)

### 2.3 Configuration de l'Email Expéditeur

En mode développement, Resend permet d'envoyer depuis `onboarding@resend.dev`.

Pour utiliser votre propre domaine (optionnel):
1. Aller dans **Domains**
2. Ajouter votre domaine
3. Configurer les enregistrements DNS
4. Attendre la vérification (~5 minutes)

---

## Étape 3: Variables d'Environnement

### 3.1 Créer/Mettre à Jour `.env.local`

Créer ou éditer le fichier `.env.local` à la racine du projet:

```bash
# Stripe (Mode Test)
STRIPE_SECRET_KEY=sk_test_...                          # Clé secrète de l'étape 1.2
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...              # Clé publique de l'étape 1.2
STRIPE_PRICE_MONTHLY=price_...                         # ID prix mensuel de l'étape 1.3
STRIPE_PRICE_YEARLY=price_...                          # ID prix annuel de l'étape 1.3
STRIPE_WEBHOOK_SECRET=whsec_...                        # Sera généré à l'étape 4

# Resend (Emails)
RESEND_API_KEY=re_...                                  # Clé API de l'étape 2.2
RESEND_FROM_EMAIL=onboarding@resend.dev                # Email par défaut Resend

# Cron Job
CRON_SECRET=dev_test_secret_123                        # Secret pour tester le cron en local

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Base de données (déjà configuré normalement)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### 3.2 Vérifier les Variables

```bash
# Vérifier que toutes les variables sont présentes
cat .env.local | grep -E "(STRIPE|RESEND|CRON)"
```

Vous devriez voir:
- ✅ `STRIPE_SECRET_KEY=sk_test_...`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...`
- ✅ `STRIPE_PRICE_MONTHLY=price_...`
- ✅ `STRIPE_PRICE_YEARLY=price_...`
- ✅ `RESEND_API_KEY=re_...`
- ✅ `RESEND_FROM_EMAIL=onboarding@resend.dev`
- ✅ `CRON_SECRET=dev_test_secret_123`

---

## Étape 4: Installer et Configurer Stripe CLI

Le Stripe CLI permet d'écouter les webhooks en local.

### 4.1 Installer Stripe CLI

#### macOS (Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux
```bash
# Télécharger depuis https://github.com/stripe/stripe-cli/releases
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### Windows
```powershell
# Via Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### 4.2 Se Connecter à Stripe

```bash
stripe login
```

Cela ouvrira votre navigateur pour autoriser Stripe CLI.

### 4.3 Tester l'Installation

```bash
stripe --version
# Devrait afficher: stripe version 1.x.x
```

---

## Étape 5: Démarrer l'Application

### 5.1 Appliquer les Migrations

```bash
# Appliquer la migration Subscription
npx prisma migrate dev

# Optionnel: Ouvrir Prisma Studio pour voir la DB
npx prisma studio
```

### 5.2 Démarrer le Serveur Next.js

Dans un terminal:

```bash
npm run dev
```

L'application devrait démarrer sur http://localhost:3000

### 5.3 Démarrer Stripe CLI pour les Webhooks

Dans un **deuxième terminal**:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Vous devriez voir:
```
> Ready! You are using Stripe API Version [2024-11-20.acacia]. Your webhook signing secret is whsec_... (^C to quit)
```

**Important:** Copier le `whsec_...` et l'ajouter dans `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Puis **redémarrer** le serveur Next.js (Ctrl+C puis `npm run dev`).

---

## Étape 6: Tests Manuels

### 6.1 Test du Flow de Checkout Complet

#### 1. Créer un Compte

1. Aller sur http://localhost:3000/fr
2. Cliquer sur **S'inscrire**
3. Créer un compte:
   ```
   Nom: Test User
   Email: test@example.com
   Mot de passe: TestPassword123!
   ```
4. Vous devriez être redirigé vers `/fr/dashboard`

#### 2. Vérifier le Blocage (Pas d'Abonnement)

1. Vous devriez être redirigé automatiquement vers `/fr/subscription?blocked=true`
2. Vérifier que l'alerte rouge apparaît:
   > "L'accès aux exercices nécessite un abonnement actif"

#### 3. Voir les Plans Tarifaires

Vérifier que la page affiche:
- ✅ Plan Mensuel: 19€/mois
- ✅ Plan Annuel: 180€/an (badge "Économisez 21%")
- ✅ "14 jours d'essai gratuit" sur les deux
- ✅ Liste des fonctionnalités
- ✅ Bouton "Commencer l'essai gratuit"

#### 4. Démarrer un Checkout

1. Cliquer sur **Commencer l'essai gratuit** (plan mensuel)
2. Vous devriez être redirigé vers Stripe Checkout
3. Vérifier l'URL: `https://checkout.stripe.com/c/pay/...`

#### 5. Remplir le Checkout Stripe

Utiliser les **cartes de test Stripe**:

**Carte de test (succès):**
```
Numéro: 4242 4242 4242 4242
Date: N'importe quelle date future (ex: 12/25)
CVC: N'importe quel 3 chiffres (ex: 123)
Nom: Test User
Email: test@example.com
```

Cliquer sur **S'abonner**

#### 6. Vérifier le Webhook

Dans le terminal Stripe CLI, vous devriez voir:

```
[200] POST /api/webhooks/stripe [evt_xxx] checkout.session.completed
[200] POST /api/webhooks/stripe [evt_xxx] customer.subscription.created
```

Les codes `[200]` indiquent que les webhooks ont été traités avec succès.

#### 7. Page de Succès

Vous devriez être redirigé vers `/fr/subscription/success`

Vérifier:
- ✅ Message de félicitations
- ✅ Mention de l'essai gratuit
- ✅ Bouton "Accéder au tableau de bord"

#### 8. Vérifier l'Accès au Dashboard

1. Cliquer sur **Accéder au tableau de bord**
2. Vous devriez voir `/fr/dashboard` (pas de redirection cette fois!)
3. Vérifier que vous pouvez accéder aux exercices

#### 9. Vérifier l'Abonnement en Base de Données

Dans Prisma Studio (http://localhost:5555):

1. Ouvrir la table **Subscription**
2. Trouver votre abonnement
3. Vérifier:
   - ✅ `status` = "TRIALING"
   - ✅ `trialEnd` = date dans 14 jours
   - ✅ `stripeSubscriptionId` rempli
   - ✅ `stripePriceId` correspond au prix choisi

#### 10. Vérifier dans Stripe Dashboard

1. Ouvrir https://dashboard.stripe.com/test/subscriptions
2. Voir votre abonnement de test
3. Vérifier:
   - ✅ Statut: "En période d'essai"
   - ✅ Prochaine facturation: dans 14 jours
   - ✅ Montant: 19€

### 6.2 Test de la Gestion d'Abonnement

#### 1. Accéder à la Page Subscription

1. Aller sur http://localhost:3000/fr/subscription
2. Vérifier que la carte d'abonnement s'affiche:
   - ✅ Badge "Essai" (couleur bleue)
   - ✅ "Votre essai se termine dans 14 jours"
   - ✅ Plan: "Mensuel - 19€/mois"
   - ✅ Bouton "Gérer l'abonnement"

#### 2. Ouvrir le Customer Portal

1. Cliquer sur **Gérer l'abonnement**
2. Vous devriez être redirigé vers Stripe Customer Portal
3. URL: `https://billing.stripe.com/p/session/...`

#### 3. Tester l'Annulation

Dans le Customer Portal:
1. Cliquer sur **Annuler l'abonnement**
2. Choisir **Annuler à la fin de la période**
3. Confirmer

Retourner sur http://localhost:3000/fr/subscription

Vérifier:
- ✅ Badge "Annulé"
- ✅ Message: "Votre abonnement sera annulé le [date]"
- ✅ "Vous avez toujours accès jusqu'au..."

### 6.3 Test des Différents Statuts

#### Tester le Paiement Échoué

1. Créer un nouveau compte
2. Démarrer un checkout
3. Utiliser la carte **échec de paiement**:
   ```
   Numéro: 4000 0000 0000 0341
   Date: Future
   CVC: 123
   ```

Le checkout devrait afficher une erreur de carte refusée.

#### Simuler un Échec de Paiement Après l'Essai

En développement, le plus simple est de modifier manuellement la DB:

```sql
-- Dans Prisma Studio ou via psql
UPDATE "Subscription"
SET
  status = 'PAST_DUE',
  "currentPeriodEnd" = NOW() - INTERVAL '2 days'
WHERE "userId" = 'votre_user_id';
```

Puis retourner sur `/fr/subscription` et vérifier:
- ✅ Alerte rouge "Problème de paiement"
- ✅ Bouton "Mettre à jour le moyen de paiement"
- ✅ Accès maintenu (période de grâce)

---

## Étape 7: Tester les Emails

### 7.1 Déclencher un Email de Test

Nous allons tester l'email de paiement échoué.

#### Option A: Via le Webhook (Recommandé)

1. S'assurer que Stripe CLI écoute les webhooks
2. Déclencher un événement de test:

```bash
# Dans un troisième terminal
stripe trigger invoice.payment_failed
```

Vérifier:
- ✅ Dans le terminal Stripe CLI: `[200] POST /api/webhooks/stripe`
- ✅ Dans les logs de Next.js: Message de log de l'email envoyé
- ✅ Dans Resend Dashboard: Email apparaît dans les logs

#### Option B: Via un Script de Test

Créer un fichier de test:

```typescript
// scripts/test-email.ts
import { sendPaymentFailedEmail } from '@/lib/email'

async function testEmail() {
  await sendPaymentFailedEmail({
    to: 'votre-email@example.com',  // Votre vrai email
    userName: 'Test User',
    amount: '19€',
    reason: 'Carte refusée',
    gracePeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    locale: 'fr',
  })
  console.log('Email envoyé!')
}

testEmail()
```

Exécuter:
```bash
npx tsx scripts/test-email.ts
```

### 7.2 Vérifier l'Email Reçu

1. Ouvrir votre boîte mail
2. Chercher l'email de `onboarding@resend.dev`
3. Vérifier:
   - ✅ Sujet: "Action requise : Échec du paiement"
   - ✅ Contenu personnalisé (nom, montant, raison)
   - ✅ Bouton "Mettre à jour le moyen de paiement"
   - ✅ Rendu correct (texte lisible, images chargées)
   - ✅ Version mobile responsive

### 7.3 Tester les Autres Templates

Même processus pour:
- `sendTrialEndingEmail`
- `sendTrialEndedEmail`
- `sendRenewalReminderEmail`

---

## Étape 8: Tester le Cron Job

Le cron job s'exécute quotidiennement en production, mais nous pouvons le tester manuellement.

### 8.1 Créer des Données de Test

Dans Prisma Studio ou via SQL:

```sql
-- Abonnement se terminant dans 3 jours (pour rappel fin d'essai)
UPDATE "Subscription"
SET
  status = 'TRIALING',
  "trialEnd" = NOW() + INTERVAL '3 days'
WHERE "userId" = 'user_id_1';

-- Abonnement se renouvelant dans 7 jours (pour rappel renouvellement)
UPDATE "Subscription"
SET
  status = 'ACTIVE',
  "currentPeriodEnd" = NOW() + INTERVAL '7 days',
  "cancelAtPeriodEnd" = false
WHERE "userId" = 'user_id_2';
```

### 8.2 Appeler le Cron Manuellement

```bash
curl -X GET http://localhost:3000/api/cron/subscription-notifications \
  -H "Authorization: Bearer dev_test_secret_123"
```

### 8.3 Vérifier la Réponse

Vous devriez recevoir:

```json
{
  "success": true,
  "trialEndingReminders": 1,
  "trialEndedNotifications": 0,
  "renewalReminders": 1,
  "errors": []
}
```

### 8.4 Vérifier les Emails Envoyés

Vérifier dans votre boîte mail que vous avez reçu:
- ✅ Email "Votre essai gratuit se termine dans 3 jours"
- ✅ Email "Rappel : Votre abonnement sera renouvelé prochainement"

---

## Étape 9: Tester les Cas d'Erreur

### 9.1 Webhook avec Signature Invalide

```bash
# Envoyer un webhook sans signature valide
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{"type":"test","data":{}}'
```

Devrait retourner: `400 Invalid signature`

### 9.2 Cron sans Authentification

```bash
# Appeler le cron sans le header Authorization
curl -X GET http://localhost:3000/api/cron/subscription-notifications
```

Devrait retourner: `401 Unauthorized`

### 9.3 Checkout sans Être Connecté

1. Se déconnecter
2. Aller sur http://localhost:3000/fr/subscription
3. Cliquer sur "Commencer l'essai"
4. Devrait rediriger vers `/fr/auth/login`

---

## Étape 10: Tester les Tests Automatisés

### 10.1 Tests Unitaires

```bash
# Exécuter tous les tests unitaires
npm test

# Exécuter uniquement les tests de subscription
npm test -- subscription

# Avec coverage
npm run test:coverage
```

Vérifier:
- ✅ Tous les tests passent
- ✅ Coverage > 90% sur `lib/subscription.ts`

### 10.2 Tests E2E

**Important:** Les tests E2E nécessitent que l'app soit démarrée.

```bash
# Exécuter les tests E2E
npm run test:e2e -- subscription.spec.ts

# Mode interactif (recommandé pour déboguer)
npm run test:e2e:ui
```

Dans l'interface Playwright:
1. Sélectionner `subscription.spec.ts`
2. Cliquer sur "Run" ou sur un test spécifique
3. Observer le navigateur exécuter les actions

**Note:** Certains tests nécessitent des mocks et peuvent échouer en dev. C'est normal, ils sont conçus pour CI/CD.

---

## Checklist de Validation Complète

Avant de considérer les tests terminés, vérifier:

### Configuration
- [ ] Stripe Dashboard accessible en mode test
- [ ] 2 prix créés (monthly + yearly) avec essai 14 jours
- [ ] Resend configuré avec clé API valide
- [ ] Toutes les variables dans `.env.local`
- [ ] Stripe CLI installé et connecté

### Flow Utilisateur
- [ ] Signup créé avec succès
- [ ] Redirection vers `/subscription?blocked=true` sans abonnement
- [ ] Pricing table affichée correctement
- [ ] Checkout Stripe fonctionne (carte test 4242...)
- [ ] Webhooks reçus et traités (codes 200)
- [ ] Redirection vers `/subscription/success`
- [ ] Accès au dashboard autorisé après checkout
- [ ] Abonnement visible en DB avec status TRIALING

### Gestion d'Abonnement
- [ ] Carte d'abonnement affichée sur `/subscription`
- [ ] Customer Portal accessible
- [ ] Annulation fonctionne
- [ ] Statut mis à jour après annulation

### Emails
- [ ] Email de paiement échoué reçu
- [ ] Rendu correct (texte + boutons)
- [ ] Liens fonctionnels
- [ ] Version FR correcte

### Cron Job
- [ ] Endpoint protégé par Bearer token
- [ ] Emails de rappel envoyés pour les bons abonnements
- [ ] Réponse JSON correcte

### Tests Automatisés
- [ ] Tests unitaires passent (npm test)
- [ ] Tests E2E passent (npm run test:e2e)

### Erreurs
- [ ] Webhook signature invalide → 400
- [ ] Cron sans auth → 401
- [ ] Checkout sans connexion → redirect login

---

## Dépannage

### Problème: "STRIPE_WEBHOOK_SECRET is not defined"

**Cause:** Variable d'environnement manquante

**Solution:**
1. Vérifier que Stripe CLI est démarré: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copier le `whsec_...` affiché
3. L'ajouter dans `.env.local`
4. **Redémarrer** Next.js

### Problème: Webhooks retournent 400 ou 500

**Cause:** Signature invalide ou erreur de code

**Solution:**
1. Vérifier les logs de Next.js pour voir l'erreur exacte
2. S'assurer que `STRIPE_WEBHOOK_SECRET` correspond au secret de Stripe CLI
3. Vérifier que le body est lu en `text()` et non en JSON

### Problème: Emails non reçus

**Causes possibles:**
1. Clé API Resend invalide
2. Email dans les spams
3. Quota Resend dépassé (100/jour en gratuit)

**Solution:**
1. Vérifier la clé dans `.env.local`
2. Checker le dashboard Resend → Logs
3. Vérifier les spams
4. Utiliser votre vrai email, pas `test@example.com`

### Problème: "Cannot read property 'status' of null"

**Cause:** Abonnement non créé en DB après checkout

**Solution:**
1. Vérifier que les webhooks sont reçus (terminal Stripe CLI)
2. Vérifier les logs Next.js pour les erreurs webhook
3. Vérifier que le `userId` est bien dans les métadonnées de session
4. Vérifier manuellement dans Prisma Studio

### Problème: Redirection infinie vers /subscription

**Cause:** Middleware détecte pas l'abonnement actif

**Solution:**
1. Vérifier en DB que `status` est bien "TRIALING" ou "ACTIVE"
2. Vérifier que `hasActiveSubscription()` retourne true
3. Ajouter des logs dans `middleware.ts` pour déboguer
4. Se reconnecter (session peut être obsolète)

---

## Prochaines Étapes

Une fois tous les tests en développement validés:

1. **Pousser le code:**
   ```bash
   git push origin main
   ```

2. **Préparer la production:**
   - Lire [DEPLOYMENT_CHECKLIST.md](./.specs/DEPLOYMENT_CHECKLIST.md)
   - Configurer Stripe en mode live
   - Configurer les variables Vercel

3. **Déployer:**
   - Merge sur `main` déclenche le déploiement Vercel
   - Appliquer les migrations en production
   - Tester avec une vraie carte de test

---

## Ressources

- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Resend Docs:** https://resend.com/docs
- **Playwright Docs:** https://playwright.dev

---

**Bon testing! 🧪**

Si vous rencontrez un problème non couvert par ce guide, consultez [SUBSCRIPTION_ADMIN_GUIDE.md](./.specs/SUBSCRIPTION_ADMIN_GUIDE.md) ou ouvrez une issue.
