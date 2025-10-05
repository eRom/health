# Plan Baseline - Avant développement des exercices

**Date**: 5 janvier 2025
**Status**: Planification
**Objectif**: Consolider les fondations MVP avant d'implémenter les exercices de rééducation

---

## 🎯 Vision

Avant d'attaquer le développement des exercices (cœur de métier), nous devons nous assurer que :
1. **Les fondations sont solides** : architecture, patterns, tests
2. **L'UX est cohérente** : navigation, états, feedback utilisateur
3. **La qualité est mesurable** : tests, monitoring, performance
4. **La documentation est à jour** : pour faciliter le développement futur

---

## 📋 Plan en 4 phases

### **Phase 1 : Tests & Qualité** (Priorité HAUTE)

#### Objectifs
- Établir une couverture de tests baseline (≥50%)
- Configurer CI/CD avec gates de qualité
- Documenter les patterns de test

#### Tâches

**1.1 Tests unitaires critiques**
- [ ] Tester `auth-client.ts` (signIn, signOut, useSession)
- [ ] Tester server actions (`update-preferences`, `change-password`, `revoke-session`)
- [ ] Tester composants formulaires (LoginForm, SignupForm avec mocks)
- [ ] Tester utilitaires (`cn`, theme helpers)

**1.2 Tests E2E critiques**
- [ ] Parcours complet signup → dashboard → logout
- [ ] Parcours login → profile → change preferences → logout
- [ ] Test i18n : switcher FR/EN, vérifier persistence
- [ ] Test theme : switcher Clair/Sombre, vérifier persistence
- [ ] Test responsive : mobile vs desktop navigation

**1.3 Configuration CI**
- [ ] GitHub Actions : lint, type-check, test, build
- [ ] Fail si coverage < 50%
- [ ] Fail si build errors
- [ ] Badge de statut dans README

**1.4 Documentation tests**
- [ ] Créer `.specs/TESTING_PATTERNS.md` avec exemples
- [ ] Documenter mocking strategy (Prisma, Better Auth)
- [ ] Ajouter exemples de tests E2E avec page objects

---

### **Phase 2 : UX & Navigation** (Priorité HAUTE)

#### Objectifs
- Finaliser la navigation mobile
- Gérer les états vides et loading states
- Améliorer le feedback utilisateur

#### Tâches

**2.1 Navigation mobile**
- [ ] Implémenter menu hamburger responsive
- [ ] Tester navigation sur mobile (< 768px)
- [ ] Ajouter transitions smooth pour ouverture/fermeture menu

**2.2 États vides (Empty states)**
- [ ] Dashboard : état vide "Aucun exercice récent"
- [ ] Neuro/Ortho : message quand aucun exercice disponible
- [ ] Profile : message si pas de sessions actives

**2.3 Loading states**
- [ ] Ajouter skeletons sur dashboard
- [ ] Loading spinners sur boutons async (login, signup, profile)
- [ ] Suspense boundaries sur pages protégées

**2.4 Feedback utilisateur**
- [ ] Toast sur succès/erreur (déjà fait avec Sonner)
- [ ] Validation inline sur formulaires
- [ ] Messages d'erreur clairs et actionnables

---

### **Phase 3 : Infrastructure Exercices** (Priorité MOYENNE)

#### Objectifs
- Préparer les modèles de données pour les exercices
- Établir les patterns API/Server Actions
- Créer les composants réutilisables

#### Tâches

**3.1 Modèle de données**
- [ ] Designer le schéma Prisma pour exercices :
  ```prisma
  model Exercise {
    id          String   @id @default(cuid())
    type        String   // 'neuro' | 'ortho'
    category    String   // 'memory', 'attention', 'articulation', etc.
    name        String
    description String
    difficulty  String   // 'easy', 'medium', 'hard'
    duration    Int      // en minutes
    available   Boolean  @default(false)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    attempts    ExerciseAttempt[]
  }

  model ExerciseAttempt {
    id          String   @id @default(cuid())
    userId      String
    exerciseId  String
    score       Int
    timeSpent   Int      // en secondes
    completed   Boolean  @default(false)
    createdAt   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    exercise    Exercise @relation(fields: [exerciseId], references: [id])

    @@index([userId])
    @@index([exerciseId])
  }
  ```
- [ ] Créer migration et seed initial
- [ ] Documenter le modèle dans TECHNICAL_SPEC.md

**3.2 Patterns API**
- [ ] Server action `start-exercise.ts`
- [ ] Server action `submit-attempt.ts`
- [ ] Server action `get-user-attempts.ts`
- [ ] Documenter pattern "optimistic updates" pour UX fluide

