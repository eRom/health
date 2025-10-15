# Checklist de Déploiement - Système d'Abonnement

## Pré-déploiement

### Configuration Stripe Production

- [ ] Créer le produit "Health In Cloud Premium" en mode production
- [ ] Créer le prix mensuel (19€) avec essai 14 jours
- [ ] Créer le prix annuel (180€) avec essai 14 jours
- [ ] Noter les IDs de prix dans un fichier sécurisé
- [ ] Configurer le webhook production: `https://healthincloud.app/api/webhooks/stripe`
- [ ] Sélectionner les 6 événements requis dans le webhook
- [ ] Noter le `Signing Secret` du webhook
- [ ] Activer "Smart Retries" pour les paiements échoués
- [ ] Configurer les emails de facturation Stripe (branding)

### Variables d'Environnement Vercel

```bash
# Ajouter toutes les variables en production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRICE_MONTHLY production
vercel env add STRIPE_PRICE_YEARLY production
vercel env add CRON_SECRET production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
```

- [ ] Ajouter `STRIPE_SECRET_KEY` (clé live: `sk_live_...`)
- [ ] Ajouter `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (clé live: `pk_live_...`)
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET` (secret prod: `whsec_...`)
- [ ] Ajouter `STRIPE_PRICE_MONTHLY` (ID prix mensuel)
- [ ] Ajouter `STRIPE_PRICE_YEARLY` (ID prix annuel)
- [ ] Générer et ajouter `CRON_SECRET` (32+ caractères aléatoires)
- [ ] Vérifier `RESEND_API_KEY` (doit être en mode production)
- [ ] Vérifier `RESEND_FROM_EMAIL` (domaine vérifié)

### Configuration Base de Données

- [ ] Appliquer les migrations Prisma sur la DB de production
  ```bash
  DATABASE_URL="postgresql://..." npx prisma migrate deploy
  ```
- [ ] Vérifier que la table `Subscription` existe
- [ ] Créer un index sur `Subscription.userId` (si pas déjà fait)
- [ ] Créer un index sur `Subscription.stripeCustomerId` (si pas déjà fait)

### Configuration Resend

- [ ] Vérifier que le domaine `healthincloud.app` est vérifié
- [ ] Configurer les enregistrements DNS (SPF, DKIM, DMARC)
- [ ] Tester l'envoi d'un email depuis la production
- [ ] Vérifier le quota mensuel (10k emails gratuits)
- [ ] Configurer les webhooks Resend pour tracking (optionnel)

### Configuration Vercel Cron

- [ ] Vérifier que `vercel.json` contient le cron job
- [ ] Déployer sur Vercel (le cron sera automatiquement configuré)
- [ ] Vérifier dans Vercel Dashboard → Cron Jobs que le job apparaît
- [ ] Tester manuellement le cron avec `curl`:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" \
    https://healthincloud.app/api/cron/subscription-notifications
  ```

## Tests Pré-Production

### Tests Manuels

- [ ] Créer un compte de test en production
- [ ] Démarrer un checkout avec une carte de test Stripe:
  - Carte: `4242 4242 4242 4242`
  - Date: N'importe quelle date future
  - CVC: N'importe quel 3 chiffres
- [ ] Vérifier la redirection vers `/subscription/success`
- [ ] Vérifier que l'abonnement apparaît dans Stripe Dashboard
- [ ] Vérifier que l'abonnement est créé en base de données
- [ ] Vérifier l'accès au dashboard (doit fonctionner)
- [ ] Tester l'annulation via le Stripe Customer Portal
- [ ] Vérifier que l'annulation se reflète en DB

### Tests de Webhooks

- [ ] Déclencher manuellement les webhooks depuis Stripe Dashboard
- [ ] Vérifier les logs Vercel pour chaque webhook
- [ ] Confirmer que la DB est mise à jour après chaque webhook
- [ ] Tester un échec de paiement (carte `4000 0000 0000 0341`)
- [ ] Vérifier que l'email de paiement échoué est envoyé

### Tests d'Emails

- [ ] Tester l'envoi de chaque type d'email:
  - [ ] Email de rappel de fin d'essai
  - [ ] Email d'essai terminé
  - [ ] Email de rappel de renouvellement
  - [ ] Email de paiement échoué
- [ ] Vérifier le rendu sur mobile et desktop
- [ ] Vérifier les versions FR et EN
- [ ] Vérifier les liens dans les emails

### Tests E2E en Production

```bash
# Exécuter les tests E2E contre la prod (avec précaution)
PLAYWRIGHT_BASE_URL=https://healthincloud.app npm run test:e2e -- subscription.spec.ts
```

- [ ] Tous les tests passent
- [ ] Pas d'erreurs de timeout
- [ ] Pas d'erreurs de navigation

## Déploiement

### Déployer sur Vercel

```bash
# Pousser sur main
git add .
git commit -m "feat: implement subscription system (Phases 1-8)"
git push origin main
```

- [ ] Le déploiement Vercel démarre automatiquement
- [ ] Vérifier les logs de build (pas d'erreurs)
- [ ] Vérifier que le déploiement est réussi
- [ ] Visiter https://healthincloud.app
- [ ] Vérifier que le site fonctionne

### Vérifications Post-Déploiement

- [ ] Tester la page `/subscription` (doit s'afficher)
- [ ] Tester un checkout complet
- [ ] Vérifier les webhooks dans Stripe (statut 200)
- [ ] Vérifier qu'aucune erreur n'apparaît dans Sentry
- [ ] Vérifier les logs Vercel (pas d'erreurs critiques)

## Monitoring Post-Déploiement

### Jour 1

- [ ] Vérifier toutes les heures que les webhooks fonctionnent
- [ ] Surveiller Sentry pour les erreurs
- [ ] Vérifier que le cron job s'est exécuté le lendemain à 9h UTC
- [ ] Vérifier que les emails sont envoyés

### Semaine 1

- [ ] Vérifier quotidiennement les logs Vercel
- [ ] Vérifier les métriques Stripe (conversions, churns)
- [ ] Vérifier les logs d'emails Resend
- [ ] Analyser les premiers retours utilisateurs

### Mois 1

- [ ] Analyser les taux de conversion (trial → paid)
- [ ] Analyser les raisons d'échecs de paiement
- [ ] Vérifier la cohérence DB ↔ Stripe
- [ ] Optimiser selon les retours

## Rollback Plan

En cas de problème critique:

### Option 1: Rollback Vercel

```bash
# Lister les déploiements
vercel ls

