# Health In Cloud - Spécifications Phase 2 du Système de Badges

## Fonctionnalités reportées à la Phase 2

### 1. NOTIFICATIONS AVANCÉES

#### 1.1 Notifications Email
- **Déclencheurs** : Obtention de nouveaux badges
- **Contenu** : 
  - Message de félicitations personnalisé
  - Image du badge obtenu
  - Progression vers le prochain badge
  - Lien vers la page des badges
- **Fréquence** : Immédiate ou digest quotidien (préférence utilisateur)
- **Template** : Email HTML responsive avec branding Health In Cloud

#### 1.2 Notifications Push (PWA)
- **Déclencheurs** : 
  - Nouveau badge obtenu
  - Streak en danger (dernière chance avant reset)
  - Rappel quotidien pour maintenir les séries
- **Contenu** : 
  - Titre court et motivant
  - Description du badge ou action requise
  - Action rapide (ouvrir l'app)
- **Timing** : 
  - Immédiat pour les badges
  - 20h pour les rappels de streak
  - Configurable par l'utilisateur

#### 1.3 Système de préférences
- **Page dédiée** : `/profile/notifications`
- **Options** :
  - Email : Activé/Désactivé
  - Push : Activé/Désactivé
  - Fréquence des rappels : Quotidien/Hebdomadaire/Désactivé
  - Types de notifications : Badges/Streaks/Progression

### 2. PARTAGE SOCIAL AVEC GÉNÉRATION D'IMAGES

#### 2.1 Génération d'images dynamiques
- **Technologie** : Next.js 15 ImageResponse API
- **Composants** :
  - Badge obtenu (emoji + nom)
  - Message de félicitations
  - Logo Health In Cloud
  - Fond dégradé
  - Date d'obtention
- **Formats** : 
  - Meta (Facebook/Instagram)
    - universal: { width: 1200, height: 630 }
    - instagram: { width: 1080, height: 1080 }
    instagramPortrait: { width: 1080, height: 1350 }
  - X (Twitter)
    - twitter: { width: 1200, height: 628 }
  - LinkedIn
    - linkedin: { width: 1200, height: 627 }
  - Stories universelles
    - story: { width: 1080, height: 1920 }

#### 2.2 Intégration réseaux sociaux
- **Plateformes** : Facebook, Twitter, Instagram, LinkedIn
- **Fonctionnalités** :
  - Partage direct depuis l'app
  - Message personnalisable
  - Hashtags automatiques (#HealthInCloud #Rééducation #Badges)
  - Tracking des partages (analytics)

#### 2.3 Personnalisation
- **Options** :
  - Ajout de texte libre

### 3. PAUSES MÉDICALES DÉCLARÉES

#### 3.1 Interface de pause
- **Accès** : Menu profil > "Pause médicale"
- **Formulaire** :
  - Date de début de pause
  - Date de fin prévue (optionnelle)
  - Raison (liste prédéfinie + libre)
  - Confirmation médicale (optionnelle)

#### 3.2 Gestion des streaks
- **Pendant la pause** :
  - Streaks gelés (pas de reset)
  - Badges de progression suspendus
  - Interface adaptée (mode pause)
- **Reprise** :
  - Streaks reprennent au niveau précédent
  - Badge spécial "Retour de pause"
  - Période de grâce de 3 jours

#### 3.3 Badge spécial
- **Nom** : "🛡️ Pause Médicale Respectée"
- **Description** : "Tu as pris soin de ta santé en déclarant une pause"
- **Message** : "🛡️ Bravo ! Tu as fait le bon choix en prenant soin de ta santé. Ton streak sera préservé."

### 4. LIMITE ANTI-GAMING

#### 4.1 Système de limitation
- **Règle** : Maximum 10 exercices comptabilisés par jour pour les badges
- **Calcul** : Basé sur la date locale de l'utilisateur
- **Affichage** : 
  - Compteur "X/10 exercices aujourd'hui"
  - Message informatif quand limite atteinte
  - Pas de pénalité, juste limitation

#### 4.2 Interface utilisateur
- **Indicateur** : Badge ou compteur dans l'interface
- **Message** : "Limite quotidienne atteinte pour les badges. Tes exercices continuent d'être enregistrés pour ton suivi."
- **Reset** : Automatique à minuit (heure locale)

### 5. A/B TESTING ET MÉTRIQUES AVANCÉES

#### 5.1 Tests A/B configurables
- **Seuils des badges** : 
  - Version A : Seuils actuels
  - Version B : Seuils plus faciles (50% plus bas)
- **Fréquence des notifications** :
  - Version A : Immédiate
  - Version B : Digest quotidien
- **Style des animations** :
  - Version A : Confettis simples
  - Version B : Confettis + son + vibration

#### 5.2 Métriques détaillées
- **KPIs utilisateur** :
  - Taux d'obtention par badge
  - Temps moyen entre badges
  - Impact sur la rétention
  - Corrélation badges/progression thérapeutique
- **KPIs système** :
  - Performance des notifications
  - Taux de partage social
  - Utilisation des pauses médicales
  - Satisfaction utilisateur

#### 5.3 Dashboard administrateur
- **Page** : `/admin/badges-analytics`
- **Métriques** :
  - Graphiques de progression des badges
  - Heatmap des heures d'obtention
  - Analyse des streaks
  - Comparaison A/B
- **Actions** :
  - Ajustement des seuils en temps réel
  - Activation/désactivation de tests A/B
  - Export des données

### 6. FONCTIONNALITÉS AVANCÉES

#### 6.1 Badges saisonniers
- **Concept** : Badges limités dans le temps
- **Exemples** :
  - "🎄 Décembre Magique" : 25 exercices en décembre
  - "🌱 Printemps Nouveau" : Streak de 21 jours au printemps
- **Gestion** : Configuration via admin, activation automatique

#### 6.2 Badges de collaboration
- **Concept** : Badges obtenus en équipe (patient + soignant)
- **Exemples** :
  - "🤝 Équipe Gagnante" : Patient et soignant actifs simultanément
  - "📊 Suivi Parfait" : 30 jours de suivi mutuel
- **Interface** : Section spéciale dans les badges

#### 6.3 Système de points
- **Concept** : Points attribués avec les badges
- **Utilisation** :
  - Déblocage de fonctionnalités premium
  - Personnalisation de l'interface
  - Accès à des exercices exclusifs
- **Affichage** : Compteur de points dans le profil

### 7. ARCHITECTURE TECHNIQUE

#### 7.1 Services externes
- **Email** : Resend ou SendGrid pour les notifications
- **Push** : Service Worker + Firebase Cloud Messaging
- **Images** : Canvas API + Sharp pour la génération
- **Analytics** : PostHog ou Mixpanel pour le tracking

#### 7.2 Base de données
- **Nouvelles tables** :
  - `NotificationPreferences` : Préférences utilisateur
  - `MedicalPauses` : Pauses déclarées
  - `BadgeShares` : Historique des partages
  - `ABTestVariants` : Assignation des tests A/B
  - `BadgeAnalytics` : Métriques détaillées

#### 7.3 API endpoints
- **Notifications** : `/api/notifications/*`
- **Partage** : `/api/badges/share`
- **Pauses** : `/api/medical-pauses/*`
- **Analytics** : `/api/admin/badges-analytics/*`

### 8. PLAN DE DÉPLOIEMENT

#### 8.1 Phase 2A - Notifications (Semaine 1-2)
1. Système de préférences
2. Notifications email
3. Notifications push PWA
4. Tests et validation

#### 8.2 Phase 2B - Partage social (Semaine 3-4)
1. Génération d'images
2. Intégration réseaux sociaux
3. Personnalisation
4. Analytics des partages

#### 8.3 Phase 2C - Fonctionnalités avancées (Semaine 5-6)
1. Pauses médicales
2. Limite anti-gaming
3. Badges saisonniers
4. Tests A/B

#### 8.4 Phase 2D - Analytics et admin (Semaine 7-8)
1. Dashboard administrateur
2. Métriques avancées
3. Optimisations
4. Documentation

### 9. CRITÈRES DE SUCCÈS

#### 9.1 Métriques de base
- **Engagement** : +25% de temps passé sur l'app
- **Rétention** : +15% de rétention à 30 jours
- **Partage** : 10% des utilisateurs partagent au moins un badge
- **Satisfaction** : Score NPS > 8/10

#### 9.2 Métriques techniques
- **Performance** : Temps de génération d'image < 2s
- **Fiabilité** : 99.9% de délivrance des notifications
- **Scalabilité** : Support de 10k utilisateurs simultanés

---

**Version** : 2.0  
**Date** : 11 octobre 2025  
**Statut** : Spécifications Phase 2 - Prêt pour développement après Phase 1
