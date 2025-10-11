# Checklist de test du déploiement en production

## 🌐 Test d'accessibilité de base

### 1. Homepage
- [ ] Ouvrir https://healthincloud.app
- [ ] Vérifier que la page charge sans erreur
- [ ] Vérifier que le logo et les images s'affichent
- [ ] Tester le changement de langue (FR ↔ EN)
- [ ] Tester le changement de thème (light ↔ dark)

### 2. Navigation publique
- [ ] Cliquer sur "À propos" / "About"
- [ ] Cliquer sur "Politique de confidentialité" / "Privacy Policy"
- [ ] Cliquer sur "RGPD" / "GDPR"
- [ ] Cliquer sur "Mentions légales" / "Legal Notice"
- [ ] Vérifier que toutes les pages chargent correctement

## 🔐 Test d'authentification

### 3. Inscription (Signup)
- [ ] Aller sur `/auth/signup`
- [ ] Remplir le formulaire :
  - Nom : Test User
  - Email : test@example.com
  - Mot de passe : TestPassword123!
- [ ] Soumettre le formulaire
- [ ] Vérifier la redirection vers le dashboard

### 4. Connexion (Login)
- [ ] Se déconnecter
- [ ] Aller sur `/auth/login`
- [ ] Se connecter avec les identifiants de test
- [ ] Vérifier la redirection vers le dashboard

### 5. Utilisateur seed (si base réinitialisée)
- [ ] Tester avec : romain.ecarnot@gmail.com / mprnantes
- [ ] Vérifier l'accès au dashboard

## 📊 Test du dashboard

### 6. Dashboard principal
- [ ] Accéder à `/dashboard`
- [ ] Vérifier l'affichage des statistiques (cartes)
- [ ] Vérifier la liste des exercices récents
- [ ] Cliquer sur "Neuropsychologie" → vérifier redirection
- [ ] Cliquer sur "Orthophonie" → vérifier redirection

## 🧠 Test des exercices

### 7. Exercices Neuro
- [ ] Aller sur `/neuro`
- [ ] Vérifier que les 14 exercices s'affichent
- [ ] Utiliser les filtres (catégorie, difficulté)
- [ ] Vérifier les badges de statut (Disponible, À venir)

### 8. Exercices Ortho
- [ ] Aller sur `/ortho`
- [ ] Vérifier que les 18 exercices s'affichent
- [ ] Utiliser les filtres (catégorie, difficulté)
- [ ] Vérifier les badges de statut

## 👤 Test du profil

### 9. Profil utilisateur
- [ ] Aller sur `/profile`
- [ ] Modifier le nom → Enregistrer → Vérifier la sauvegarde
- [ ] Changer la préférence de langue → Vérifier l'effet immédiat
- [ ] Changer la préférence de thème → Vérifier l'effet immédiat
- [ ] Vérifier la section "Sessions actives"

### 10. Sécurité du profil
- [ ] Tester le changement de mot de passe
- [ ] Vérifier les informations de sécurité
- [ ] Tester la révocation d'une session (si plusieurs sessions)

## 📱 Test PWA

### 11. Progressive Web App
- [ ] Ouvrir Chrome DevTools (F12)
- [ ] Aller dans Application > Manifest
- [ ] Vérifier que le manifest.json est chargé
- [ ] Vérifier les icônes (192x192, 512x512, maskable)
- [ ] Tester l'installation de la PWA :
  - Chrome : icône "Installer" dans la barre d'adresse
  - Mobile : "Ajouter à l'écran d'accueil"

### 12. Service Worker
- [ ] Dans DevTools > Application > Service Workers
- [ ] Vérifier que le SW est "activated and running"
- [ ] Tester le mode offline :
  - Activer "Offline" dans DevTools
  - Rafraîchir la page
  - Vérifier que `/offline` s'affiche

## 🔍 Test SEO & Performance

### 13. SEO de base
- [ ] View source de la homepage
- [ ] Vérifier les meta tags (title, description, og:image)
- [ ] Vérifier le JSON-LD (structured data)
- [ ] Vérifier les liens canoniques et alternates (fr/en)

### 14. Lighthouse audit
```bash
# Dans le terminal du projet
npm run lighthouse
```
- [ ] Vérifier Performance ≥ 90
- [ ] Vérifier Accessibility ≥ 90
- [ ] Vérifier Best Practices ≥ 90
- [ ] Vérifier SEO = 100

## 🐛 Monitoring & Erreurs

### 15. Console du navigateur
- [ ] Ouvrir DevTools > Console
- [ ] Vérifier qu'il n'y a pas d'erreurs JavaScript
- [ ] Vérifier qu'il n'y a pas d'erreurs réseau (onglet Network)

### 16. Sentry (si configuré)
- [ ] Aller sur https://sentry.io
- [ ] Se connecter au projet
- [ ] Vérifier qu'il n'y a pas d'erreurs récentes
- [ ] Si erreurs : analyser et corriger

### 17. Vercel Logs
- [ ] Aller sur https://vercel.com/dashboard
- [ ] Ouvrir le projet
- [ ] Onglet "Logs" → vérifier les logs de fonction
- [ ] Onglet "Analytics" → vérifier les Core Web Vitals

## 🌍 Test multilingue

### 18. Parité FR/EN
- [ ] Tester tous les flows en français
- [ ] Tester tous les flows en anglais
- [ ] Vérifier que les URLs changent bien (/fr/... vs /en/...)
- [ ] Vérifier la persistance de la langue (localStorage)

## ✅ Validation finale

### 19. Checklist de production
- [ ] Toutes les pages publiques accessibles
- [ ] Authentification fonctionnelle (signup + login)
- [ ] Dashboard affiche les données
- [ ] Exercices neuro et ortho fonctionnels
- [ ] Profil utilisateur modifiable
- [ ] PWA installable et fonctionnelle
- [ ] Pas d'erreurs dans la console
- [ ] Lighthouse scores ≥ seuils
- [ ] Monitoring actif (Sentry/Vercel)

## 🚨 En cas de problème

### Rollback rapide
Si un problème critique est détecté :
```bash
# Revenir au commit précédent sur main
git revert HEAD
git push origin main
```

### Logs de debugging
```bash
# Logs Vercel en temps réel
vercel logs --follow

# Logs de la dernière fonction
vercel logs --latest
```

### Support
- Docs Vercel : https://vercel.com/docs
- Docs Prisma : https://www.prisma.io/docs
- Docs Better Auth : https://www.better-auth.com/docs
- Issues GitHub : https://github.com/eRom/health/issues

---

**Date du déploiement** : 2025-10-06
**Version** : v1.0.0 (37 commits)
**Déployé par** : Claude Code + Romain
