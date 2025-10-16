#!/bin/bash

# Script pour tester les corrections Lighthouse
echo "🔍 Test des corrections Lighthouse..."

# Vérifier que le build fonctionne
echo "📦 Test du build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Échec du build"
    exit 1
fi

# Démarrer le serveur en arrière-plan
echo "🚀 Démarrage du serveur..."
npm run start &
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 5

# Tester les requêtes OPTIONS
echo "🧪 Test des requêtes OPTIONS..."

# Test OPTIONS pour /fr
echo "Test OPTIONS /fr..."
curl -X OPTIONS -I http://localhost:3000/fr

# Test OPTIONS pour /en  
echo "Test OPTIONS /en..."
curl -X OPTIONS -I http://localhost:3000/en

# Test GET pour vérifier que les locales fonctionnent
echo "Test GET /fr..."
curl -I http://localhost:3000/fr

echo "Test GET /en..."
curl -I http://localhost:3000/en

# Arrêter le serveur
kill $SERVER_PID

echo "✅ Tests terminés"
