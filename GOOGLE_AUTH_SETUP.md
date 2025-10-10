# Configuration Google Auth - Instructions de Setup

## 🚨 Configuration requise

Pour que Google Auth fonctionne, vous devez configurer les variables d'environnement suivantes.

## 📋 Étapes de configuration

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/health_db"

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Obtenir les credentials Google

1. **Aller sur Google Cloud Console** : https://console.cloud.google.com/
2. **Créer un nouveau projet** ou sélectionner un projet existant
3. **Activer l'API Google OAuth** :
   - Aller dans "APIs & Services" > "Library"
   - Rechercher "Google OAuth API"
   - Cliquer sur "Enable"
4. **Configurer l'écran de consentement OAuth** :
   - Aller dans "APIs & Services" > "OAuth consent screen"
   - Choisir "External" pour les utilisateurs externes
   - Remplir les informations requises
5. **Créer les credentials OAuth** :
   - Aller dans "APIs & Services" > "Credentials"
   - Cliquer sur "Create Credentials" > "OAuth client ID"
   - Choisir "Web application"
   - Configurer les URLs :

   **Authorized JavaScript origins :**
   ```
   http://localhost:3000
   https://healthincloud.app
   https://www.healthincloud.app
   https://app.healthincloud.app
   ```

   **Authorized redirect URIs :**
   ```
   http://localhost:3000/api/auth/callback/google
   https://healthincloud.app/api/auth/callback/google
   https://www.healthincloud.app/api/auth/callback/google
   https://app.healthincloud.app/api/auth/callback/google
   ```

6. **Copier le Client ID et Client Secret** dans votre fichier `.env.local`

### 3. Générer un secret NextAuth

```bash
# Générer un secret aléatoire
openssl rand -base64 32
```

Ou utiliser un générateur en ligne : https://generate-secret.vercel.app/32

### 4. Redémarrer le serveur de développement

```bash
npm run dev
```

## ✅ Vérification

Une fois configuré, vous devriez voir :

1. **Le bouton Google** sur les pages de connexion/inscription
2. **Pas d'erreurs** dans la console du navigateur
3. **La redirection Google** fonctionne quand vous cliquez sur le bouton

## 🔧 Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URL de callback est exactement celle configurée dans Google Cloud Console
- Respectez HTTP vs HTTPS

### Erreur "invalid_client"
- Vérifiez le Client ID et le Client Secret
- S'assurer que l'API OAuth est activée

### Le bouton Google n'apparaît pas
- Vérifiez que les variables d'environnement sont bien définies
- Redémarrez le serveur de développement

## 📚 Documentation complète

Voir `.specs/GOOGLE_AUTH.md` pour la documentation technique complète.

---

**Important :** Ne jamais commiter le fichier `.env.local` dans Git !
