# Système de Verrouillage des Inscriptions

Ce système permet de désactiver temporairement la création de nouveaux comptes tout en maintenant l'accès pour les utilisateurs existants et en gardant les formulaires visibles pour la démonstration.

## 🚀 Fonctionnalités

- ✅ **Verrouillage sécurisé côté serveur** : Impossible de contourner via manipulation frontend
- ✅ **Support OAuth Google** : Nouveaux utilisateurs Google bloqués, utilisateurs existants autorisés
- ✅ **Formulaires en mode démo** : Interface visible et testable sans création réelle de compte
- ✅ **Messages informatifs** : Interface utilisateur claire sur le statut des inscriptions
- ✅ **Contrôle centralisé** : Une seule variable d'environnement pour tout contrôler

## ⚙️ Configuration

### Variable d'environnement

Ajoutez cette variable à votre fichier `.env.local` :

```bash
# Registration Lock
# Set to "true" to disable new user registrations (existing users can still sign in)
DISABLE_REGISTRATION=false
```

### Activation/Désactivation

**Pour verrouiller les inscriptions :**
```bash
DISABLE_REGISTRATION=true
```

**Pour déverrouiller les inscriptions :**
```bash
DISABLE_REGISTRATION=false
# ou supprimer la variable complètement
```

## 🔧 Implémentation Technique

### Composants modifiés

1. **`/lib/registration-lock.ts`** - Utilitaire de vérification
2. **`/app/actions/signup-with-consent.ts`** - Blocage inscription email
3. **`/lib/google-oauth-lock.ts`** - Middleware pour OAuth Google
4. **`/middleware.ts`** - Intégration du middleware OAuth
5. **`/app/api/registration-status/route.ts`** - Endpoint API de statut
6. **`/components/auth/signup-form.tsx`** - Interface utilisateur améliorée
7. **`/components/auth/google-button.tsx`** - Gestion d'erreur Google

### Sécurité

- **Vérification côté serveur** : Toutes les vérifications sont effectuées côté serveur
- **Pas de fuite d'information** : Messages génériques sans révéler si un email existe
- **OAuth sécurisé** : Vérification de l'existence de l'utilisateur avant autorisation
- **Fallback sécurisé** : En cas d'erreur, le système bloque par défaut

## 🧪 Tests

### Test automatisé

Exécutez le script de test :

```bash
./scripts/test-registration-lock.sh
```

### Tests manuels

1. **Test avec inscriptions ouvertes** :
   - `DISABLE_REGISTRATION=false` ou variable non définie
   - Vérifier que les inscriptions fonctionnent normalement

2. **Test avec inscriptions fermées** :
   - `DISABLE_REGISTRATION=true`
   - Essayer de créer un compte email → doit afficher l'erreur
   - Essayer de se connecter avec Google (nouveau compte) → doit être bloqué
   - Se connecter avec Google (compte existant) → doit fonctionner
   - Vérifier que les formulaires restent visibles et interactifs

## 📱 Interface Utilisateur

### Messages affichés

**Français :**
- "Les inscriptions sont temporairement fermées"
- "Vous pouvez toujours explorer l'interface. Les utilisateurs existants peuvent se connecter normalement."

**Anglais :**
- "Registrations are temporarily closed"
- "You can still explore the interface. Existing users can sign in normally."

### Comportement des formulaires

- **Formulaires visibles** : Restent entièrement visibles et interactifs
- **Validation côté client** : Fonctionne normalement
- **Soumission bloquée** : Erreur affichée côté serveur
- **Messages d'erreur** : Affichés dans les zones d'erreur existantes

## 🚨 Déploiement en Production

### Vercel

1. Ajoutez la variable d'environnement dans Vercel :
   ```
   DISABLE_REGISTRATION=true
   ```

2. Redéployez l'application

### Autres plateformes

1. Ajoutez la variable d'environnement selon votre plateforme
2. Redémarrez l'application

## 🔍 Dépannage

### Problèmes courants

1. **Les inscriptions ne se bloquent pas** :
   - Vérifiez que `DISABLE_REGISTRATION=true` est bien défini
   - Redémarrez le serveur de développement
   - Vérifiez les logs pour les erreurs

2. **Erreur "hook.handler is not a function"** :
   - Cette erreur a été corrigée en utilisant un middleware personnalisé
   - Vérifiez que vous utilisez la dernière version du code

3. **OAuth Google ne fonctionne pas** :
   - Vérifiez que les credentials Google sont correctement configurés
   - Vérifiez que le middleware OAuth est bien intégré

### Logs utiles

```bash
# Vérifier le statut d'inscription
curl http://localhost:3000/api/registration-status

# Vérifier les logs du serveur
npm run dev
```

## 📋 Checklist de Déploiement

- [ ] Variable `DISABLE_REGISTRATION=true` définie en production
- [ ] Tests manuels effectués
- [ ] Vérification que les utilisateurs existants peuvent se connecter
- [ ] Vérification que les nouveaux utilisateurs sont bloqués
- [ ] Interface utilisateur testée
- [ ] Logs vérifiés pour les erreurs

## 🤝 Support

Pour toute question ou problème avec le système de verrouillage :

1. Vérifiez les logs du serveur
2. Testez avec le script automatisé
3. Consultez cette documentation
4. Contactez l'équipe de développement si nécessaire
