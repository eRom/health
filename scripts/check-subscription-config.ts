/**
 * Script de diagnostic pour vérifier la configuration du système d'abonnement
 */

console.log('🔍 Vérification de la configuration du système d\'abonnement\n')

// Vérifier les variables d'environnement
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_MONTHLY',
  'STRIPE_PRICE_YEARLY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'CRON_SECRET',
]

let allGood = true

console.log('📋 Variables d\'environnement:\n')

for (const varName of requiredEnvVars) {
  const value = process.env[varName]
  const status = value ? '✅' : '❌'
  const preview = value ? `${value.substring(0, 20)}...` : 'NON DÉFINIE'

  console.log(`${status} ${varName}: ${preview}`)

  if (!value) {
    allGood = false
  }
}

console.log('\n📊 Résumé:\n')

if (allGood) {
  console.log('✅ Toutes les variables requises sont configurées!')
  console.log('\n🧪 Étapes de test suggérées:')
  console.log('1. Démarrer Next.js: npm run dev')
  console.log('2. Démarrer Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe')
  console.log('3. Créer un compte et tester le checkout')
  console.log('4. Utiliser la carte de test: 4242 4242 4242 4242')
} else {
  console.log('❌ Certaines variables sont manquantes!')
  console.log('\n📝 Actions requises:')
  console.log('1. Vérifier le fichier .env.local')
  console.log('2. Ajouter les variables manquantes')
  console.log('3. Relancer ce script pour vérifier')
}

// Vérifier la connexion Stripe
console.log('\n🔌 Test de connexion Stripe:\n')

async function testStripe() {
  try {
    const { stripe } = await import('../lib/stripe')

    // Tester en listant les prix
    const prices = await stripe.prices.list({ limit: 1 })
    console.log('✅ Connexion Stripe réussie!')
    console.log(`   Nombre de prix disponibles: ${prices.data.length}`)

    // Vérifier que nos prix existent
    const monthlyPrice = process.env.STRIPE_PRICE_MONTHLY
    const yearlyPrice = process.env.STRIPE_PRICE_YEARLY

    if (monthlyPrice) {
      try {
        const price = await stripe.prices.retrieve(monthlyPrice)
        console.log(`✅ Prix mensuel trouvé: ${price.unit_amount! / 100}€/${price.recurring?.interval}`)
      } catch (err) {
        console.log(`❌ Prix mensuel invalide: ${monthlyPrice}`)
      }
    }

    if (yearlyPrice) {
      try {
        const price = await stripe.prices.retrieve(yearlyPrice)
        console.log(`✅ Prix annuel trouvé: ${price.unit_amount! / 100}€/${price.recurring?.interval}`)
      } catch (err) {
        console.log(`❌ Prix annuel invalide: ${yearlyPrice}`)
      }
    }
  } catch (error: any) {
    console.log('❌ Erreur de connexion Stripe:')
    console.log(`   ${error.message}`)
  }
}

testStripe().then(() => {
  console.log('\n🎉 Diagnostic terminé!\n')
})
