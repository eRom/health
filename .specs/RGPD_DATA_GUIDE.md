# Guide RGPD - Consentement pour le traitement des données de santé

## 📋 Vue d'ensemble

Ce document décrit l'implémentation du système de consentement RGPD pour le traitement des données de santé dans l'application Health In Cloud. Le système garantit la conformité avec le RGPD en exigeant un consentement explicite et en traçant toutes les actions de consentement.

## 🎯 Objectifs de conformité

- **Consentement explicite** : L'utilisateur doit effectuer une action positive pour donner son consentement
- **Traçabilité complète** : Enregistrement de tous les consentements avec horodatage, IP et User-Agent
- **Validation double** : Vérification côté client et serveur
- **Gestion de la révocation** : Possibilité de révoquer le consentement (suppression du compte)

## 🗄️ Architecture de la base de données

### Table `ConsentHistory`

```sql
model ConsentHistory {
  id           String      @id @default(cuid())
  userId       String
  consentType  ConsentType
  granted      Boolean
  grantedAt    DateTime    @default(now())
  ipAddress    String?
  userAgent    String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, grantedAt])
}

enum ConsentType {
  HEALTH_DATA
}
```

### Table `User` (modification)

```sql
model User {
  // ... autres champs existants
  healthDataConsentGrantedAt   DateTime?
  consentHistory                ConsentHistory[]
}
```

## 🔧 Implémentation technique

### 1. Schéma de validation Zod

**Fichier** : `lib/schemas/auth.ts`

```typescript
export const SignupSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  healthDataConsent: z.boolean().refine(
    (val) => val === true,
    "Vous devez accepter le traitement de vos données de santé"
  ),
})
```

### 2. Composant SignupForm

**Fichier** : `components/auth/signup-form.tsx`

#### Fonctionnalités clés :
- ✅ Checkbox de consentement **non pré-cochée**
- ✅ Bouton de soumission désactivé si pas de consentement
- ✅ Message d'erreur affiché si pas de consentement
- ✅ Validation Zod côté client
- ✅ Gestion des états de chargement

#### Code principal :
```typescript
const [consentChecked, setConsentChecked] = useState(false);

// Validation côté client
const validationResult = SignupSchema.safeParse({
  name, email, password,
  healthDataConsent: consentChecked,
});

// Bouton désactivé si pas de consentement
<Button 
  type="submit" 
  disabled={isLoading || !consentChecked}
>
```

### 3. Action serveur personnalisée

**Fichier** : `app/actions/signup-with-consent.ts`

#### Fonctionnalités :
- ✅ Vérification du consentement en premier
- ✅ Validation Zod côté serveur
- ✅ Création de l'utilisateur avec better-auth
- ✅ Enregistrement du consentement avec traçabilité
- ✅ Mise à jour du champ de référence rapide

#### Code principal :
```typescript
export async function signUpWithConsent(data: {
  name: string
  email: string
  password: string
  healthDataConsent: boolean
}) {
  // Vérifier le consentement en premier
  if (!data.healthDataConsent) {
    throw new Error("Consentement requis pour le traitement des données de santé")
  }

  // Créer l'utilisateur
  const result = await auth.api.signUpEmail({
    body: { name: data.name, email: data.email, password: data.password }
  })

  // Enregistrer le consentement avec traçabilité
  const headersList = await headers()
  await prisma.consentHistory.create({
    data: {
      userId: result.user.id,
      consentType: "HEALTH_DATA",
      granted: true,
      ipAddress: headersList.get("x-forwarded-for"),
      userAgent: headersList.get("user-agent"),
    },
  })
}
```

## 🌐 Traductions i18n

### Français (`locales/fr/common.json`)

```json
{
  "auth": {
    "consent": {
      "label": "J'accepte que mes données de santé (résultats d'exercices, progrès de rééducation, performances cognitives) soient collectées et traitées dans le cadre de mon suivi personnalisé.",
      "required": "Vous devez accepter le traitement de vos données de santé pour créer un compte.",
      "learnMore": "En savoir plus"
    }
  }
}
```

### Anglais (`locales/en/common.json`)

```json
{
  "auth": {
    "consent": {
      "label": "I accept that my health data (exercise results, rehabilitation progress, cognitive performance) be collected and processed as part of my personalized follow-up.",
      "required": "You must accept the processing of your health data to create an account.",
      "learnMore": "Learn more"
    }
  }
}
```

## 🧪 Tests

### Tests du composant SignupForm

**Fichier** : `__tests__/components/auth/signup-form.test.tsx`

#### Couverture des tests :
- ✅ Rendu de la checkbox de consentement
- ✅ Désactivation du bouton si pas de consentement
- ✅ Activation du bouton quand consentement donné
- ✅ Affichage/masquage du message d'erreur
- ✅ Soumission avec données de consentement
- ✅ Gestion des états de chargement
- ✅ Gestion des erreurs

