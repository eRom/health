# Health In Cloud - Spécifications du Système de Badges

## 1. BADGES SÉRIES CONSÉCUTIVES ("Streak Badges")

### 1.1 Critères d'attribution
- **Déclencheur** : Utilisation de l'application N jours consécutifs
- **Définition "jour d'utilisation"** : Au moins 1 exercice complété dans la journée (00h00-23h59)
- **Règle de continuité** : Maximum 1 jour de break autorisé (récupération le lendemain)

### 1.2 Paliers et noms des badges
- **🔥 Première Étincelle** : 3 jours consécutifs
- **⚡ Électrisant** : 7 jours consécutifs (1 semaine)
- **💎 Diamant** : 14 jours consécutifs (2 semaines)  
- **🏆 Champion** : 30 jours consécutifs (1 mois)
- **👑 Légendaire** : 60 jours consécutifs (2 mois)
- **🌟 Maître Absolu** : 100 jours consécutifs

### 1.3 Messages de félicitations
- **3 jours** : "🔥 Première étincelle allumée ! La constance commence à payer."
- **7 jours** : "⚡ Une semaine complète ! Tu es sur la bonne voie."
- **14 jours** : "💎 Deux semaines de régularité ! Ta détermination est admirable."
- **30 jours** : "🏆 Un mois complet ! Tu es un vrai champion de la rééducation."
- **60 jours** : "👑 Deux mois de constance ! Tu rejoins les légendes."
- **100 jours** : "🌟 100 jours ! Tu es devenu un maître de la rééducation."

### 1.4 Règles spéciales
- **Récupération après break** : Si break de 1 jour, possibilité de récupérer en faisant 2 exercices le lendemain
- **Reset après 2+ jours** : Compteur remis à zéro après 2 jours consécutifs sans activité
- **Calcul en temps local** : Basé sur le fuseau horaire de l'utilisateur

## 2. BADGES VOLUME D'EXERCICES ("Volume Badges")

### 2.1 Critères d'attribution
- **Déclencheur** : Nombre total d'exercices complétés (tous types confondus)
- **Définition "exercice complété"** : Score > 0 ET temps d'exercice > 30 secondes

### 2.2 Paliers et noms des badges
- **🎯 Premier Pas** : 10 exercices complétés
- **🚀 Décollage** : 25 exercices complétés
- **⭐ Étoile Montante** : 50 exercices complétés
- **🎖️ Soldat** : 100 exercices complétés
- **🏅 Expert** : 250 exercices complétés
- **🥇 Grand Maître** : 500 exercices complétés
- **♦️ Diamant Éternel** : 1000 exercices complétés

### 2.3 Messages de félicitations
- **10 exercices** : "🎯 Tes premiers pas sont franchis ! Continue sur cette lancée."
- **25 exercices** : "🚀 Tu décolles ! Ton cerveau te remercie déjà."
- **50 exercices** : "⭐ Tu brilles de plus en plus ! Ton engagement est remarquable."
- **100 exercices** : "🎖️ Cent exercices ! Tu as la discipline d'un soldat."
- **250 exercices** : "🏅 Tu es devenu un expert ! Ton savoir-faire s'affine."
- **500 exercices** : "🥇 Grand Maître confirmé ! Ton dévouement est exemplaire."
- **1000 exercices** : "♦️ Mille exercices ! Tu es une légende vivante de la rééducation."

## 3. BADGE D'INSCRIPTION ("Welcome Badge")

### 3.1 Critères d'attribution
- **Déclencheur** : Fin du processus d'inscription complète
- **Conditions** : Profil complété (nom, âge, condition de santé renseignée)

### 3.2 Caractéristiques
- **Nom** : "🎉 Bienvenue dans l'aventure !"
- **Description** : "Tu as franchi le premier pas vers ta récupération"
- **Message** : "🎉 Bienvenue dans Health In Cloud ! Ton parcours de récupération commence maintenant. Chaque petit pas compte !"

### 3.3 Moment d'affichage
- Immédiatement après validation du profil
- Pop-up de bienvenue avec animation
- Ajout automatique à la collection de badges

## 4. BADGE PREMIER EXERCICE ("First Step Badge")

### 4.1 Critères d'attribution
- **Déclencheur** : Complétion du tout premier exercice (quel qu'il soit)
- **Condition** : Exercice terminé jusqu'au bout (pas abandonné)

### 4.2 Caractéristiques
- **Nom** : "🌱 Première Graine Plantée"
- **Description** : "Tu as complété ton tout premier exercice !"
- **Message** : "🌱 Félicitations ! Tu viens de planter la première graine de ta récupération. Cette graine va grandir avec chaque exercice !"

### 4.3 Moment d'affichage
- Immédiatement après complétion du premier exercice
- Animation spéciale (confettis recommandés)
- Suggestion automatique de partage sur réseaux sociaux

## 5. RÈGLES GÉNÉRALES DU SYSTÈME

### 5.1 Stockage et persistence
- **Données conservées** : Date d'obtention, ordre d'obtention, progrès vers prochain badge
- **Backup** : Sauvegarde DB pour éviter la perte en cas de changement d'appareil
- **Historique** : Possibilité de voir la date d'obtention de chaque badge

### 5.2 Interface utilisateur
- **Page dédiée** : Section "Mes Badges" dans menu utilisateur
- **Indicateurs de progression** : Barre de progression vers le prochain badge
- **Badges verrouillés** : Affichage en gris avec conditions d'obtention
- **Animation d'obtention** : 3 secondes d'animation

### 5.3 Gamification avancée
- **Preview du prochain badge** : "Plus que X exercices pour obtenir..."
- **Streak en danger** : Notification si risque de perdre la série
- **Rappel quotidien** : Notification douce pour maintenir les séries

### 5.4 Partage social
- **Auto-génération** : Message de partage automatique pour chaque badge
- **Personnalisation** : Possibilité de modifier le message avant partage
- **Visuels** : Génération d'une image de badge pour les réseaux sociaux

## 6. CAS PARTICULIERS ET RÈGLES MÉTIER

### 6.1 Gestion des fuseaux horaires
- Calcul basé sur l'heure locale de l'utilisateur
- Pas de pénalité pour voyages/changements d'heure

### 6.2 Gestion des pauses médicales
- **Pause déclarée** : Possibilité de "mettre en pause" les streaks pour raisons médicales
- **Reprise** : Continuation du compteur après déclaration de reprise

### 6.3 Égalité des exercices
- Tous les types d'exercices ont le même poids (mémoire, attention, coordination...)
- Pas de différence entre exercices "faciles" et "difficiles"

### 6.4 Anti-gaming
- **Limite temporelle** : Maximum 10 exercices comptabilisés par jour
- **Durée minimum** : Exercice doit durer > 30 secondes pour compter
- **Cooldown** : 1 minute minimum entre deux exercices du même type

## 7. MÉTRIQUES ET ANALYSE

### 7.1 KPIs à suivre
- Taux d'obtention de chaque badge
- Impact des badges sur la rétention utilisateur
- Corrélation badges/progression thérapeutique

### 7.2 A/B Testing possibles
- Seuils des badges (plus faciles vs plus difficiles)
- Fréquence des notifications de progression
- Style des animations d'obtention

## 8. Technique
- Client : Zustand (UI state)
- Server : Server Actions (mutations) + cache() (data fetching)
- Middleware : Streak tracking + redirections intelligentes
---

**Version** : 1.0  
**Date** : 11 octobre 2025  
**Statut** : Spécifications validées - Prêt pour développement