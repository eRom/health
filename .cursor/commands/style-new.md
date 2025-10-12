---
description: Ajouter un nouveau style de thème à l'application
globs:
  - "types/theme.ts"
  - "lib/theme-config.ts"
  - "app/globals.css"
  - "app/theme-style-script.tsx"
  - "app/[locale]/layout.tsx"
---

# Ajouter un nouveau style de thème

## Informations requises

Demander à l'utilisateur les informations suivantes pour le nouveau style :

### 1. Identification du style
- **Nom du style** (kebab-case, ex: "ocean-blue", "forest-green")
- **Style CSS** (Copier-coller de CSS Variables)


## Étapes à suivre

### 1. Mettre à jour `types/theme.ts`

**Localisation** : Ligne ~9
**Action** : Ajouter le nouveau style au tableau `THEME_STYLES`

```typescript
export const THEME_STYLES = ['default', 'amber', 'perpetuity', 'notebook', 'NOUVEAU_STYLE'] as const
```

### 2. Mettre à jour `lib/theme-config.ts`

**Localisation** : Ligne ~13-54 dans `THEME_STYLES_CONFIG`
**Action** : Ajouter la configuration du style

```typescript
{
  value: 'NOUVEAU_STYLE',
  label: 'LABEL',
  description: 'DESCRIPTION',
  colors: {
    light: ['#...', '#...', '#...', '#...'],
    dark: ['#...', '#...', '#...', '#...'],
  },
},
```

### 3. Mettre à jour `app/globals.css`

**Localisation** : Après les styles existants (~ligne 600)
**Action** : Ajouter les sections CSS complètes pour light et dark mode

#### Template CSS Light Mode :
```css
/* NOUVEAU_STYLE Style - Light Mode */
:root[data-style="NOUVEAU_STYLE"] {
  CSS Variables
}
```

#### Template CSS Dark Mode :
```css
/* NOUVEAU_STYLE Style - Dark Mode */
:root[data-style="NOUVEAU_STYLE"].dark {
  CSS Variables
}
```

### 4. Mettre à jour `app/theme-style-script.tsx`

**Localisation** : Ligne ~18
**Action** : Ajouter le nouveau style au tableau `validStyles`

```typescript
const validStyles = ['default', 'amber', 'perpetuity', 'notebook', 'NOUVEAU_STYLE'];
```

### 5. Mettre à jour `app/[locale]/layout.tsx` (si nouvelles polices)

**Localisation** : Ligne ~174
**Action** : Ajouter les polices Google Fonts si nécessaire

Format à ajouter dans l'URL existante :
```
&family=Nouvelle+Police:wght@300..700
```

Exemple complet :
```html
<link
  href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Fira+Code:wght@300..700&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Merriweather:wght@300;400;700;900&family=Merriweather+Sans:wght@300..800&family=Source+Code+Pro:wght@200..900&family=Source+Serif+4:opsz,wght@8..60,200..900&family=Nouvelle+Police:wght@300..700&display=swap"
  rel="stylesheet"
/>
```

## Checklist de validation

Après avoir effectué toutes les modifications, vérifier :

- [ ] **Types mis à jour** : `types/theme.ts` contient le nouveau style
- [ ] **Config mise à jour** : `lib/theme-config.ts` contient la configuration complète
- [ ] **CSS ajouté** : `app/globals.css` contient les sections light et dark mode
- [ ] **Script mis à jour** : `app/theme-style-script.tsx` inclut le nouveau style
- [ ] **Polices chargées** : `app/[locale]/layout.tsx` contient les nouvelles polices (si nécessaire)
- [ ] **Testé en light mode** : Le style s'applique correctement en mode clair
- [ ] **Testé en dark mode** : Le style s'applique correctement en mode sombre
- [ ] **Rendu mobile** : Vérifier l'affichage sur mobile
- [ ] **Console propre** : Aucune erreur JavaScript liée au thème

## Rappels importants

### Format des couleurs
- Utiliser le format `oklch()` pour toutes les couleurs CSS
- Les couleurs de preview peuvent être en hex pour faciliter la saisie
- Générer automatiquement une palette cohérente si non fournie

### Polices Google Fonts
- Vérifier que les polices sont disponibles sur Google Fonts
- Utiliser le format correct pour les poids de police
- Ajouter `display=swap` pour optimiser le chargement

### Tests recommandés
1. Basculer entre les différents styles existants
2. Tester le mode sombre/clair avec le nouveau style
3. Vérifier l'affichage sur différentes tailles d'écran
4. Contrôler la console pour d'éventuelles erreurs

## Exemples de styles existants

### Default Style
- **Polices** : Merriweather Sans, Merriweather, Fira Code
- **Ambiance** : Moderne et épuré, ombres douces
- **Couleurs** : Bleu (#7398E1) avec tons neutres

### Amber Style  
- **Polices** : Inter, Source Serif 4, JetBrains Mono
- **Ambiance** : Chaleureux, contraste élevé
- **Couleurs** : Orange/ambre (#F59E0B) avec tons neutres

### Perpetuity Style
- **Polices** : Source Code Pro (monospace)
- **Ambiance** : Futuriste, minimaliste
- **Couleurs** : Cyan/bleu (#0EA5E9) avec palette froide

### Notebook Style
- **Polices** : Architects Daughter, Times New Roman, Courier New
- **Ambiance** : Carnet manuscrit, tons neutres
- **Couleurs** : Gris (#7C7C7C) avec ombres subtiles
