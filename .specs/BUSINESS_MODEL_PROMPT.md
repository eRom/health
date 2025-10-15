# Modèle d'abonnement avec essai gratuit - HealthInCloud

## Nouvelle fonctionnalité.
Modèle d'abonnement avec essai gratuit - HealthInCloud
**Analyse du code existant** et documentation avant implémentation


## Vue d'ensemble

**Modèle proposé** : Essai gratuit de 14 jours avec accès complet, puis abonnement obligatoire pour continuer l'utilisation.

**Gestion des paiements** : Intégration Stripe comme sous-traitant RGPD (à mentionner dans la politique de confidentialité pour le traitement des données personnelles : nom, email, données de carte, IP, etc.).

## Structure tarifaire

| Durée | Prix | Prix mensuel équivalent | Réduction |
|-------|------|------------------------|-----------|
| **Mensuel** | 19 € | 19 €/mois | - |
| **Annuel** | 180 € | 15 €/mois | -20% |

## Fonctionnalités à implémenter

### Gestion des statuts utilisateurs
- Différenciation des utilisateurs par statut dans l'interface d'administration
- États possibles : `trial`, `active`, `past_due`, `canceled`

### Système de notifications automatiques
- **J-3 avant fin d'essai** → Email de rappel avec incitation à l'abonnement
- **Jour J (fin d'essai)** → Email d'expiration + offre de souscription

### Intégration Stripe
- Configuration des webhooks pour synchronisation des statuts
- Gestion des paiements récurrents (mensuel/annuel)
- Traitement des échecs de paiement

## Politique d'annulation

### 1. Droit de rétractation (14 jours)
Conformément au Code de la consommation, l'utilisateur bénéficie d'un droit de rétractation de 14 jours calendaires à compter de la souscription :
- Annulation et remboursement intégral sans justification ni frais
- Demande via formulaire de contact ou espace utilisateur
- Remboursement sous 14 jours ouvrés maximum

### 2. Annulation après période de rétractation
- Résiliation possible à tout moment
- Prise d'effet à la fin de la période de facturation en cours
- Pas de remboursement partiel
- Accès maintenu jusqu'à l'échéance

### 3. Renouvellement automatique
- Renouvellement automatique à la date anniversaire
- Rappel email 7 jours avant renouvellement
- Lien direct de résiliation inclus

### 4. Procédure de résiliation
1. Accès via tableau de bord → onglet "Abonnement"
2. Clic sur "Résilier mon abonnement"
3. Confirmation dans la fenêtre de dialogue
4. Email de confirmation immédiat

### 5. Gestion des échecs de paiement
- Relances automatiques à J+1 et J+3
- Passage en statut `past_due` à J+7
- Suspension d'accès jusqu'à régularisation

### 6. Support client
- **Email** : [support@healthincloud.app](mailto:support@healthincloud.app)
- **Formulaire** : Disponible dans l'application

### 7. Tests
parcours complet d'essai, paiement, annulation


## Prochaines étapes
1. Planifie l'implémation de ce système
2. Documentation du plan dans .specs/BUSINESS_MODEL_PLAN.md 