**3.3 Composants réutilisables**
- [ ] `ExerciseCard` : affichage uniforme des exercices
- [ ] `ExerciseDetail` : page de détail avec instructions
- [ ] `ExerciseProgress` : indicateur de progression
- [ ] `AttemptHistory` : historique des tentatives

---

### **Phase 4 : Performance & Monitoring** (Priorité BASSE)

#### Objectifs
- Optimiser les performances
- Configurer le monitoring production
- Préparer le déploiement

#### Tâches

**4.1 Performance**
- [ ] Audit Lighthouse (≥90 Performance, 100 SEO)
- [ ] Optimiser images (Next Image, formats modernes)
- [ ] Code splitting sur pages lourdes
- [ ] Analyser bundle size (`@next/bundle-analyzer`)

**4.2 Monitoring**
- [ ] Configurer Sentry production (DSN, source maps)
- [ ] Activer Vercel Analytics
- [ ] Définir alertes (error rate, latency)
- [ ] Dashboard de monitoring (Sentry + Vercel)

**4.3 Déploiement**
- [ ] Variables d'environnement production
- [ ] Script de déploiement (`deploy.sh`)
- [ ] Checklist pre-deploy (migrations, env vars, DNS)
- [ ] Rollback strategy

---

## 📊 Métriques de succès

### Tests
- ✅ Coverage ≥50% (unit + integration)
- ✅ E2E critiques passent (auth, navigation, i18n, theme)
- ✅ CI green sur toutes les PR

### UX
- ✅ Navigation mobile fonctionnelle
- ✅ Tous les états vides gérés
- ✅ Loading states sur toutes les actions async
- ✅ Feedback utilisateur cohérent (toasts)

### Infrastructure
- ✅ Schéma Prisma exercices validé
- ✅ Patterns API documentés et testés
- ✅ Composants réutilisables créés

### Performance
- ✅ Lighthouse ≥90 Performance
- ✅ Lighthouse 100 SEO
- ✅ Monitoring opérationnel

---

## 🚀 Timeline estimée

| Phase | Durée estimée | Priorité |
|-------|---------------|----------|
| Phase 1 : Tests | 2-3 jours | HAUTE |
| Phase 2 : UX | 1-2 jours | HAUTE |
| Phase 3 : Infrastructure | 2 jours | MOYENNE |
| Phase 4 : Performance | 1 jour | BASSE |

**Total** : 6-8 jours

---

## 📝 Livrables

À la fin de cette baseline, nous aurons :

1. **Tests** :
   - Suite de tests unitaires (≥50% coverage)
   - Suite E2E critique (auth, navigation, i18n, theme)
   - CI/CD configuré avec gates

2. **UX** :
   - Navigation mobile complète
   - États vides partout
   - Loading states cohérents
   - Feedback utilisateur uniforme

3. **Infrastructure** :
   - Schéma DB exercices prêt
   - Patterns API documentés
   - Composants réutilisables

4. **Documentation** :
   - TESTING_PATTERNS.md
   - TECHNICAL_SPEC.md mis à jour
   - Patterns d'exercices documentés

5. **Monitoring** :
   - Sentry opérationnel
   - Vercel Analytics actif
   - Alertes configurées

---

## 🎯 Après la baseline

Une fois cette baseline complétée, nous pourrons **attaquer le développement des exercices** avec :
- Une architecture solide et testée
- Des patterns clairs et documentés
- Une UX cohérente
- Un monitoring opérationnel
- Une confiance dans la qualité du code

➡️ **Prochaine étape** : Implémenter le premier exercice (ex: "Mémoire de travail" en neuro)

---

## 📌 Notes

- **Flexibilité** : Les phases peuvent se chevaucher
- **Itératif** : Chaque tâche peut être commitée indépendamment
- **Pragmatique** : Si une tâche bloque, la skip temporairement
- **Documenté** : Chaque pattern/décision doit être documenté

---

## ✅ Checklist de validation

Avant de considérer la baseline terminée :

- [ ] Coverage ≥50%
- [ ] CI green
- [ ] E2E critiques passent
- [ ] Navigation mobile OK
- [ ] États vides partout
- [ ] Loading states cohérents
- [ ] Schéma exercices migré
- [ ] Patterns API documentés
- [ ] Composants réutilisables créés
- [ ] Lighthouse ≥90 Performance
- [ ] Sentry opérationnel
- [ ] Documentation à jour

---

**Prêt à démarrer la Phase 1 ?** 🚀
