#!/bin/bash

# Script de test pour le système de verrouillage des inscriptions
# Usage: ./test-registration-lock.sh

echo "🧪 Test du système de verrouillage des inscriptions"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester une URL
test_url() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Test: $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected_status)"
    fi
}

# Vérifier que le serveur est démarré
echo "Vérification que le serveur de développement est démarré..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Le serveur de développement n'est pas démarré${NC}"
    echo "Démarrez le serveur avec: npm run dev"
    exit 1
fi

echo -e "${GREEN}✓ Serveur démarré${NC}"
echo ""

# Test 1: Vérifier l'endpoint de statut d'inscription
echo "1. Test de l'endpoint de statut d'inscription"
test_url "http://localhost:3000/api/registration-status" "200" "Statut d'inscription"

# Test 2: Vérifier que la page d'inscription est accessible
echo ""
echo "2. Test de l'accessibilité des pages"
test_url "http://localhost:3000/fr/auth/signup" "200" "Page d'inscription FR"
test_url "http://localhost:3000/en/auth/signup" "200" "Page d'inscription EN"

# Test 3: Vérifier que la page de connexion est accessible
test_url "http://localhost:3000/fr/auth/login" "200" "Page de connexion FR"
test_url "http://localhost:3000/en/auth/login" "200" "Page de connexion EN"

echo ""
echo "3. Instructions pour tester manuellement:"
echo -e "${YELLOW}Pour tester le verrouillage des inscriptions:${NC}"
echo "1. Ajoutez DISABLE_REGISTRATION=true à votre fichier .env.local"
echo "2. Redémarrez le serveur de développement"
echo "3. Essayez de créer un compte via le formulaire d'inscription"
echo "4. Essayez de vous connecter avec Google (nouveau compte)"
echo "5. Vérifiez qu'un utilisateur existant peut toujours se connecter"

echo ""
echo "4. Pour déverrouiller les inscriptions:"
echo "   - Supprimez DISABLE_REGISTRATION de .env.local"
echo "   - Ou définissez DISABLE_REGISTRATION=false"
echo "   - Redémarrez le serveur"

echo ""
echo -e "${GREEN}✅ Tests automatisés terminés${NC}"
echo "Consultez les instructions ci-dessus pour les tests manuels"
