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
Attention !!! Ne me dis pas tout ce que tu vas faire, demande juste les infos obligatoires !!! 


## Informations requises

Demander à l'utilisateur les informations suivantes pour le nouveau style :

### 1. Identification du style
- **Nom du style** (kebab-case, ex: "ocean-blue", "forest-green")
- **Style CSS** (Copier-coller de CSS Variables) par exemple : 
```
:root {
  --background: oklch(0.9821 0 0);
  --foreground: oklch(0.3485 0 0);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.3485 0 0);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.3485 0 0);
  --primary: oklch(0.4891 0 0);
  --primary-foreground: oklch(0.9551 0 0);
  --secondary: oklch(0.9006 0 0);
  --secondary-foreground: oklch(0.3485 0 0);
  --muted: oklch(0.9158 0 0);
  --muted-foreground: oklch(0.4313 0 0);
  --accent: oklch(0.9354 0.0456 94.8549);
  --accent-foreground: oklch(0.4015 0.0436 37.9587);
  --destructive: oklch(0.6627 0.0978 20.0041);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.5538 0.0025 17.2320);
  --input: oklch(1.0000 0 0);
  --ring: oklch(0.7058 0 0);
  --chart-1: oklch(0.3211 0 0);
  --chart-2: oklch(0.4495 0 0);
  --chart-3: oklch(0.5693 0 0);
  --chart-4: oklch(0.6830 0 0);
  --chart-5: oklch(0.7921 0 0);
  --sidebar: oklch(0.9551 0 0);
  --sidebar-foreground: oklch(0.3485 0 0);
  --sidebar-primary: oklch(0.4891 0 0);
  --sidebar-primary-foreground: oklch(0.9551 0 0);
  --sidebar-accent: oklch(0.9354 0.0456 94.8549);
  --sidebar-accent-foreground: oklch(0.4015 0.0436 37.9587);
  --sidebar-border: oklch(0.8078 0 0);
  --sidebar-ring: oklch(0.7058 0 0);
  --font-sans: Architects Daughter, sans-serif;
  --font-serif: "Times New Roman", Times, serif;
  --font-mono: "Courier New", Courier, monospace;
  --radius: 0.625rem;
  --shadow-x: 1px;
  --shadow-y: 4px;
  --shadow-blur: 5px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.03;
  --shadow-color: #000000;
  --shadow-2xs: 1px 4px 5px 0px hsl(0 0% 0% / 0.01);
  --shadow-xs: 1px 4px 5px 0px hsl(0 0% 0% / 0.01);
  --shadow-sm: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03);
  --shadow: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03);
  --shadow-md: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03);
  --shadow-lg: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03);
  --shadow-xl: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03);
  --shadow-2xl: 1px 4px 5px 0px hsl(0 0% 0% / 0.07);
  --tracking-normal: 0.5px;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.2891 0 0);
  --foreground: oklch(0.8945 0 0);
  --card: oklch(0.3211 0 0);
  --card-foreground: oklch(0.8945 0 0);
  --popover: oklch(0.3211 0 0);
  --popover-foreground: oklch(0.8945 0 0);
  --primary: oklch(0.7572 0 0);
  --primary-foreground: oklch(0.2891 0 0);
  --secondary: oklch(0.4676 0 0);
  --secondary-foreground: oklch(0.8078 0 0);
  --muted: oklch(0.3904 0 0);
  --muted-foreground: oklch(0.7058 0 0);
  --accent: oklch(0.9067 0 0);
  --accent-foreground: oklch(0.3211 0 0);
  --destructive: oklch(0.7915 0.0491 18.2410);
  --destructive-foreground: oklch(0.2891 0 0);
  --border: oklch(0.4276 0 0);
  --input: oklch(0.3211 0 0);
  --ring: oklch(0.8078 0 0);
  --chart-1: oklch(0.9521 0 0);
  --chart-2: oklch(0.8576 0 0);
  --chart-3: oklch(0.7572 0 0);
  --chart-4: oklch(0.6534 0 0);
  --chart-5: oklch(0.5452 0 0);
  --sidebar: oklch(0.2478 0 0);
  --sidebar-foreground: oklch(0.8945 0 0);
  --sidebar-primary: oklch(0.7572 0 0);
  --sidebar-primary-foreground: oklch(0.2478 0 0);
  --sidebar-accent: oklch(0.9067 0 0);
  --sidebar-accent-foreground: oklch(0.3211 0 0);
  --sidebar-border: oklch(0.4276 0 0);
  --sidebar-ring: oklch(0.8078 0 0);
  --font-sans: Architects Daughter, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: "Fira Code", "Courier New", monospace;
  --radius: 0.625rem;
  --shadow-x: 1px;
  --shadow-y: 4px;
  --shadow-blur: 5px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.03;
  --shadow-color: #000000;
  --shadow-2xs: 1px 4px 5px 0px hsl(0 0% 0% / 0.01);
  --shadow-xs: 1px 4px 5px 0px hsl(0 0% 0% / 0.01);
  --shadow-sm: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03);
  --shadow: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03);
  --shadow-md: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03);
  --shadow-lg: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03);
  --shadow-xl: 1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03);
  --shadow-2xl: 1px 4px 5px 0px hsl(0 0% 0% / 0.07);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

body {
  letter-spacing: var(--tracking-normal);
}
```

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

### 6. Mise à jour des préférences `app/actions/update-preferences.ts`
**Action** : Ajouter le nouveau thème 

```typescript
.enum(["default", "amber", "perpetuity", "notebook", "bubblegum", "NOUVEAU_STYLE"])
```

```typescript
themeStyle?: "default" | "amber" | "perpetuity" | "notebook" | "bubblegum" | "NOUVEAU_STYLE";
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
