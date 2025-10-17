/**
 * Script pour créer de nouveaux prix avec période d'essai de 14 jours
 * Les prix Stripe sont immutables, on doit créer de nouveaux prix
 * Usage: npx tsx scripts/update-stripe-prices-with-trial.ts
 */

import Stripe from 'stripe'
import * as dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

async function createPricesWithTrial() {
  console.log('🚀 Création de nouveaux prix avec essai gratuit de 14 jours...\n')

  try {
    const productId = process.env.STRIPE_PRODUCT_ID!

    // Créer prix mensuel avec essai
    console.log('1️⃣  Création du prix mensuel avec essai...')
    const monthlyPrice = await stripe.prices.create({
      product: productId,
      currency: 'eur',
      unit_amount: 1900, // 19.00 EUR
      recurring: {
        interval: 'month',
        trial_period_days: 14,
      },
      metadata: {
        type: 'monthly',
        has_trial: 'true',
      },
    })
    console.log(`✅ Prix mensuel créé: ${monthlyPrice.id}`)
    console.log(`   Prix: ${monthlyPrice.unit_amount! / 100} EUR/mois`)
    console.log(`   Essai gratuit: 14 jours\n`)

    // Créer prix annuel avec essai
    console.log('2️⃣  Création du prix annuel avec essai...')
    const yearlyPrice = await stripe.prices.create({
      product: productId,
      currency: 'eur',
      unit_amount: 18000, // 180.00 EUR
      recurring: {
        interval: 'year',
        trial_period_days: 14,
      },
      metadata: {
        type: 'yearly',
        discount: '20%',
        has_trial: 'true',
      },
    })
    console.log(`✅ Prix annuel créé: ${yearlyPrice.id}`)
    console.log(`   Prix: ${yearlyPrice.unit_amount! / 100} EUR/an`)
    console.log(`   Essai gratuit: 14 jours\n`)

    // Désactiver les anciens prix
    console.log('3️⃣  Désactivation des anciens prix...')

    const oldMonthlyId = process.env.STRIPE_PRICE_MONTHLY!
    const oldYearlyId = process.env.STRIPE_PRICE_YEARLY!

    await stripe.prices.update(oldMonthlyId, { active: false })
    console.log(`✅ Ancien prix mensuel désactivé: ${oldMonthlyId}`)

    await stripe.prices.update(oldYearlyId, { active: false })
    console.log(`✅ Ancien prix annuel désactivé: ${oldYearlyId}\n`)

    // Instructions finales
    console.log('📋 Mettez à jour votre fichier .env avec ces nouvelles valeurs:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`STRIPE_PRICE_MONTHLY="${monthlyPrice.id}"`)
    console.log(`STRIPE_PRICE_YEARLY="${yearlyPrice.id}"`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('✨ Prix avec essai gratuit créés avec succès!')
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

createPricesWithTrial()
