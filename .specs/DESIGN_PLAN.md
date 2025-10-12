
## Analyse et implémentation d'un système de gestion de thèmes avancé pour Next.js avec shadcn/ui

### Contexte
Je veux implémenter un système complet de gestion de thèmes dans mon application Next.js utilisant shadcn/ui qui permettra :
- **Gestion des modes** : Jour / Nuit / System (via next-themes)
- **Gestion des styles** : Différents styles de couleurs comme Default, amber, perpetuity, etc. (inspiré de tweakcn.com)
- **Configuration par défaut** : Theme System + Style Default
- **Interface utilisateur** : Page profil/préférences avec sélecteurs
- **Changements en temps réel** : Application immédiate des modifications

### Mission 1 : Analyse du système actuel

**Analyser et documenter :**

1. **Structure actuelle des thèmes**
   - Identifier les fichiers CSS/SCSS existants contenant les variables de thème
   - Localiser l'usage actuel de next-themes (si présent)
   - Vérifier la configuration Tailwind existante
   - Lister les composants shadcn/ui utilisés

2. **Architecture actuelle**
   - Examiner le layout principal
   - Identifier les providers existants
   - Vérifier la gestion d'état actuelle (Zustand, Context, DB, LocalStorage, etc.)
   - Analyser la structure des pages de profil/préférences existantes

3. **Variables CSS actuelles**
   - Documenter les variables CSS custom properties existantes
   - Identifier les conflits potentiels avec le nouveau système
   - Vérifier l'utilisation des variables shadcn/ui standards

### Mission 2 : Planification de l'implémentation

**Créer un plan détaillé pour :**

1. **Installation et configuration des dépendances**
   Si vous avez besoin d'installer des dépendances, faites-le.

2. **Structure de fichiers à créer/modifier**
   ```
   /app
     /globals.css (ou modification)
   /components
     /theme
       /theme-provider.tsx
       /theme-toggle.tsx
       /style-selector.tsx
   /lib
     /theme-config.ts
   /hooks
     /use-theme-style.ts
   /types
     /theme.ts
   ```

3. **Système de variables CSS multi-styles**
   - Organiser les variables par style (default, amber, perpetuity, etc.)
   - Implémenter le système avec les classes CSS dynamiques
   - Gérer la compatibilité light/dark pour chaque style

4. **Architecture des composants**
   ```typescript
   // Types à définir
   type ThemeMode = 'light' | 'dark' | 'system'
   type ThemeStyle = 'default' | 'amber' | 'perpetuity' | ...
   
   // Hooks personnalisés
   useThemeStyle() // Gestion du style indépendamment du mode
   
   // Providers
   ThemeStyleProvider // Wrappe ThemeProvider de next-themes
   
   // Composants UI
   ThemeModeToggle // Sélecteur Jour/Nuit/System
   ThemeStyleSelector // Sélecteur de styles
   ```

5. **Gestion de l'état et persistance**
   - LocalStorage pour sauvegarder les préférences
   - Synchronisation entre onglets
   - Valeurs par défaut et fallbacks

6. **Integration dans les pages**
   - Modification du layout principal
   - Création/modification de la page profil/préférences
   - Gestion du rendu côté serveur (SSR)

### Mission 3 : Template CSS de référence

**Utiliser cette structure comme base :**

```css
/* Style: default */
:root {
  /* Variables fournies dans votre exemple */
}

.dark {
  /* Variables dark mode fournies */
}

/* Style: amber */
:root[data-style="amber"] {
  /* Nouvelles variables pour le style amber */
}

:root[data-style="amber"].dark {
  /* Variables amber en mode sombre */
}

/* Pattern à répéter pour chaque style */
```

### Mission 4 : Priorités d'implémentation

1. **Phase 1** : Configuration de base avec next-themes
2. **Phase 2** : Système de styles CSS avec variables
3. **Phase 3** : Composants de sélection et provider custom
4. **Phase 4** : Interface utilisateur dans profil/préférences
5. **Phase 5** : Tests et optimisations

### Questions spécifiques à analyser :

1. Y a-t-il déjà une implémentation de next-themes ?
2. Quel est le système de gestion d'état utilisé ?
3. Comment sont structurées les pages de profil actuellement ?
4. Y a-t-il des contraintes SSR spécifiques ?
5. Quels composants shadcn/ui sont déjà utilisés ?

### Livrables attendus :

1. **Rapport d'analyse** du système actuel
2. **Plan d'implémentation** détaillé avec étapes
3. **Structure de fichiers** complète
4. **Code de base** pour les composants principaux
5. **Guide de migration** depuis le système actuel

Commence par analyser le système actuel et fournis-moi un rapport détaillé avant de procéder à l'implémentation.

