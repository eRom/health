# Démarrage Rapide - Test du Système d'Abonnement

Guide express pour tester le système d'abonnement en 10 minutes.

---

## ✅ Ce que vous avez déjà

- [x] Resend configuré (`RESEND_API_KEY` présent)
- [x] Application Next.js fonctionnelle
- [x] Base de données configurée

## ❌ Ce qu'il manque

- [ ] Compte Stripe (gratuit)
- [ ] Clés API Stripe
- [ ] Produits et prix Stripe
- [ ] Stripe CLI
- [ ] Variables d'environnement Stripe

---

## Étape 1: Créer un Compte Stripe (2 min)

1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte avec votre email
3. S'assurer d'être en **mode Test** (toggle en haut à droite)

---

## Étape 2: Récupérer les Clés API (1 min)

1. Dans le dashboard Stripe: **Développeurs → Clés API**
2. Copier:
   - **Clé publiable** (commence par `pk_test_`)
   - **Clé secrète** (cliquer sur "Révéler" - commence par `sk_test_`)

---

## Étape 3: Créer les Produits de Test (3 min)

### Via le Dashboard Stripe (Plus Simple)

1. Aller dans **Catalogue de produits → Produits**
2. Cliquer **+ Ajouter un produit**

**Plan Mensuel:**
```
Nom: Health In Cloud - Mensuel
Prix: 19,00 EUR
Facturation: Mensuelle
Essai gratuit: 14 jours
```
→ **Enregistrer** et copier l'ID du prix (`price_...`)

3. Créer un second produit

**Plan Annuel:**
```
Nom: Health In Cloud - Annuel
Prix: 180,00 EUR
Facturation: Annuelle
Essai gratuit: 14 jours
```
→ **Enregistrer** et copier l'ID du prix (`price_...`)

---

## Étape 4: Configurer .env.local (1 min)

Ouvrir `.env.local` et ajouter ces lignes:

```bash
# Stripe (Mode Test) - À COMPLÉTER
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_VOTRE_CLE_ICI
STRIPE_PRICE_MONTHLY=price_VOTRE_ID_MENSUEL_ICI
STRIPE_PRICE_YEARLY=price_VOTRE_ID_ANNUEL_ICI
STRIPE_WEBHOOK_SECRET=                    # Sera rempli à l'étape 6

# Cron Job
CRON_SECRET=dev_test_secret_12345

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Remplacer les valeurs par celles copiées aux étapes 2 et 3.

---

## Étape 5: Installer Stripe CLI (2 min)

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
# Télécharger et installer
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Windows
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

Se connecter:
```bash
stripe login
```

---

## Étape 6: Démarrer l'Application (1 min)

### Terminal 1: Next.js

```bash
# Appliquer les migrations
npx prisma migrate dev

# Démarrer Next.js
npm run dev
```

### Terminal 2: Stripe CLI (Webhooks)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Important:** Copier le `whsec_...` affiché et l'ajouter dans `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_LE_SECRET_AFFICHE
```

Puis **redémarrer** Next.js (Ctrl+C dans Terminal 1, puis `npm run dev`).

---

## Étape 7: Premier Test (2 min)

### 1. Créer un Compte

1. Aller sur http://localhost:3000/fr
2. Cliquer **S'inscrire**
3. Créer un compte:
   ```
   Nom: Test User
   Email: test@example.com
   Mot de passe: TestPassword123!
   ```

### 2. Vérifier le Blocage

Vous devriez être automatiquement redirigé vers `/fr/subscription?blocked=true` avec une alerte rouge.

### 3. Démarrer un Essai

1. Cliquer **Commencer l'essai gratuit** (plan mensuel)
2. Vous êtes redirigé vers Stripe Checkout

### 4. Payer avec une Carte de Test

```
Numéro de carte: 4242 4242 4242 4242
Date d'expiration: 12/25 (ou toute date future)
CVC: 123
```

Cliquer **S'abonner**

### 5. Vérifier le Succès

- ✅ Redirection vers `/fr/subscription/success`
- ✅ Dans Terminal 2 (Stripe CLI): Messages de webhook avec `[200]`
- ✅ Accès au dashboard fonctionnel

---

## ✅ Validation Rapide

Si tout fonctionne:

- [ ] Page de succès affichée
- [ ] Webhooks reçus dans Stripe CLI (codes 200)
- [ ] Accès au dashboard autorisé
- [ ] Dans Stripe Dashboard: Abonnement visible en mode "Essai"

---

## 🐛 Problèmes Courants

### Erreur: "STRIPE_WEBHOOK_SECRET is not defined"

**Solution:**
1. Copier le `whsec_...` du terminal Stripe CLI
2. L'ajouter dans `.env.local`
3. **Redémarrer** Next.js

### Erreur: Webhook retourne 400

**Solution:**
Le secret webhook ne correspond pas. Vérifier que:
1. Stripe CLI est démarré
2. Le secret dans `.env.local` correspond au terminal
3. Next.js a été redémarré après modification

### Redirection infinie vers /subscription

**Solution:**
1. Vérifier que les webhooks ont bien été reçus (terminal Stripe CLI)
2. Vérifier dans Prisma Studio que l'abonnement existe
3. Se déconnecter/reconnecter

---

## 📚 Documentation Complète

Pour des tests plus approfondis, consulter:
- **[DEV_TESTING_GUIDE.md](./DEV_TESTING_GUIDE.md)** - Guide complet (10 étapes)
- **[SUBSCRIPTION_ADMIN_GUIDE.md](./SUBSCRIPTION_ADMIN_GUIDE.md)** - Gestion et débogage

---

## 🚀 Prochaine Étape

Une fois le test réussi:

1. Tester les autres fonctionnalités (annulation, emails, etc.)
2. Consulter le guide complet: [DEV_TESTING_GUIDE.md](./DEV_TESTING_GUIDE.md)
3. Quand prêt: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Besoin d'aide?** Consulter la section Dépannage dans [DEV_TESTING_GUIDE.md](./DEV_TESTING_GUIDE.md)