# Promouvoir un ancien déploiement
vercel promote <deployment-url>
```

### Option 2: Désactiver la Protection d'Accès

En urgence, désactiver temporairement la protection:

```typescript
// middleware.ts - commenter temporairement
// if (!hasSubscription) {
//   return NextResponse.redirect(new URL('/subscription?blocked=true', request.url))
// }
```

### Option 3: Désactiver les Webhooks

Dans Stripe Dashboard → Webhooks → Désactiver temporairement

## Communication

### Annoncer le Lancement

- [ ] Préparer un email pour les utilisateurs existants
- [ ] Annoncer sur les réseaux sociaux
- [ ] Mettre à jour la page d'accueil
- [ ] Créer une FAQ sur les abonnements

### Support Utilisateurs

- [ ] Préparer des réponses types pour le support
- [ ] Former l'équipe sur le système d'abonnement
- [ ] Créer une page d'aide dédiée
- [ ] Configurer un canal de support prioritaire

## Checklist Légale

- [ ] Vérifier que les CGV sont à jour
- [ ] Vérifier que la politique de confidentialité mentionne Stripe
- [ ] Vérifier que les mentions légales sont complètes
- [ ] Vérifier la conformité RGPD
- [ ] Consulter un avocat si nécessaire (recommandé)

## Métriques à Suivre

### KPIs Business

- Nombre d'essais démarrés / jour
- Taux de conversion essai → payant (objectif: > 20%)
- Taux de churn mensuel (objectif: < 5%)
- MRR (Monthly Recurring Revenue)
- Valeur vie client (LTV)

### KPIs Techniques

- Taux de réussite des webhooks (objectif: > 99%)
- Temps de réponse API checkout (objectif: < 2s)
- Taux d'envoi des emails (objectif: > 95%)
- Taux d'erreur cron job (objectif: 0%)
- Temps d'exécution cron (objectif: < 10s)

## Contacts d'Urgence

- **Stripe Support:** https://support.stripe.com (live chat disponible)
- **Vercel Support:** https://vercel.com/help (entreprise plan)
- **Resend Support:** support@resend.com
- **Sentry:** Alertes automatiques configurées

---

## ✅ Checklist Complétée

Une fois toutes les cases cochées:

- [ ] **Le système d'abonnement est prêt pour la production**
- [ ] **Tous les tests sont passés**
- [ ] **La documentation est à jour**
- [ ] **L'équipe est formée**
- [ ] **Le monitoring est en place**

🚀 **Vous êtes prêt à lancer!**

---

**Date de déploiement prévue:** _______________

**Responsable du déploiement:** _______________

**Approuvé par:** _______________
