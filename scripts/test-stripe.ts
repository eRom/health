/**
 * Script de test pour vérifier la configuration Stripe
 * Usage: npx tsx scripts/test-stripe.ts
 */

import Stripe from 'stripe'
import * as dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

async function testStripeConfiguration() {
  console.log('🔍 Test de la configuration Stripe...\n')

  try {
    // 1. Vérifier les variables d'environnement
    console.log('1️⃣  Vérification des variables d\'environnement...')
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_PRODUCT_ID',
      'STRIPE_PRICE_MONTHLY',
      'STRIPE_PRICE_YEARLY',
    ]

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    )

    if (missingVars.length > 0) {
      console.error('❌ Variables manquantes:', missingVars.join(', '))
      process.exit(1)
    }

    console.log('✅ Toutes les variables d\'environnement sont présentes\n')

    // 2. Vérifier la connexion à Stripe
    console.log('2️⃣  Vérification de la connexion à Stripe...')
    const account = await stripe.accounts.retrieve()
    console.log(`✅ Connecté au compte: ${account.business_profile?.name || account.id}`)
    console.log(`   Mode: ${account.id.includes('acct_') ? 'Test' : 'Live'}\n`)

    // 3. Vérifier le produit
    console.log('3️⃣  Vérification du produit...')
    const product = await stripe.products.retrieve(
      process.env.STRIPE_PRODUCT_ID!
    )
    console.log(`✅ Produit trouvé: ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   Actif: ${product.active}\n`)

    // 4. Vérifier les prix
    console.log('4️⃣  Vérification des prix...')

    const monthlyPrice = await stripe.prices.retrieve(
      process.env.STRIPE_PRICE_MONTHLY!
    )
    console.log(`✅ Prix mensuel: ${monthlyPrice.unit_amount! / 100} EUR`)
    console.log(`   ID: ${monthlyPrice.id}`)
    console.log(`   Type: ${monthlyPrice.recurring?.interval}`)
    console.log(`   Trial: ${monthlyPrice.recurring?.trial_period_days || 0} jours`)

    const yearlyPrice = await stripe.prices.retrieve(
      process.env.STRIPE_PRICE_YEARLY!
    )
    console.log(`✅ Prix annuel: ${yearlyPrice.unit_amount! / 100} EUR`)
    console.log(`   ID: ${yearlyPrice.id}`)
    console.log(`   Type: ${yearlyPrice.recurring?.interval}`)
    console.log(`   Trial: ${yearlyPrice.recurring?.trial_period_days || 0} jours\n`)

    // 5. Vérifier la configuration du webhook
    console.log('5️⃣  Vérification de la configuration webhook...')
    if (process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
      console.log('✅ STRIPE_WEBHOOK_SECRET configuré')
    } else {
      console.log('⚠️  STRIPE_WEBHOOK_SECRET non configuré')
      console.log('   Lancez: stripe listen --forward-to localhost:3000/api/webhooks/stripe')
      console.log('   Puis copiez le webhook secret dans .env\n')
    }

    // 6. Récapitulatif
    console.log('\n📊 Récapitulatif de la configuration:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Compte Stripe: ${account.business_profile?.name || account.id}`)
    console.log(`✅ Produit: ${product.name}`)
    console.log(`✅ Prix mensuel: ${monthlyPrice.unit_amount! / 100} EUR/mois`)
    console.log(`✅ Prix annuel: ${yearlyPrice.unit_amount! / 100} EUR/an`)
    console.log(
      `${process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') ? '✅' : '⚠️ '} Webhooks: ${process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') ? 'Configuré' : 'À configurer'}`
    )
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // 7. Suggestions
    console.log('💡 Prochaines étapes:')
    if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
      console.log('   1. Installer Stripe CLI: brew install stripe/stripe-cli/stripe')
      console.log('   2. Se connecter: stripe login')
      console.log(
        '   3. Lancer: stripe listen --forward-to localhost:3000/api/webhooks/stripe'
      )
      console.log('   4. Copier le webhook secret dans .env')
    } else {
      console.log('   1. Démarrer le serveur: npm run dev')
      console.log('   2. Dans un autre terminal: stripe listen --forward-to localhost:3000/api/webhooks/stripe')
      console.log('   3. Tester un paiement avec une carte test: 4242 4242 4242 4242')
    }

    console.log('\n✨ Configuration Stripe validée avec succès!')
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error)
    process.exit(1)
  }
}

testStripeConfiguration()