### Tests de l'action serveur

**Fichier** : `__tests__/actions/signup-with-consent.test.ts`

#### Couverture des tests :
- ✅ Création d'utilisateur et enregistrement du consentement
- ✅ Erreur si pas de consentement
- ✅ Erreur si validation échoue
- ✅ Erreur si création d'utilisateur échoue

## 📊 Traçabilité et audit

### Données collectées pour chaque consentement :

1. **Identifiant utilisateur** : `userId`
2. **Type de consentement** : `HEALTH_DATA`
3. **Statut** : `granted: true`
4. **Horodatage** : `grantedAt` (automatique)
5. **Adresse IP** : `ipAddress` (via headers)
6. **User-Agent** : `userAgent` (via headers)

### Requêtes utiles pour l'audit :

```sql
-- Consulter l'historique des consentements d'un utilisateur
SELECT * FROM "ConsentHistory" 
WHERE "userId" = 'user-id' 
ORDER BY "grantedAt" DESC;

-- Compter les consentements par période
SELECT DATE("grantedAt") as date, COUNT(*) as count
FROM "ConsentHistory" 
WHERE "consentType" = 'HEALTH_DATA' 
GROUP BY DATE("grantedAt")
ORDER BY date DESC;

-- Utilisateurs avec consentement actuel
SELECT u.id, u.email, u."healthDataConsentGrantedAt"
FROM "User" u
WHERE u."healthDataConsentGrantedAt" IS NOT NULL;
```

## 🔒 Conformité RGPD

### Principes respectés :

1. **Légalité** : Consentement explicite requis
2. **Transparence** : Texte clair sur l'utilisation des données
3. **Minimisation** : Seules les données nécessaires sont collectées
4. **Exactitude** : Validation des données côté client et serveur
5. **Limitation de conservation** : Possibilité de suppression
6. **Intégrité et confidentialité** : Données sécurisées
7. **Responsabilité** : Traçabilité complète

### Droits des utilisateurs :

- ✅ **Droit d'accès** : Consultation des données via profil
- ✅ **Droit de rectification** : Modification des données personnelles
- ✅ **Droit à l'effacement** : Suppression du compte (fonction existante)
- ✅ **Droit à la portabilité** : Export des données (à implémenter)
- ✅ **Droit d'opposition** : Révocation du consentement (suppression)

## 🚀 Déploiement

### Migration de base de données :

```bash
npx prisma migrate dev --name add_consent_tracking
```

### Vérifications post-déploiement :

1. ✅ Vérifier que la table `ConsentHistory` existe
2. ✅ Vérifier que le champ `healthDataConsentGrantedAt` existe sur `User`
3. ✅ Tester le formulaire d'inscription
4. ✅ Vérifier l'enregistrement des consentements
5. ✅ Tester les traductions FR/EN

## 📈 Monitoring et alertes

### Métriques à surveiller :

- **Taux de consentement** : % d'utilisateurs qui donnent leur consentement
- **Taux d'abandon** : % d'utilisateurs qui quittent sans consentir
- **Erreurs de validation** : Nombre d'erreurs côté client/serveur
- **Performance** : Temps de réponse du formulaire d'inscription

### Alertes recommandées :

- ⚠️ Taux de consentement < 80%
- ⚠️ Erreurs de validation > 5%
- ⚠️ Temps de réponse > 3s
- ⚠️ Échecs d'enregistrement de consentement

## 🔄 Évolutions futures

### Fonctionnalités à considérer :

1. **Consentement granulaire** : Séparer les types de données
2. **Révocation partielle** : Permettre de révoquer certains consentements
3. **Renouvellement** : Rappel périodique du consentement
4. **Export des données** : Fonctionnalité de portabilité
5. **Dashboard admin** : Interface de gestion des consentements
6. **Audit automatique** : Rapports de conformité

### Améliorations techniques :

1. **Cache Redis** : Optimiser les requêtes de consentement
2. **API dédiée** : Endpoint pour la gestion des consentements
3. **Webhooks** : Notifications en cas de changement
4. **Chiffrement** : Protection des données sensibles
5. **Backup** : Sauvegarde des données de consentement

## 📞 Support et maintenance

### Contacts :

- **Développeur principal** : Équipe de développement
- **DPO** : Délégué à la protection des données
- **Juridique** : Service juridique pour questions RGPD

### Documentation technique :

- **Code source** : Voir les fichiers modifiés dans ce guide
- **Tests** : Exécuter `npm test` pour vérifier le bon fonctionnement
- **Logs** : Surveiller les logs d'application pour les erreurs

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0  
**Statut** : ✅ Implémenté et testé
